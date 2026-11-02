# Stophy CLI installer for Windows
# Usage: irm https://stophy.dev/install.ps1 | iex
#
# When it finds an agent folder in your home directory, it also adds the
# Stophy skills for your agents.
#
# Environment variables:
#   STOPHY_INSTALL_DIR  - Override install directory
#   STOPHY_VERSION      - Install a specific version (default: latest)

$ErrorActionPreference = "Stop"

$Repo = "stophydotdev/stophy"
$BinaryName = "stophy"
$AgentDirs = @(".claude", ".codex", ".cursor", ".gemini", ".config\opencode")
$InitArgs = @("init", "--all", "--skip-auth", "--skip-mcp")

function Write-Info($msg) { Write-Host "info   " -ForegroundColor Blue -NoNewline; Write-Host $msg }
function Write-Warn($msg) { Write-Host "warn   " -ForegroundColor Yellow -NoNewline; Write-Host $msg }
function Write-Err($msg)  { Write-Host "error  " -ForegroundColor Red -NoNewline; Write-Host $msg }
function Write-Ok($msg)   { Write-Host "success" -ForegroundColor Green -NoNewline; Write-Host " $msg" }

function Get-LatestVersion {
    $url = "https://api.github.com/repos/$Repo/releases/latest"
    $release = Invoke-RestMethod -Uri $url -Headers @{ "User-Agent" = "stophy-installer" }
    return $release.tag_name -replace "^v", ""
}

function Get-Platform {
    $arch = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture
    switch ($arch) {
        "X64"   { return "x64" }
        "Arm64" { return "arm64" }
        default { throw "Unsupported architecture: $arch" }
    }
}

function Add-AgentSkills($installDir) {
    $hasAgent = $AgentDirs | Where-Object { Test-Path (Join-Path $env:USERPROFILE $_) }
    if (-not $hasAgent) {
        Write-Host "  Skills  not added, no agent folder found. Run 'stophy $($InitArgs -join ' ')' once you use an agent."
        return
    }
    $ErrorActionPreference = "Continue"
    $log = & "$installDir\stophy.exe" @InitArgs 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Skills  added for your agents"
    } else {
        Write-Host $log
        Write-Host "  Skills  not added. Run 'stophy $($InitArgs -join ' ')' to retry."
    }
}

function Install-Stophy {
    $arch = Get-Platform
    Write-Info "Detected platform: windows-$arch"

    if ($env:STOPHY_VERSION) {
        $version = $env:STOPHY_VERSION -replace "^v", ""
        Write-Info "Installing specified version: v$version"
    } else {
        Write-Info "Fetching latest version..."
        $version = Get-LatestVersion
        Write-Info "Latest version: v$version"
    }

    if ($env:STOPHY_INSTALL_DIR) {
        $installDir = $env:STOPHY_INSTALL_DIR
    } else {
        $installDir = "$env:LOCALAPPDATA\stophy\bin"
    }

    if (-not (Test-Path $installDir)) {
        New-Item -ItemType Directory -Path $installDir -Force | Out-Null
    }

    $binaryFile = "$BinaryName-windows-$arch.exe"
    $baseUrl = "https://github.com/$Repo/releases/download/v$version"
    $binaryUrl = "$baseUrl/$binaryFile"
    $checksumUrl = "$baseUrl/checksums.txt"

    $tmpDir = Join-Path ([System.IO.Path]::GetTempPath()) "stophy-install-$(Get-Random)"
    New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null

    try {
        Write-Info "Downloading stophy v$version for windows-$arch..."
        Invoke-WebRequest -Uri $binaryUrl -OutFile "$tmpDir\stophy.exe" -UseBasicParsing

        Write-Info "Downloading checksums..."
        Invoke-WebRequest -Uri $checksumUrl -OutFile "$tmpDir\checksums.txt" -UseBasicParsing

        $checksums = Get-Content "$tmpDir\checksums.txt"
        $expectedLine = $checksums | Where-Object { $_ -match $binaryFile }
        if ($expectedLine) {
            $expectedHash = ($expectedLine -split "\s+")[0]
            $actualHash = (Get-FileHash "$tmpDir\stophy.exe" -Algorithm SHA256).Hash.ToLower()
            if ($actualHash -ne $expectedHash) {
                Write-Err "Checksum mismatch!"
                Write-Err "  Expected: $expectedHash"
                Write-Err "  Actual:   $actualHash"
                exit 1
            }
            Write-Info "Checksum verified."
        } else {
            Write-Warn "No checksum found for $binaryFile — skipping verification"
        }

        Write-Info "Installing to $installDir\stophy.exe..."
        Copy-Item "$tmpDir\stophy.exe" "$installDir\stophy.exe" -Force

        $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
        if ($userPath -notlike "*$installDir*") {
            [Environment]::SetEnvironmentVariable("Path", "$installDir;$userPath", "User")
            Write-Warn "$installDir added to your PATH. Restart your terminal for changes to take effect."
        }

        Write-Host ""
        Write-Ok "Stophy CLI v$version installed."
        Write-Host ""
        Write-Host "  Binary  $installDir\stophy.exe"
        Add-AgentSkills $installDir
        Write-Host ""
        Write-Host "Next, run this. It needs no key."
        Write-Host '  stophy google search "latest bun release"'
        Write-Host ""
        Write-Host "  stophy --help           list every command"
        Write-Host "  stophy login --browser  get a key for the rest"
        Write-Host ""
    } finally {
        Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue
    }
}

Install-Stophy
