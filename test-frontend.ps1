Write-Host "Testing frontend connectivity..." -ForegroundColor Green

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/test" -UseBasicParsing -ErrorAction Stop
    Write-Host "Frontend is accessible! Status code: $($response.StatusCode)" -ForegroundColor Green
    
    if ($response.Content -match "Test Component is Working") {
        Write-Host "Test component detected in response content." -ForegroundColor Green
    } else {
        Write-Host "Warning: Test component not found in response. Content may be different than expected." -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error accessing frontend: $_" -ForegroundColor Red
    
    # Check if the client process is running
    $clientProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "react" }
    
    if ($clientProcess) {
        Write-Host "Client process is running with PID: $($clientProcess.Id)" -ForegroundColor Cyan
    } else {
        Write-Host "No React client process found running!" -ForegroundColor Red
    }
    
    # Check network connectivity
    Write-Host "Testing network on port 3000..." -ForegroundColor Yellow
    $testConnection = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -ErrorAction SilentlyContinue
    
    if ($testConnection) {
        Write-Host "Port 3000 is open and accepting connections." -ForegroundColor Green
    } else {
        Write-Host "Port 3000 is not accessible." -ForegroundColor Red
    }
}

Write-Host "Frontend test completed." -ForegroundColor Cyan 