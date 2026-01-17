Write-Host "Aggressive Reset of Development Environment..."

# 1. Kill any process using ports 3000 or 3001 (PowerShell way)
Write-Host "Closing ports 3000 and 3001..."
$pids = @()
$pids += Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
$pids += Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess

$pids | Unique | ForEach-Object {
    try {
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
        Write-Host "Killed process $_"
    }
    catch {}
}

# 2. Kill all Node.js and orphaned CMD processes
Write-Host "Cleaning up Node.js and CMD processes..."
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# 3. Clear Next.js Cache
if (Test-Path ".next") {
    Write-Host "Removing .next cache folder..."
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "------------------------------------------------"
Write-Host "Environment is CLEAN. You can now run Start-dev."
Write-Host "------------------------------------------------"

