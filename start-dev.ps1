Write-Host "Starting Trading Observer Servers..."

# Function to start a process in a new window using cmd.exe
# This avoids "not a valid Win32 application" errors with direct npm.cmd calls
function Start-npmProcess {
    param (
        [string]$Command
    )
    Start-Process "cmd.exe" -ArgumentList "/k npm run $Command"
}

try {
    Write-Host "Launching Frontend on port 3000..."
    Start-npmProcess "dev -- -p 3000"
    
    Write-Host "Launching Backend..."
    Start-npmProcess "server"

    Write-Host "---------------------------------------------------"
    Write-Host "Servers have been launched in separate windows."
    Write-Host "You can close those windows to stop the servers."
    Write-Host "---------------------------------------------------"
}
catch {
    Write-Error "Failed to start processes: $_"
}
