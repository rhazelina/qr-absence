#!/bin/bash

# Test Execution Script
set -e

echo "🧪 Running Backend Tests..."

# Check if filter is provided
if [ -z "$1" ]; then
    php artisan test --compact
else
    php artisan test --compact --filter="$1"
fi
