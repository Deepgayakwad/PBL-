Write-Host "Starting the client..." -ForegroundColor Green
Set-Location -Path "D:\deep\src\client"
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host "Environment variables for React:" -ForegroundColor Yellow
Get-ChildItem Env: | Where-Object { $_.Name -like "REACT_*" } | Format-Table -AutoSize
Write-Host "Running npm start..." -ForegroundColor Green
npm start 