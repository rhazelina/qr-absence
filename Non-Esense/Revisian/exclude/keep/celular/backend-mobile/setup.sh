#!/bin/bash

# Laravel Backend Setup Script
set -e

echo "🚀 Starting Backend Setup..."

# Install Composer dependencies
if [ -f "composer.json" ]; then
    echo "📦 Installing Composer dependencies..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Prepare environment file
if [ ! -f ".env" ]; then
    echo "📄 Creating .env from .env.example..."
    cp .env.example .env
fi

# Generate application key
echo "🔑 Generating application key..."
php artisan key:generate --ansi

# Create SQLite database if configured
DB_CONNECTION=$(grep DB_CONNECTION .env | cut -d '=' -f2)
if [ "$DB_CONNECTION" == "sqlite" ]; then
    DB_DATABASE=$(grep DB_DATABASE .env | cut -d '=' -f2)
    if [ ! -f "$DB_DATABASE" ]; then
        echo "💾 Creating SQLite database file: $DB_DATABASE"
        mkdir -p "$(dirname "$DB_DATABASE")"
        touch "$DB_DATABASE"
    fi
fi

# Run migrations
echo "⚙️ Running database migrations..."
php artisan migrate --force --ansi

# Setup Broadcasting (Reverb)
if [ ! -f "config/reverb.php" ]; then
    echo "📡 Installing broadcasting (Reverb)..."
    php artisan install:broadcasting --no-interaction || true
fi

# Clear Cache & Optimize
echo "🧹 Clearing optimization cache..."
php artisan optimize:clear

# Install and build frontend assets (if any)
if [ -f "package.json" ]; then
    echo "🎨 Installing and building frontend assets..."
    if command -v bun &> /dev/null; then
        bun install
        bun run build
    elif command -v npm &> /dev/null; then
        npm install
        npm run build
    fi
fi

echo "✅ Setup complete! You can now run the server using 'php artisan serve' or 'php artisan octane:start'."
