# Test Script (PowerShell)
param (
    [string]$Filter
)

Write-Host "🧪 Running Backend Tests..." -ForegroundColor Cyan

if ([string]::IsNullOrEmpty($Filter)) {
    php artisan test --compact
} else {
    php artisan test --compact --filter="$Filter"
}
