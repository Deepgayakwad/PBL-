Set-Location -Path "D:\deep"
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run server" -NoNewWindow
Write-Host "Server started at http://localhost:5001" 