# Backend Setup Script (PowerShell)
Write-Host "🚀 Starting Backend Setup..." -ForegroundColor Green

# Install Composer dependencies
if (Test-Path "composer.json") {
    Write-Host "📦 Installing Composer dependencies..." -ForegroundColor Cyan
    composer install --no-interaction --prefer-dist --optimize-autoloader
}

# Prepare environment file
if (-not (Test-Path ".env")) {
    Write-Host "📄 Creating .env from .env.example..." -ForegroundColor Cyan
    Copy-Item ".env.example" ".env"
}

# Generate application key
Write-Host "🔑 Generating application key..." -ForegroundColor Cyan
php artisan key:generate --ansi

# Create SQLite database if configured
$envContent = Get-Content .env
$dbConnection = ($envContent | Select-String "^DB_CONNECTION=(.*)").Matches.Groups[1].Value
if ($dbConnection -eq "sqlite") {
    $dbDatabaseLine = ($envContent | Select-String "^DB_DATABASE=(.*)").Matches.Groups[1].Value
    # Handle relative path logic roughly
    if ($dbDatabaseLine -match "database/database.sqlite") {
        $dbPath = "database/database.sqlite"
        if (-not (Test-Path $dbPath)) {
            Write-Host "💾 Creating SQLite database file..." -ForegroundColor Cyan
            New-Item -ItemType File -Path $dbPath -Force | Out-Null
        }
    }
}

# Run migrations
Write-Host "⚙️ Running database migrations..." -ForegroundColor Cyan
php artisan migrate --force --ansi

# Setup Broadcasting (Reverb)
if (-not (Test-Path "config/reverb.php")) {
    Write-Host "📡 Installing broadcasting (Reverb)..." -ForegroundColor Cyan
    php artisan install:broadcasting --no-interaction 2>$null
}

# Clear Cache & Optimize
Write-Host "🧹 Clearing optimization cache..." -ForegroundColor Cyan
php artisan optimize:clear

Write-Host "✅ Setup complete!" -ForegroundColor Green
