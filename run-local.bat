@echo off
REM PatientTriage.ai - start a local web server and open the board.
REM ES modules do not load over file:// - the site MUST be served over http.
cd /d "%~dp0"

if not exist "index.html" (
  echo.
  echo   index.html not found in %CD%
  echo   Put this file in the PatientTriage-ai folder and run it again.
  echo.
  pause
  exit /b 1
)

echo.
echo   Serving %CD%
echo   Board will open at http://127.0.0.1:8000
echo   Keep this window OPEN. Press Ctrl+C here to stop.
echo.

py -3 --version >nul 2>&1
if %errorlevel%==0 (
  start "" http://127.0.0.1:8000/index.html
  py -3 -m http.server 8000 --bind 127.0.0.1
  goto :eof
)

python --version >nul 2>&1
if %errorlevel%==0 (
  start "" http://127.0.0.1:8000/index.html
  python -m http.server 8000 --bind 127.0.0.1
  goto :eof
)

node --version >nul 2>&1
if %errorlevel%==0 (
  start "" http://127.0.0.1:8000/index.html
  npx --yes serve -l 8000 .
  goto :eof
)

echo   No Python and no Node found on PATH.
echo   Install either one, or open the folder in VS Code and use Live Server.
pause
