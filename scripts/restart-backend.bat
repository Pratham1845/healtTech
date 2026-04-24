@echo off
echo ====================================
echo Restarting HealthTech Backend Server
echo ====================================
echo.

echo Stopping all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting Backend Server...
cd /d "%~dp0Backend"
start "HealthTech Backend" cmd /k "npm run dev"

echo.
echo Backend server is starting...
echo Waiting for server to be ready...
timeout /t 3 /nobreak >nul

echo.
echo ====================================
echo Backend restart initiated!
echo Check the new window for server status
echo ====================================
echo.
pause
