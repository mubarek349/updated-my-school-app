# Quick Fix Script for AI PDF Issues
Write-Host "`n=== AI PDF Quick Fix ===" -ForegroundColor Cyan
Write-Host ""

# Check if server is running
Write-Host "1. Checking if dev server is running..." -ForegroundColor Yellow
$process = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*node.exe"}
if ($process) {
    Write-Host "   ✓ Dev server is running (restart it to apply changes)" -ForegroundColor Green
    Write-Host "   → Press Ctrl+C in the server terminal, then run 'npm run dev'" -ForegroundColor Magenta
} else {
    Write-Host "   ✗ Dev server is NOT running" -ForegroundColor Red
    Write-Host "   → Run 'npm run dev' to start it" -ForegroundColor Magenta
}

Write-Host ""
Write-Host "2. Checking PDF file..." -ForegroundColor Yellow
$pdfFiles = Get-ChildItem docs\ai-pdfs\ -Filter "*.json"
if ($pdfFiles.Count -gt 0) {
    foreach ($file in $pdfFiles) {
        Write-Host "   Found: $($file.Name)" -ForegroundColor Green
        $content = Get-Content $file.FullName -Raw | ConvertFrom-Json
        Write-Host "   → AI Provider in file: $($content.aiProvider)" -ForegroundColor Cyan
        Write-Host "   → File name: $($content.fileName)" -ForegroundColor Cyan
        Write-Host "   → Size: $([math]::Round($file.Length/1MB,2))MB" -ForegroundColor Cyan
    }
} else {
    Write-Host "   ✗ No PDF files found" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Checking environment variables..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "GEMINI_API_KEY=(.+)") {
        $key = $Matches[1].Trim().Substring(0, [Math]::Min(20, $Matches[1].Trim().Length))
        Write-Host "   ✓ GEMINI_API_KEY found: $key..." -ForegroundColor Green
    } else {
        Write-Host "   ✗ GEMINI_API_KEY not found in .env" -ForegroundColor Red
    }
    
    if ($envContent -match "OPENAI_API_KEY=(.+)") {
        $key = $Matches[1].Trim().Substring(0, [Math]::Min(20, $Matches[1].Trim().Length))
        Write-Host "   ✓ OPENAI_API_KEY found: $key..." -ForegroundColor Green
    } else {
        Write-Host "   ✗ OPENAI_API_KEY not found in .env" -ForegroundColor Red
    }
} else {
    Write-Host "   ✗ .env file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== NEXT STEPS ===" -ForegroundColor Cyan
Write-Host "1. Make sure your .env file has a valid GEMINI_API_KEY or OPENAI_API_KEY" -ForegroundColor White
Write-Host "2. RESTART your dev server (Ctrl+C then 'npm run dev')" -ForegroundColor White
Write-Host "3. In the admin panel, select the AI provider that matches your API key" -ForegroundColor White
Write-Host "4. Try asking your question again" -ForegroundColor White
Write-Host ""

