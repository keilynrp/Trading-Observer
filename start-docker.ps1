$wslPath = "/mnt/d/Trading Observer"

Write-Host "Checking WSL status..."
$wslStatus = wsl --status
if ($LASTEXITCODE -ne 0) {
    Write-Error "WSL is not accessible. Please ensure WSL is installed and running."
    exit 1
}

Write-Host "Target WSL Path: $wslPath"
Write-Host "Starting 'Trading Observer' containers via Docker Compose..."

# Run docker compose up in detached mode
wsl -d Ubuntu -e bash -c "cd '$wslPath' && docker compose up -d"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Containers started successfully!" -ForegroundColor Green
    Write-Host "`nCurrent Container Status:"
    wsl -d Ubuntu -e bash -c "docker ps --filter 'name=trading-'"
} else {
    Write-Error "Failed to start containers. Please check Docker status in WSL."
    exit 1
}
