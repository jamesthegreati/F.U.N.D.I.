<# 
.SYNOPSIS
    Downloads and installs Espressif QEMU for ESP32 simulation (Windows).

.DESCRIPTION
    This script downloads the pre-built qemu-system-xtensa binary from 
    Espressif's GitHub releases and installs it to a local directory.
    It also sets the QEMU_ESP32_PATH environment variable.

.NOTES
    Requires: PowerShell 5.1+, Internet connection, Windows 10 1803+ (for tar) or 7-Zip
    Run as: .\setup_qemu_esp32.ps1
#>

$ErrorActionPreference = "Stop"

# Release tag uses hyphens; asset filenames use underscores
$QEMU_TAG = "esp-develop-9.2.2-20250817"
$QEMU_FILE_VERSION = "esp_develop_9.2.2_20250817"
$INSTALL_DIR = "$env:LOCALAPPDATA\espressif-qemu"

Write-Host "=== Espressif QEMU ESP32 Setup ===" -ForegroundColor Cyan
Write-Host ""

# Detect architecture
$arch = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture
if ($arch -eq "X64") {
    $qemu_arch = "x86_64"
} elseif ($arch -eq "Arm64") {
    $qemu_arch = "aarch64"
} else {
    Write-Host "Unsupported architecture: $arch" -ForegroundColor Red
    exit 1
}

# Asset filename: qemu-xtensa-softmmu-esp_develop_X.Y.Z_DATE-ARCH-w64-mingw32.tar.xz
$assetName = "qemu-xtensa-softmmu-${QEMU_FILE_VERSION}-${qemu_arch}-w64-mingw32.tar.xz"
$url = "https://github.com/espressif/qemu/releases/download/${QEMU_TAG}/${assetName}"
$downloadPath = "$env:TEMP\$assetName"

Write-Host "Architecture: $qemu_arch"
Write-Host "Version: $QEMU_TAG"
Write-Host "Asset: $assetName"
Write-Host "Download URL: $url"
Write-Host ""

# Check if already installed
$existingBin = Get-ChildItem -Path $INSTALL_DIR -Recurse -Filter "qemu-system-xtensa.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($existingBin) {
    Write-Host "QEMU already installed at: $($existingBin.FullName)" -ForegroundColor Yellow
    $confirm = Read-Host "Reinstall? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        [System.Environment]::SetEnvironmentVariable("QEMU_ESP32_PATH", $existingBin.FullName, "User")
        $env:QEMU_ESP32_PATH = $existingBin.FullName
        Write-Host "QEMU_ESP32_PATH = $($existingBin.FullName)" -ForegroundColor Green
        exit 0
    }
}

# Download
Write-Host "Downloading Espressif QEMU..." -ForegroundColor Yellow
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $ProgressPreference = 'SilentlyContinue'  # Speeds up Invoke-WebRequest significantly
    Invoke-WebRequest -Uri $url -OutFile $downloadPath -UseBasicParsing
    $ProgressPreference = 'Continue'
    
    $fileSize = (Get-Item $downloadPath).Length
    Write-Host "Download complete ($([math]::Round($fileSize / 1MB, 1)) MB)." -ForegroundColor Green
} catch {
    Write-Host "Download failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual download instructions:" -ForegroundColor Yellow
    Write-Host "  1. Go to: https://github.com/espressif/qemu/releases/tag/$QEMU_TAG"
    Write-Host "  2. Click 'Show all 14 assets' to see the full list"
    Write-Host "  3. Download: $assetName"
    Write-Host "  4. Extract to: $INSTALL_DIR"
    Write-Host "  5. Set env var: QEMU_ESP32_PATH = <path-to>\qemu-system-xtensa.exe"
    exit 1
}

# Extract .tar.xz
Write-Host "Extracting $assetName ..." -ForegroundColor Yellow

if (Test-Path $INSTALL_DIR) {
    Remove-Item -Recurse -Force $INSTALL_DIR
}
New-Item -ItemType Directory -Force -Path $INSTALL_DIR | Out-Null

$extracted = $false

# Method 1: Use tar (available on Windows 10 1803+ / Server 2019+)
$tarExe = Get-Command tar -ErrorAction SilentlyContinue
if ($tarExe -and -not $extracted) {
    Write-Host "  Using built-in tar..." -ForegroundColor Gray
    try {
        & tar -xJf $downloadPath -C $INSTALL_DIR 2>&1
        if ($LASTEXITCODE -eq 0) {
            $extracted = $true
            Write-Host "  Extracted with tar." -ForegroundColor Green
        }
    } catch {
        Write-Host "  tar extraction failed, trying alternatives..." -ForegroundColor Yellow
    }
}

# Method 2: Use 7-Zip if installed
if (-not $extracted) {
    $sevenZipPaths = @(
        "$env:ProgramFiles\7-Zip\7z.exe",
        "${env:ProgramFiles(x86)}\7-Zip\7z.exe",
        "$env:LOCALAPPDATA\Programs\7-Zip\7z.exe"
    )
    $sevenZip = $sevenZipPaths | Where-Object { Test-Path $_ } | Select-Object -First 1
    
    if ($sevenZip) {
        Write-Host "  Using 7-Zip..." -ForegroundColor Gray
        try {
            # .tar.xz requires two-step extraction: .tar.xz -> .tar -> files
            & $sevenZip x $downloadPath "-o$env:TEMP" -y 2>&1 | Out-Null
            $tarName = $assetName -replace '\.xz$', ''
            $tarPath = "$env:TEMP\$tarName"
            if (Test-Path $tarPath) {
                & $sevenZip x $tarPath "-o$INSTALL_DIR" -y 2>&1 | Out-Null
                Remove-Item -Force $tarPath -ErrorAction SilentlyContinue
                $extracted = $true
                Write-Host "  Extracted with 7-Zip." -ForegroundColor Green
            }
        } catch {
            Write-Host "  7-Zip extraction failed." -ForegroundColor Yellow
        }
    }
}

# Clean up download
Remove-Item -Force $downloadPath -ErrorAction SilentlyContinue

if (-not $extracted) {
    Write-Host ""
    Write-Host "ERROR: Could not extract .tar.xz archive." -ForegroundColor Red
    Write-Host "Please ensure you have one of:" -ForegroundColor Yellow
    Write-Host "  - Windows 10 1803+ (has built-in tar with xz support)"
    Write-Host "  - 7-Zip installed: https://7-zip.org/"
    Write-Host ""
    Write-Host "Then re-run this script, or manually extract to: $INSTALL_DIR"
    exit 1
}

# Find the binary (may be nested in a subfolder)
$qemuExe = Get-ChildItem -Path $INSTALL_DIR -Recurse -Filter "qemu-system-xtensa.exe" | Select-Object -First 1
if (-not $qemuExe) {
    Write-Host ""
    Write-Host "ERROR: qemu-system-xtensa.exe not found after extraction!" -ForegroundColor Red
    Write-Host "Contents of ${INSTALL_DIR}:"
    Get-ChildItem -Path $INSTALL_DIR -Recurse -Depth 2 | ForEach-Object { 
        Write-Host "  $($_.FullName.Replace($INSTALL_DIR, '.'))" 
    }
    exit 1
}

$qemuPath = $qemuExe.FullName
Write-Host ""
Write-Host "Found: $qemuPath" -ForegroundColor Green

# Test it
try {
    $version = & $qemuPath --version 2>&1 | Select-Object -First 1
    Write-Host "Version: $version" -ForegroundColor Green
} catch {
    Write-Host "WARNING: Could not verify QEMU binary: $_" -ForegroundColor Yellow
}

# Set environment variable (user level, persists across sessions)
[System.Environment]::SetEnvironmentVariable("QEMU_ESP32_PATH", $qemuPath, "User")
$env:QEMU_ESP32_PATH = $qemuPath

Write-Host ""
Write-Host "Environment variable set:" -ForegroundColor Green
Write-Host "  QEMU_ESP32_PATH = $qemuPath"
Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Restart your terminal to pick up the new environment variable"
Write-Host "  2. Start the backend:  cd backend && uvicorn app.main:app --reload"
Write-Host "  3. Start the frontend: npm run dev"
Write-Host ""
Write-Host "In Docker, QEMU is installed automatically via the Dockerfile."
