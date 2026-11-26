import shutil
import subprocess
import sys
import tarfile
import zipfile
from pathlib import Path

platform, binary = sys.argv[1:]
cli = Path(__file__).resolve().parents[1]
package = cli / "platforms" / platform
destination = cli.parent / "target" / "native" / platform
destination.mkdir(parents=True, exist_ok=True)

windows = platform.startswith("win32-")
name = "stophy.exe" if windows else "stophy"
packaged = package / "bin" / name
packaged.parent.mkdir(parents=True, exist_ok=True)
shutil.copyfile(binary, packaged)
packaged.chmod(0o755)
subprocess.run(["npm", "pack", str(package), "--pack-destination", str(destination)],
               check=True, shell=sys.platform == "win32")

asset = "stophy-" + platform.replace("win32-", "windows-")
if windows:
    asset += ".exe"
legacy = destination / asset
shutil.copy2(packaged, legacy)
if windows:
    with zipfile.ZipFile(destination / (asset + ".zip"), "w", zipfile.ZIP_DEFLATED) as archive:
        archive.write(legacy, legacy.name)
else:
    with tarfile.open(destination / (asset + ".tar.gz"), "w:gz") as archive:
        archive.add(legacy, arcname=legacy.name)
