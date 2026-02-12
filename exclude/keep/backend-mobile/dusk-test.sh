#!/bin/bash

# Dusk Test Script
set -e

echo "🧪 Running Laravel Dusk Tests..."

# Ensure ChromeDriver is up-to-date
php artisan dusk:chrome-driver --detect

# Run Dusk
php artisan dusk
