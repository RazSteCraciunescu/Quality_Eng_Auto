@echo off
setlocal
cd /d "%~dp0\.."

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 22 or newer was not found.
  exit /b 1
)

call npm install --no-audit --no-fund
if errorlevel 1 exit /b 1
call npm run build
if errorlevel 1 exit /b 1

where py >nul 2>nul
if not errorlevel 1 (
  if not exist ".venv\Scripts\python.exe" py -3 -m venv .venv
  if exist ".venv\Scripts\python.exe" (
    call .venv\Scripts\activate.bat
    python -m pip install --upgrade pip
    if errorlevel 1 exit /b 1
    python -m pip install -r requirements-dev.txt
    if errorlevel 1 exit /b 1
  )
)

call npm run validate
if errorlevel 1 exit /b 1
call npm test
if errorlevel 1 exit /b 1

echo.
echo Setup complete. Run: scripts\run_windows.cmd
