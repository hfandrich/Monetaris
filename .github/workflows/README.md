# CI/CD Pipeline Documentation

## Overview

Monetaris uses GitHub Actions for continuous integration and delivery with a comprehensive quality gate system.

## Workflows

### 1. Backend CI (`backend-ci.yml`)
**Trigger**: Push/PR to main/develop
**Steps**:
- Setup PostgreSQL test database
- Build .NET solution
- Run unit tests with coverage
- Run integration tests
- Upload test results & coverage

**Duration**: ~5 minutes

### 2. Frontend CI (`frontend-ci.yml`)
**Trigger**: Push/PR to main/develop
**Jobs**:
- **lint-and-format**: Prettier + ESLint validation
- **test**: Unit tests with coverage

**Duration**: ~3 minutes

### 3. E2E Tests (`e2e-tests.yml`)
**Trigger**: PR to main/develop
**Steps**:
- Start backend API with test database
- Install Playwright browsers
- Run 42 E2E tests across 5 test suites
- Upload screenshots/reports on failure

**Duration**: ~8 minutes

### 4. API Contract Tests (`api-contract-tests.yml`)
**Trigger**: PR to main/develop
**Steps**:
- Start backend API
- Install Schemathesis
- Test all 40 endpoints against OpenAPI spec
- Validate 2000+ property-based test cases

**Duration**: ~4 minutes

### 5. SonarQube Quality Gate (`sonarqube.yml`)
**Trigger**: PR to main/develop
**Steps**:
- Install SonarScanner
- Build with analysis
- Run tests with coverage
- Upload results to SonarQube
- Wait for Quality Gate result

**Duration**: ~6 minutes
**WARNING: Blocks PR merge if Quality Gate fails**

## Quality Gate Criteria

PASS to merge PR:
- Coverage >= 90%
- Bugs = 0
- Code Smell Rating = A
- Duplications <= 3%
- No blocker/critical issues

## Workflow Execution Order

```
PR Created
    |
PARALLEL:
  - Backend CI (checkmark)
  - Frontend CI (checkmark)
    |
PARALLEL:
  - E2E Tests (checkmark)
  - API Contract Tests (checkmark)
  - SonarQube Analysis (checkmark)
    |
Quality Gate Check
  |- GREEN (checkmark) -> Merge Allowed
  |- RED (X) -> PR Blocked
```

## Required Secrets

Configure in GitHub repository settings:

```
Settings -> Secrets and variables -> Actions -> New repository secret
```

**Required secrets:**
- `SONAR_TOKEN`: SonarQube authentication token
- `SONAR_HOST_URL`: SonarQube server URL (e.g., http://localhost:9000)

**Optional secrets:**
- `CODECOV_TOKEN`: Codecov token for coverage reports

## Local Testing

### Test Backend CI Locally
```bash
cd Backend
dotnet build
dotnet test --collect:"XPlat Code Coverage"
```

### Test Frontend CI Locally
```bash
cd Frontend
npm run format:check
npm run lint
npm test
```

### Test E2E Locally
```bash
cd Backend/MonetarisApi
dotnet run &

cd ../../Frontend
npm run test:e2e
```

### Test API Contracts Locally
```bash
cd Backend/infrastructure/testing
./run-contract-tests.sh
```

## Troubleshooting

### Pipeline Fails: "Database connection error"
- Ensure PostgreSQL service is healthy
- Check connection string environment variables

### Pipeline Fails: "SonarQube Quality Gate"
- Check SonarQube dashboard for specific issues
- Fix code quality issues
- Re-run pipeline

### E2E Tests Timeout
- Increase `sleep` time in workflow (backend startup)
- Check API health endpoint
- Review Playwright report artifact

### Schemathesis Failures
- Update OpenAPI spec annotations in code
- Verify response schemas match spec
- Check authorization rules

## AI-First Workflow Integration

When AI generates code:
1. AI commits to feature branch
2. Pre-commit hooks validate locally (Prettier, ESLint, Tests)
3. Push triggers CI/CD pipeline
4. **If pipeline RED:**
   - Coder agent is automatically re-invoked
   - Fix ONLY issues causing failures
   - DO NOT change business logic
   - Re-run pipeline
5. **If pipeline GREEN:**
   - Human reviews PR (2-5 minutes)
   - Merge to main

**Goal**: 100% automated quality validation, human only reviews business logic.

## Maintenance

### Update Test Database
Modify `services.postgres.env` in workflow files.

### Add New Test Suite
1. Add test job to appropriate workflow
2. Ensure coverage reports are collected
3. Test locally first

### Change Quality Gate Thresholds
Edit `sonar-project.properties` and SonarQube server settings.

## Monitoring

- **Workflow runs**: GitHub Actions tab
- **Coverage trends**: Codecov dashboard
- **Code quality**: SonarQube dashboard
- **Test results**: Workflow artifacts
