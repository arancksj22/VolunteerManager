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

# Step 2: Remove Windows-only compiled extensions (.pyd files)
Write-Host "Removing Windows binaries..." -ForegroundColor Yellow
Get-ChildItem $buildDir -Recurse -Filter "*.pyd" | Remove-Item -Force
Write-Host "  Removed all .pyd files" -ForegroundColor DarkGray

# Step 3: Re-install compiled packages with Linux x86_64 binaries
Write-Host "Installing Linux binaries for compiled packages..." -ForegroundColor Yellow
$compiledPackages = @(
    "pydantic_core", "charset_normalizer", "cffi", "cryptography",
    "grpcio", "protobuf", "httptools", "watchfiles", "websockets",
    "PyYAML", "aiohttp", "frozenlist", "multidict", "yarl",
    "regex", "markupsafe", "propcache"
)
foreach ($pkg in $compiledPackages) {
    $ErrorActionPreference = "Continue"
    $output = pip install $pkg -t "$buildDir" --quiet --no-cache-dir --platform manylinux2014_x86_64 --only-binary=:all: --python-version 3.11 --implementation cp --no-deps --upgrade 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Replaced $pkg with Linux binary" -ForegroundColor DarkGray
    }
    $ErrorActionPreference = "Stop"
}

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
