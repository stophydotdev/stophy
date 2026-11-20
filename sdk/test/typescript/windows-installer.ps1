$ErrorActionPreference = "Stop"

$installer = Join-Path $PSScriptRoot "../../../cli/scripts/install.ps1"
$tokens = $null
$parseErrors = $null
$ast = [System.Management.Automation.Language.Parser]::ParseFile($installer, [ref]$tokens, [ref]$parseErrors)
if ($parseErrors.Count -ne 0) {
    throw ($parseErrors | Out-String)
}

$platform = $ast.Find({
    param($node)
    $node -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -eq "Get-Platform"
}, $false)
if (-not $platform) { throw "Installer has no platform detection function" }

$architecture = "[System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture"
if (-not $platform.Extent.Text.Contains($architecture)) { throw "Cannot substitute the installer architecture for offline checks" }
$x64 = $platform.Extent.Text.Replace($architecture, '"X64"')
$asset = & ([scriptblock]::Create("$x64; 'stophy-windows-' + (Get-Platform) + '.exe'"))
if ($asset -ne "stophy-windows-x64.exe") { throw "Unexpected Windows x64 asset: $asset" }

function Invoke-WebRequest { throw "Installer attempted a download on an unsupported architecture" }
function Invoke-RestMethod { throw "Installer attempted a version lookup on an unsupported architecture" }

$source = Get-Content $installer -Raw
$arm64 = $source.Replace($architecture, '"Arm64"')
$message = try {
    & ([scriptblock]::Create($arm64))
    ""
} catch {
    $_.Exception.Message
}
if ($message -notlike "*does not support Windows ARM64*" -or $message -notlike "*npm install -g @stophy/cli*") {
    throw "Expected ARM64 to stop with a supported alternative before any download; got: $message"
}

$x86 = $source.Replace($architecture, '"X86"')
$message = try {
    & ([scriptblock]::Create($x86))
    ""
} catch {
    $_.Exception.Message
}
if ($message -notlike "*Unsupported architecture: X86*") {
    throw "Expected unsupported x86 to stop before any download; got: $message"
}

Write-Host "Windows installer platform checks passed without network requests"
