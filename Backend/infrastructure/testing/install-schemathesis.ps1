# Install Schemathesis for API contract testing
Write-Host "Installing Schemathesis..." -ForegroundColor Green
pip install schemathesis

Write-Host "Schemathesis installed successfully!" -ForegroundColor Green
Write-Host "Version:"
schemathesis --version
