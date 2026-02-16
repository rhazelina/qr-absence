# Desktop Setup Script (PowerShell)
Write-Host "🚀 Starting Desktop Version Setup..." -ForegroundColor Cyan

# Install dependencies
if (Test-Path "package.json") {
    Write-Host "📦 Installing Node dependencies..." -ForegroundColor Gray
    if (Get-Command bun -ErrorAction SilentlyContinue) {
        bun install
    } else {
        npm install
    }
}

# Prepare environment file
if (-not (Test-Path ".env")) {
    Write-Host "📄 Creating .env..." -ForegroundColor Gray
    "VITE_API_URL=http://127.0.0.1:8000" | Set-Content ".env"
}

Write-Host "✅ Desktop Setup complete!" -ForegroundColor Green
