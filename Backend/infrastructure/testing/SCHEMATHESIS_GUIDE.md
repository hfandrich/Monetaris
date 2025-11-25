# Schemathesis API Contract Testing Guide

## Overview

Schemathesis automatically tests all 40 API endpoints against the OpenAPI specification to ensure:
- Status codes match spec
- Response schemas match spec
- No server errors (500s)
- Content-Type headers correct
- Security rules enforced

## Installation

### Linux/Mac
```bash
cd Backend/infrastructure/testing
./install-schemathesis.sh
```

### Windows
```powershell
cd Backend\infrastructure\testing
.\install-schemathesis.ps1
```

### Manual Installation
```bash
pip install schemathesis
```

## Running Tests

### Prerequisites
1. Backend API must be running:
   ```bash
   cd Backend/MonetarisApi
   dotnet run
   ```

2. API should be accessible at http://localhost:5000

### Run Contract Tests

#### Linux/Mac
```bash
cd Backend/infrastructure/testing
./run-contract-tests.sh
```

#### Windows
```powershell
cd Backend\infrastructure\testing
.\run-contract-tests.ps1
```

### Manual Run
```bash
schemathesis run http://localhost:5000/swagger/v1/swagger.json \
  --base-url http://localhost:5000 \
  --checks all \
  --workers 4
```

## What Gets Tested

Schemathesis will test **all 40 endpoints** across **8 domains**:

### Endpoints Tested
- **Kreditor**: 5 endpoints (GET, POST, PUT, DELETE)
- **User/Auth**: 6 endpoints (Login, Register, Refresh, etc.)
- **Debtor**: 6 endpoints (CRUD + Search)
- **Document**: 4 endpoints (Upload, Download, Delete)
- **Inquiry**: 3 endpoints (Create, Resolve, List)
- **Template**: 6 endpoints (CRUD + Render)
- **Dashboard**: 3 endpoints (Stats, Activity, Search)
- **Case**: 7 endpoints (CRUD + Workflow + History)

### Checks Performed
1. **not_a_server_error**: No 500 Internal Server Errors
2. **status_code_conformance**: Status codes match OpenAPI spec
3. **content_type_conformance**: Content-Type headers correct
4. **response_schema_conformance**: Response JSON matches schema

### Property-Based Testing
- Generates 50 test cases per endpoint (configurable)
- Tests edge cases (empty strings, large numbers, special characters)
- Validates input validation rules
- Tests authorization rules

## Interpreting Results

### Successful Run
```
✅ API is running
✅ Authentication token obtained
🧪 Running Schemathesis tests...

Hypothesis calls: 2000
  - 2000 passed
  - 0 failed

✅ All tests passed!
```

### Failed Run
```
❌ Failures detected:

POST /api/kreditoren
  ❌ Response schema mismatch
  Expected: { "id": "uuid", "name": "string" }
  Got: { "kreditorId": "uuid", "kreditorName": "string" }
```

## Configuration

Edit `Backend/infrastructure/testing/schemathesis.yaml`:

```yaml
hypothesis:
  max_examples: 100  # Increase for more thorough testing
workers: 8           # Increase for faster execution
```

## CI/CD Integration

Add to GitHub Actions workflow:

```yaml
- name: Run API Contract Tests
  run: |
    cd Backend/infrastructure/testing
    ./install-schemathesis.sh
    ./run-contract-tests.sh
```

## Troubleshooting

### Issue: "Backend API is not running"
**Solution**: Start the backend first:
```bash
cd Backend/MonetarisApi
dotnet run
```

### Issue: "Could not get auth token"
**Solution**: Check if seeded admin user exists in database.

### Issue: "Schema not found"
**Solution**: Verify Swagger is enabled in `Program.cs`:
```csharp
app.UseSwagger();
app.UseSwaggerUI();
```

### Issue: "Many failures"
**Solution**: This is expected on first run. OpenAPI spec may need updates to match actual API responses.

## Benefits

✅ **Automated**: Tests all 40 endpoints without writing manual tests
✅ **Comprehensive**: 50+ test cases per endpoint (2000+ total tests)
✅ **Fast**: Runs in parallel with 4 workers
✅ **Catches Issues**: Finds API spec violations, edge cases, security issues
✅ **Documentation**: Ensures OpenAPI spec is accurate and up-to-date

## Maintenance

1. **After adding new endpoints**: No changes needed! Schemathesis reads the OpenAPI spec automatically.
2. **After changing API responses**: Update OpenAPI spec annotations in code.
3. **After changing auth rules**: Update test script with appropriate tokens.

## Advanced Usage

### Test Specific Endpoint
```bash
schemathesis run http://localhost:5000/swagger/v1/swagger.json \
  --endpoint "/api/kreditoren" \
  --method POST
```

### Generate Test Report
```bash
schemathesis run http://localhost:5000/swagger/v1/swagger.json \
  --report > schemathesis-report.txt
```

### Test with Different Auth Roles
```bash
# Get agent token
AGENT_TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"max@monetaris.com","password":"max123"}' \
  | jq -r '.accessToken')

# Run tests as agent
schemathesis run http://localhost:5000/swagger/v1/swagger.json \
  --header "Authorization: Bearer $AGENT_TOKEN"
```

## Integration with Quality Gate

Schemathesis is part of the CI/CD quality gate:

```
Local Tools → Commit → Push
    ↓
GitHub Actions:
  1. Build ✅
  2. Unit Tests ✅
  3. Schemathesis Contract Tests ✅  ← Ensures API matches spec
  4. Playwright E2E ✅
  5. SonarQube Quality Gate ✅
    ↓
All Green → Merge Allowed
```

**Goal**: 100% API contract conformance with OpenAPI specification.
