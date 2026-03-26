@echo off
REM Entra en la carpeta donde está este script (raíz del proyecto)
cd /d "%~dp0"

echo Abriendo el navegador en unos segundos...
echo Servidor: http://localhost:3000/
echo.

REM Espera ~5 s y abre el navegador (da tiempo a que Next arranque)
start /min powershell -NoProfile -Command "Start-Sleep -Seconds 5; Start-Process 'http://localhost:3000/'"

call npm run dev
