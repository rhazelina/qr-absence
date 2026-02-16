#!/bin/bash

# Desktop Setup Script
set -e

echo "🚀 Starting Desktop Version Setup..."

# Install dependencies
if [ -f "package.json" ]; then
    echo "📦 Installing Node dependencies..."
    if command -v bun &> /dev/null; then
        bun install
    elif command -v npm &> /dev/null; then
        npm install
    fi
fi

# Prepare environment file
if [ ! -f ".env" ]; then
    echo "📄 Creating .env..."
    echo "VITE_API_URL=http://127.0.0.1:8000" > .env
fi

echo "✅ Desktop Setup complete!"
