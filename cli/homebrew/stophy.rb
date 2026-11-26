class Stophy < Formula
  desc "Search, read, and act on the web. The Stophy command line"
  homepage "https://stophy.dev"
  version "2.3.0"
  license "MIT"

  on_macos do
    on_arm do
      url "https://github.com/stophydotdev/stophy/releases/download/v#{version}/stophy-darwin-arm64.tar.gz"
      sha256 "PLACEHOLDER-stophy-darwin-arm64.tar.gz"
    end
    on_intel do
      url "https://github.com/stophydotdev/stophy/releases/download/v#{version}/stophy-darwin-x64.tar.gz"
      sha256 "PLACEHOLDER-stophy-darwin-x64.tar.gz"
    end
  end
  on_linux do
    on_arm do
      url "https://github.com/stophydotdev/stophy/releases/download/v#{version}/stophy-linux-arm64.tar.gz"
      sha256 "PLACEHOLDER-stophy-linux-arm64.tar.gz"
    end
    on_intel do
      url "https://github.com/stophydotdev/stophy/releases/download/v#{version}/stophy-linux-x64.tar.gz"
      sha256 "PLACEHOLDER-stophy-linux-x64.tar.gz"
    end
  end

  def install
    if OS.mac?
      if Hardware::CPU.arm?
        bin.install "stophy-darwin-arm64" => "stophy"
      else
        bin.install "stophy-darwin-x64" => "stophy"
      end
    elsif OS.linux?
      if Hardware::CPU.arm?
        bin.install "stophy-linux-arm64" => "stophy"
      else
        bin.install "stophy-linux-x64" => "stophy"
      end
    end
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/stophy --version")
  end
end
