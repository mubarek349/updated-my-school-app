Write-Host "`n=== Restarting Development Server ===" -ForegroundColor Cyan
Write-Host ""

# Kill any existing node processes
Write-Host "Stopping any running dev servers..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*node.exe*"
} | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "Starting fresh dev server..." -ForegroundColor Green
Write-Host ""
Write-Host "If you see 'Ready' or 'compiled successfully', the server is running!" -ForegroundColor Cyan
Write-Host "Then open your browser and try your question again.`n" -ForegroundColor White

# Start the dev server
npm run dev

