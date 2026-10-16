@echo off
setlocal
cd /d "%~dp0\.."

echo Dashboard: http://127.0.0.1:4173
echo API docs: http://127.0.0.1:4173/api-docs.html
node dist\server.js
