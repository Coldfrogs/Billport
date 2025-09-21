@echo off
echo 🚀 Starting Proof-of-Trade Full-Stack Application
echo ================================================

echo.
echo 📋 Step 1: Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm start"

echo.
echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo 📋 Step 2: Opening Frontend in Browser...
start http://localhost:3001

echo.
echo ✅ Application started successfully!
echo.
echo 🌐 Frontend: http://localhost:3001
echo 📊 Backend API: http://localhost:3001/api
echo.
echo Press any key to exit...
pause > nul
