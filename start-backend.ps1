# ===================================================================
# ClaimPilot AI — Secure Process-Local Backend Starter
# ===================================================================
# Prompts for MySQL password via masked Read-Host -AsSecureString,
# holds it ONLY in this process memory, and starts the backend on port 8081.
# ===================================================================

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$jarPath = Join-Path $scriptDir "backend\target\claimpilot-backend-1.0.0.jar"
if (-not (Test-Path $jarPath)) {
    Write-Host "[ERROR] Fat JAR not found at $jarPath" -ForegroundColor Red
    exit 1
}

# 1. Read MySQL Password securely if not present in current process
if ([string]::IsNullOrWhiteSpace($env:DB_PASSWORD)) {
    Write-Host "MySQL Root Password required for ClaimPilot AI (localhost:3306)" -ForegroundColor Cyan
    $sec = Read-Host "Enter MySQL Password" -AsSecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
    $env:DB_PASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}

# 2. Configure Environment
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot"
$env:SERVER_PORT = "8081"
$javaExe = Join-Path $env:JAVA_HOME "bin\java.exe"

Write-Host "=====================================================" -ForegroundColor Green
Write-Host " Starting ClaimPilot AI Backend on http://localhost:8081" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green

& $javaExe -jar $jarPath
