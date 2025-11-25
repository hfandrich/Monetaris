#!/bin/bash
# Run Schemathesis API Contract Tests

set -e  # Exit on error

echo "=========================================="
echo "Monetaris API Contract Tests"
echo "=========================================="

# Check if backend is running
if ! curl -f http://localhost:5000/swagger/v1/swagger.json > /dev/null 2>&1; then
    echo "ERROR: Backend API is not running!"
    echo "Please start the API first:"
    echo "  cd Backend/MonetarisApi"
    echo "  dotnet run"
    exit 1
fi

echo ""
echo "✅ API is running"
echo ""

# Get admin token for authentication
echo "🔑 Getting authentication token..."
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@monetaris.com","password":"admin123"}' \
  | jq -r '.accessToken')

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" == "null" ]; then
    echo "⚠️  Warning: Could not get auth token. Testing only public endpoints."
else
    echo "✅ Authentication token obtained"
fi

echo ""
echo "🧪 Running Schemathesis tests..."
echo ""

# Run Schemathesis
schemathesis run http://localhost:5000/swagger/v1/swagger.json \
  --base-url http://localhost:5000 \
  --checks all \
  --workers 4 \
  --hypothesis-max-examples 50 \
  --hypothesis-deadline 5000 \
  --header "Authorization: Bearer $ADMIN_TOKEN" \
  --show-errors-tracebacks \
  --report

echo ""
echo "=========================================="
echo "Contract Tests Complete!"
echo "=========================================="
