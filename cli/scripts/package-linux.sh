#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
directory="../target/native"
export VERSION
VERSION=$(node -p "require('./platforms/linux-x64/package.json').version")
for target in linux-x64 linux-arm64; do
  export BINARY="$directory/$target/stophy-$target" ARCH
  if [[ "$target" == linux-x64 ]]; then ARCH=amd64; else ARCH=arm64; fi
  config=$(envsubst < nfpm.yaml)
  for format in deb rpm apk archlinux; do
    nfpm package --config <(printf '%s\n' "$config") --packager "$format" --target "$directory/"
  done
done
(
  cd "$directory"
  sha256sum */stophy-*.tar.gz */stophy-*.exe | sed -E 's|  [^/]+/|  |' > checksums.txt
)
ruby -e '
template = File.read("homebrew/stophy.rb")
checksums = File.readlines(ARGV[0]).to_h { |line| hash, name = line.split; [name, hash] }
puts template.gsub(/sha256 "PLACEHOLDER-(.*?)"/) { "sha256 \"#{checksums.fetch($1)}\"" }
' "$directory/checksums.txt" > "$directory/stophy.rb"
