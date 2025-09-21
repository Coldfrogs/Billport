@echo off
echo 🧪 Running Billport API Tests...
echo ================================

cd /d "%~dp0"
node test-api.js

echo.
echo Press any key to exit...
pause > nul
