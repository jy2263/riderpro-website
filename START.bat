@echo off
echo ========================================
echo   RiderPro Training Platform
echo   Starting Servers...
echo ========================================
echo.

echo [1/2] Starting Backend Server (Port 3000)...
start "RiderPro Backend" cmd /k "node server.js"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server (Port 8000)...
start "RiderPro Frontend" cmd /k "python -m http.server 8000"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   Servers Started Successfully!
echo ========================================
echo.
echo Backend API: http://localhost:3000
echo Frontend:    http://localhost:8000
echo.
echo Opening browser...
timeout /t 2 /nobreak >nul
start http://localhost:8000
echo.
echo Press any key to exit (servers will keep running)
pause >nul
