# Bootstrap script for Windows: installs Node LTS via nvm-windows, ensures npm is available, installs project deps, and compiles contracts.
# Usage: Right-click -> Run with PowerShell or run from project root: .\scripts\bootstrap-windows.ps1

param(
    [switch]$Force
)

function Write-Info($m){ Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Write-Warn($m){ Write-Host "[WARN] $m" -ForegroundColor Yellow }
function Write-ErrorAndExit($m){ Write-Host "[ERROR] $m" -ForegroundColor Red; exit 1 }

Write-Info "Checking for Node.js (node) and npm..."
$node = Get-Command node -ErrorAction SilentlyContinue
$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $node -or -not $npm) {
    Write-Warn "Node.js/npm not found. Installing nvm-windows and Node LTS..."

    $nvmZipUrl = "https://github.com/coreybutler/nvm-windows/releases/download/1.1.11/nvm-setup.zip"
    $tmp = Join-Path $env:TEMP "nvm-setup.zip"
    Invoke-WebRequest -Uri $nvmZipUrl -OutFile $tmp -UseBasicParsing
    $extractDir = Join-Path $env:TEMP "nvm-setup"
    if (Test-Path $extractDir) { Remove-Item $extractDir -Recurse -Force }
    Expand-Archive -Path $tmp -DestinationPath $extractDir
    $setup = Get-ChildItem -Path $extractDir -Filter "nvm-setup.exe" -Recurse | Select-Object -First 1
    if (-not $setup) { Write-ErrorAndExit "nvm installer not found in downloaded zip." }

    Write-Info "Running nvm-windows installer (requires interactive install). Please complete installer prompts..."
    Start-Process -FilePath $setup.FullName -Wait

    Write-Info "You may need to reopen PowerShell after the installer finishes. Pausing for 5 seconds..."
    Start-Sleep -Seconds 5

    $node = Get-Command node -ErrorAction SilentlyContinue
    $npm = Get-Command npm -ErrorAction SilentlyContinue
    if (-not $node -or -not $npm) {
        Write-Warn "Node still not available. Attempting to use nvm to install Node LTS..."
        $nvm = Get-Command nvm -ErrorAction SilentlyContinue
        if (-not $nvm) { Write-ErrorAndExit "nvm command not found. Please restart PowerShell and re-run this script." }
        & nvm install lts
        & nvm use lts
    }
}
else {
    Write-Info "Node.js and npm are present."
}

Write-Info "Installing project dependencies (this may take a few minutes)..."
npm install
if ($LASTEXITCODE -ne 0) { Write-ErrorAndExit "npm install failed." }

Write-Info "Running Hardhat clean and compile..."
npx hardhat clean
if ($LASTEXITCODE -ne 0) { Write-Warn "hardhat clean returned non-zero; continuing..." }
npx hardhat compile
if ($LASTEXITCODE -ne 0) { Write-ErrorAndExit "hardhat compile failed. Check the output above." }

Write-Info "Bootstrap complete. You can now run scripts with: npm run compile or npx hardhat <task>"
