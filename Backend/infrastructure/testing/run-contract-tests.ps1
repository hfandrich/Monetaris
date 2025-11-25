# Run Schemathesis API Contract Tests

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Monetaris API Contract Tests" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if backend is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/swagger/v1/swagger.json" -Method Get -ErrorAction Stop
    Write-Host ""
    Write-Host "✅ API is running" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host "ERROR: Backend API is not running!" -ForegroundColor Red
    Write-Host "Please start the API first:" -ForegroundColor Yellow
    Write-Host "  cd Backend/MonetarisApi" -ForegroundColor Yellow
    Write-Host "  dotnet run" -ForegroundColor Yellow
    exit 1
}

# Get admin token for authentication
Write-Host "🔑 Getting authentication token..." -ForegroundColor Yellow

$loginBody = @{
    email = "admin@monetaris.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody

    $adminToken = $loginResponse.accessToken
    Write-Host "✅ Authentication token obtained" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Warning: Could not get auth token. Testing only public endpoints." -ForegroundColor Yellow
    $adminToken = ""
}

Write-Host ""
Write-Host "🧪 Running Schemathesis tests..." -ForegroundColor Yellow
Write-Host ""

# Run Schemathesis
$schemathesisArgs = @(
    "run", "http://localhost:5000/swagger/v1/swagger.json",
    "--base-url", "http://localhost:5000",
    "--checks", "all",
    "--workers", "4",
    "--hypothesis-max-examples", "50",
    "--hypothesis-deadline", "5000",
    "--show-errors-tracebacks",
    "--report"
)

if ($adminToken) {
    $schemathesisArgs += "--header"
    $schemathesisArgs += "Authorization: Bearer $adminToken"
}

& schemathesis $schemathesisArgs

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Contract Tests Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
