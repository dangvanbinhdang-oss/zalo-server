@echo off
echo Khoi dong Zalo Server va Ngrok...
start "1. ZALO SERVER" cmd /k "cd /d E:\zalo-server && node server.js"
timeout /t 3
start "2. NGROK LINK" cmd /k "cd /d E:\zalo-server && ngrok http 3000"
echo Da mo 2 cua so! Xem QR o cua so 1!
pause
