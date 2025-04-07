Set-Location -Path "D:\deep\src\client"
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm start" -NoNewWindow
Write-Host "Client starting at http://localhost:3000" 