# ============================================================================
# MissionMatch - Lambda ZIP Build Script
# ============================================================================
# Creates a deployment-ready ZIP for AWS Lambda Console upload.
#
# Usage:  .\build_lambda_zip.ps1
# Output: lambda-deploy.zip (in Backend/)
#
# After running this script:
#   1. Go to AWS Lambda Console
#   2. Create function → Python 3.11 → x86_64
#   3. Upload lambda-deploy.zip (or via S3 if >50MB)
#   4. Set handler to:  app.main.handler
#   5. Set timeout to 30 seconds, memory to 512 MB
#   6. Add environment variables in Configuration tab
#   7. Create HTTP API Gateway and connect to the Lambda
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Building Lambda deployment ZIP..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Clean up previous build
$buildDir = ".\lambda_build"
$zipFile = ".\lambda-deploy.zip"

if (Test-Path $buildDir) {
    Write-Host "Cleaning previous build..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $buildDir
}
if (Test-Path $zipFile) {
    Remove-Item -Force $zipFile
}

# Create build directory
New-Item -ItemType Directory -Path $buildDir | Out-Null

# Install dependencies into the build folder
# Step 1: Install all packages normally (gets everything including pure-Python)
Write-Host ""
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
$ErrorActionPreference = "Continue"
pip install -r requirements.txt -t "$buildDir" --quiet --no-cache-dir 2>&1 | Out-String | Write-Host
$ErrorActionPreference = "Stop"

# Step 2: Replace Windows .pyd/.dll with Linux .so files
# Auto-detect installed versions from dist-info directories, then fetch matching Linux binaries
Write-Host "Detecting compiled package versions..." -ForegroundColor Yellow
$linuxDir = ".\lambda_linux_bins"
if (Test-Path $linuxDir) { Remove-Item -Recurse -Force $linuxDir }
New-Item -ItemType Directory -Path $linuxDir | Out-Null

# Packages known to have compiled C extensions
$compiledNames = @(
    "pydantic_core", "pydantic-core",
    "charset_normalizer", "charset-normalizer",
    "cffi",
    "cryptography",
    "grpcio",
    "protobuf",
    "httptools",
    "watchfiles",
    "websockets",
    "PyYAML",
    "regex",
    "MarkupSafe", "markupsafe",
    "aiohttp",
    "frozenlist",
    "multidict",
    "yarl",
    "propcache"
)

# Build list of "package==version" by reading dist-info folder names
$distInfoDirs = Get-ChildItem $buildDir -Directory -Filter "*.dist-info"
$packagesToFetch = @()
foreach ($di in $distInfoDirs) {
    # dist-info format: package_name-version.dist-info
    if ($di.Name -match "^(.+?)-(\d+\..+?)\.dist-info$") {
        $pkgName = $matches[1]
        $pkgVersion = $matches[2]
        # Normalize: replace underscores/hyphens for comparison
        $normalized = $pkgName.ToLower() -replace "[_-]", ""
        foreach ($compiled in $compiledNames) {
            $compNorm = $compiled.ToLower() -replace "[_-]", ""
            if ($normalized -eq $compNorm) {
                $packagesToFetch += "$pkgName==$pkgVersion"
                Write-Host "  Found $pkgName==$pkgVersion" -ForegroundColor DarkGray
                break
            }
        }
    }
}

Write-Host "Downloading Linux binaries..." -ForegroundColor Yellow
foreach ($pkg in $packagesToFetch) {
    $ErrorActionPreference = "Continue"
    pip install $pkg -t "$linuxDir" --quiet --no-cache-dir --platform manylinux2014_x86_64 --only-binary=:all: --python-version 3.11 --implementation cp --no-deps 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Downloaded $pkg" -ForegroundColor DarkGray
    } else {
        Write-Host "  Skipped $pkg (no Linux wheel)" -ForegroundColor DarkYellow
    }
    $ErrorActionPreference = "Stop"
}

# Remove all Windows .pyd files from build dir
Write-Host "Replacing Windows binaries with Linux ones..." -ForegroundColor Yellow
Get-ChildItem $buildDir -Recurse -Filter "*.pyd" | Remove-Item -Force

# Copy all Linux .so files into the build dir, preserving relative paths
Get-ChildItem $linuxDir -Recurse -Filter "*.so" | ForEach-Object {
    $relPath = $_.FullName.Substring((Resolve-Path $linuxDir).Path.Length + 1)
    $destPath = Join-Path $buildDir $relPath
    $destDir = Split-Path $destPath -Parent
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
    Copy-Item $_.FullName $destPath -Force
    Write-Host "  + $relPath" -ForegroundColor DarkGray
}

# Cleanup linux temp dir
Remove-Item -Recurse -Force $linuxDir
Write-Host "  Done replacing binaries" -ForegroundColor DarkGray

# Remove boto3/botocore (already in Lambda runtime, saves ~80MB)
$lambdaBuiltins = @("boto3", "botocore", "s3transfer", "urllib3")
foreach ($pkg in $lambdaBuiltins) {
    $pkgPath = Join-Path $buildDir $pkg
    $distInfo = Get-ChildItem $buildDir -Directory -Filter "$pkg*dist-info" -ErrorAction SilentlyContinue
    if (Test-Path $pkgPath) {
        Remove-Item -Recurse -Force $pkgPath
        Write-Host "  Removed $pkg (pre-installed in Lambda)" -ForegroundColor DarkGray
    }
    foreach ($di in $distInfo) {
        Remove-Item -Recurse -Force $di.FullName
    }
}

# Remove unnecessary files to slim the package
Write-Host "Slimming package..." -ForegroundColor Yellow
Get-ChildItem $buildDir -Recurse -Include "__pycache__", "*.pyc", "*.pyo" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Get-ChildItem $buildDir -Recurse -Include "*.dist-info" -Directory | ForEach-Object {
    # Keep dist-info but remove unnecessary files inside
    Get-ChildItem $_.FullName -Include "RECORD", "INSTALLER", "REQUESTED", "top_level.txt" | Remove-Item -Force -ErrorAction SilentlyContinue
}
Get-ChildItem $buildDir -Recurse -Include "tests", "test" -Directory | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

# Copy application code
Write-Host "Copying application code..." -ForegroundColor Yellow
Copy-Item -Recurse ".\app" "$buildDir\app"

# Remove __pycache__ from app code
Get-ChildItem "$buildDir\app" -Recurse -Include "__pycache__" -Directory | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

# Create ZIP using .NET directly (more reliable than Compress-Archive)
Write-Host "Creating ZIP archive..." -ForegroundColor Yellow
$zipFullPath = (Resolve-Path ".\").Path + "\lambda-deploy.zip"
$buildFullPath = (Resolve-Path $buildDir).Path

Add-Type -Assembly "System.IO.Compression.FileSystem"
[System.IO.Compression.ZipFile]::CreateFromDirectory($buildFullPath, $zipFullPath)

# Report size
$zipSize = (Get-Item $zipFile).Length / 1MB
$zipSizeFormatted = [math]::Round($zipSize, 1)

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  BUILD COMPLETE" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  ZIP: lambda-deploy.zip ($zipSizeFormatted MB)" -ForegroundColor White

if ($zipSize -gt 50) {
    Write-Host ""
    Write-Host "  WARNING: ZIP is >50MB. Upload via S3 instead:" -ForegroundColor Red
    Write-Host "    1. Upload lambda-deploy.zip to any S3 bucket" -ForegroundColor Yellow
    Write-Host "    2. In Lambda Console, choose 'Upload from S3'" -ForegroundColor Yellow
} else {
    Write-Host "  Upload directly in Lambda Console" -ForegroundColor White
}

Write-Host ""
Write-Host "  Lambda settings:" -ForegroundColor Cyan
Write-Host "    Handler:  app.main.handler" -ForegroundColor White
Write-Host "    Runtime:  Python 3.11" -ForegroundColor White
Write-Host "    Memory:   512 MB" -ForegroundColor White
Write-Host "    Timeout:  30 seconds" -ForegroundColor White
Write-Host ""

# Cleanup build directory
Remove-Item -Recurse -Force $buildDir
Write-Host "Build directory cleaned up." -ForegroundColor DarkGray
