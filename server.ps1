Write-Host "Starting the server..." -ForegroundColor Green
Set-Location -Path "D:\deep"
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host "Available environment variables:" -ForegroundColor Yellow
Get-ChildItem Env: | Where-Object { $_.Name -like "DB_*" -or $_.Name -like "JWT_*" -or $_.Name -like "PORT" } | Format-Table -AutoSize
Write-Host "Starting server with ts-node..." -ForegroundColor Green
npx ts-node src/server/index.ts 