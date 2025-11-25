# API Testing Infrastructure

This directory contains automated API contract testing tools for the Monetaris backend.

## Tools

### Schemathesis - API Contract Testing

Automatically tests all 40 API endpoints against the OpenAPI specification.

**Quick Start:**
```bash
# Linux/Mac
./quick-start-contract-tests.sh

# Windows
.\quick-start-contract-tests.ps1
```

**Full Documentation:** See [SCHEMATHESIS_GUIDE.md](SCHEMATHESIS_GUIDE.md)

## Files

- `install-schemathesis.sh` / `.ps1` - Install Schemathesis
- `run-contract-tests.sh` / `.ps1` - Run contract tests
- `quick-start-contract-tests.sh` - Quick start helper
- `schemathesis.yaml` - Schemathesis configuration
- `SCHEMATHESIS_GUIDE.md` - Complete documentation

## Prerequisites

1. **Python + pip** must be installed
2. **Backend must be running** at http://localhost:5000

## Workflow

```
1. Start Backend API
   cd Backend/MonetarisApi
   dotnet run

2. Install Schemathesis (one-time)
   cd Backend/infrastructure/testing
   ./install-schemathesis.sh

3. Run Contract Tests
   ./run-contract-tests.sh
```

## What Gets Tested

- **All 40 endpoints** across 8 domains
- **2000+ test cases** (50 per endpoint)
- **Status code conformance** with OpenAPI spec
- **Response schema validation**
- **No server errors** (500s)
- **Content-Type headers**
- **Authorization rules**

## Benefits

✅ Zero manual test writing - reads OpenAPI spec automatically
✅ Catches API implementation bugs
✅ Validates OpenAPI docs accuracy
✅ Finds edge cases through property-based testing
✅ Runs in parallel (4 workers) for speed

## CI/CD Integration

Schemathesis is part of the quality gate:

```
Build → Unit Tests → Contract Tests → E2E Tests → Quality Gate
                          ↑
                    Schemathesis
```

See `Backend/infrastructure/quality/README.md` for full quality tooling overview.
