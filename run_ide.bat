@echo off
cd /d "%~dp0"
echo Verificando dependencias de Node.js...
if not exist "node_modules" (
    echo Instalando paquetes con npm...
    call npm install
)

echo Iniciando Polymath IDE...
if exist "package.json" (
    echo Servidor iniciando...
    call npm run dev
) else (
    echo AVISO: package.json no existe. Asegurate de que los archivos se hayan descargado.
)
pause
