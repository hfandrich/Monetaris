# Monetaris Tool Stack & Enforcement Rules

This document defines ALL tools that MUST be used in the Monetaris project.
**Coder agents MUST follow these rules - no exceptions!**

## Tool Stack Overview

| # | Tool | Area | Status | Enforcement |
|---|------|------|--------|-------------|
| 1 | **TypeScript** | Frontend | ✅ Required | No .js files allowed |
| 2 | **OpenAPI/Swagger** | Backend | ✅ Required | All endpoints documented |
| 3 | **Prettier** | Frontend | ✅ Required | Pre-commit hook |
| 4 | **ESLint** | Frontend | ✅ Required | Pre-commit hook |
| 5 | **Schemathesis** | Backend | ✅ Required | API contract tests |
| 6 | **Playwright** | Frontend | ✅ Required | E2E tests |
| 7 | **Commitlint + Husky** | Both | ✅ Required | Commit message validation |
| 8 | **Serilog** | Backend | ✅ Required | Structured logging |
| 9 | **SonarQube** | Both | ✅ Required | Quality gate |
| 10 | **Storybook** | Frontend | 🔜 Planned | Component documentation |
| 11 | **Flyway** | Backend | 🔜 Planned | Database migrations |

---

## 1. TypeScript (Frontend)

**Rule: NO JAVASCRIPT FILES ALLOWED**

```typescript
// ✅ CORRECT: .tsx for React components
// Frontend/components/UserCard.tsx

// ✅ CORRECT: .ts for utilities
// Frontend/services/dataService.ts

// ❌ FORBIDDEN: .js or .jsx files
// Frontend/components/UserCard.js  ← NEVER CREATE THIS
```

**tsconfig.json enforces:**
- `"strict": true`
- `"noImplicitAny": true`
- `"target": "ES2022"`
- Path alias: `@/*` → `Frontend/*`

**Coder Rule:**
- ALWAYS use `.ts` or `.tsx` extensions
- NEVER create `.js` or `.jsx` files
- ALWAYS add proper type annotations

---

## 2. OpenAPI/Swagger (Backend)

**Rule: ALL ENDPOINTS MUST BE DOCUMENTED**

```csharp
// ✅ CORRECT: XML documentation for Swagger
/// <summary>
/// Creates a new Kreditor (client/creditor)
/// </summary>
/// <param name="request">The kreditor creation request</param>
/// <returns>The created kreditor with ID</returns>
/// <response code="201">Kreditor created successfully</response>
/// <response code="400">Invalid request data</response>
/// <response code="401">Unauthorized</response>
[HttpPost]
[ProducesResponseType(typeof(KreditorDto), StatusCodes.Status201Created)]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
public async Task<IActionResult> Create([FromBody] CreateKreditorRequest request)
```

**Swagger URL:** `http://localhost:5000/swagger`
**OpenAPI Spec:** `http://localhost:5000/swagger/v1/swagger.json`

**Coder Rule:**
- ALWAYS add `/// <summary>` XML comments
- ALWAYS add `[ProducesResponseType]` attributes
- ALWAYS document all parameters and responses

---

## 3. Prettier (Frontend)

**Rule: ALL CODE MUST BE FORMATTED**

**Configuration:** `.prettierrc.json`
```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true
}
```

**Pre-commit Hook:** Runs automatically via Husky
```bash
npx prettier --write "src/**/*.{ts,tsx,css,json}"
```

**Coder Rule:**
- Code will be auto-formatted on commit
- Do NOT fight the formatter
- Configure your IDE to use project Prettier settings

---

## 4. ESLint (Frontend)

**Rule: ZERO LINT ERRORS ALLOWED**

**Configuration:** `eslint.config.js` (flat config v9)

**Key Rules:**
- `@typescript-eslint/no-explicit-any` → error
- `@typescript-eslint/no-unused-vars` → error
- `react-hooks/rules-of-hooks` → error
- `react-hooks/exhaustive-deps` → warn

**Pre-commit Hook:** Runs automatically
```bash
npx eslint --fix "src/**/*.{ts,tsx}"
```

**Coder Rule:**
- NEVER use `any` type (use `unknown` or proper types)
- NEVER disable ESLint rules with comments
- Fix all warnings, not just errors

---

## 5. Schemathesis (Backend API Contract Testing)

**Rule: ALL API CONTRACTS MUST PASS**

**Configuration:** `Backend/infrastructure/testing/schemathesis.yaml`

**What it tests:**
- Response matches OpenAPI schema
- All status codes are documented
- Request validation works correctly
- No 500 errors for valid input

**Run Command:**
```bash
schemathesis run http://localhost:5000/swagger/v1/swagger.json \
  --checks all \
  --hypothesis-max-examples=50
```

**Coder Rule:**
- If Schemathesis fails, your OpenAPI spec is wrong
- Update `[ProducesResponseType]` attributes
- Ensure all error responses are documented

---

## 6. Playwright (Frontend E2E Testing)

**Rule: CRITICAL PATHS MUST HAVE E2E TESTS**

**Configuration:** `playwright.config.ts`
- Tests in: `Frontend/e2e/*.spec.ts`
- Base URL: `http://localhost:3000`
- Browsers: Chromium, Firefox, WebKit

**Existing Tests:**
- `auth.spec.ts` - Login/logout flows
- `case-workflow.spec.ts` - Case management
- `dashboard.spec.ts` - Dashboard functionality
- `navigation.spec.ts` - Page navigation
- `search.spec.ts` - Search functionality

**Run Command:**
```bash
npx playwright test
npx playwright test --ui  # Interactive mode
```

**Coder Rule:**
- New user-facing features MUST have E2E tests
- Use `data-testid` attributes for selectors
- Follow AAA pattern (Arrange, Act, Assert)

---

## 7. Commitlint + Husky (Git Hooks)

**Rule: ALL COMMITS MUST FOLLOW CONVENTIONAL FORMAT**

**Configuration:** `commitlint.config.js`

**Allowed Types:**
```
feat:     New feature
fix:      Bug fix
docs:     Documentation only
style:    Formatting (no code change)
refactor: Code restructuring
perf:     Performance improvement
test:     Adding/updating tests
build:    Build system changes
ci:       CI configuration
chore:    Maintenance tasks
revert:   Revert previous commit
```

**Format:**
```
type(scope): description

feat(kreditor): add bulk import endpoint
fix(case): correct workflow transition validation
test(debtor): add unit tests for address verification
```

**Husky Hooks (`.husky/`):**
- `pre-commit`: Prettier + ESLint
- `commit-msg`: Commitlint validation

**Coder Rule:**
- ALWAYS use conventional commit format
- Keep subject line under 72 characters
- Use imperative mood ("add" not "added")

---

## 8. Serilog (Backend Structured Logging)

**Rule: ALL OPERATIONS MUST BE LOGGED**

**Configuration:** `Program.cs`
```csharp
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/monetaris-.log", rollingInterval: RollingInterval.Day)
    .WriteTo.Seq("http://localhost:5341")
    .CreateLogger();
```

**Log Sinks:**
- Console (development)
- File (rolling daily)
- Seq (structured log viewer at `http://localhost:5341`)

**Logging Patterns:**
```csharp
// ✅ CORRECT: Structured logging with context
_logger.LogInformation("Creating kreditor {KreditorName} for tenant {TenantId}",
    request.Name, tenantId);

// ✅ CORRECT: Include correlation ID
_logger.LogWarning("Validation failed for kreditor {KreditorId}: {Errors}",
    id, string.Join(", ", errors));

// ❌ WRONG: String interpolation (loses structure)
_logger.LogInformation($"Creating kreditor {request.Name}");

// ❌ WRONG: Logging sensitive data
_logger.LogInformation("IBAN: {IBAN}", request.BankAccountIBAN);
```

**Coder Rule:**
- Use structured logging (placeholders, not interpolation)
- Include relevant IDs (TenantId, UserId, EntityId)
- NEVER log sensitive data (IBAN, passwords, tokens)
- Log at appropriate levels (Info, Warning, Error)

---

## 9. SonarQube (Code Quality)

**Rule: ALL QUALITY GATES MUST PASS**

**Configuration:** `sonar-project.properties`

**Quality Gate Thresholds:**
| Metric | Threshold |
|--------|-----------|
| Coverage | ≥ 80% |
| Duplications | ≤ 3% |
| Bugs | 0 |
| Vulnerabilities | 0 |
| Code Smells | ≤ 10 |
| Maintainability Rating | A |
| Reliability Rating | A |
| Security Rating | A |

**SonarQube URL:** `http://localhost:9000`

**Run Analysis:**
```bash
# Backend
dotnet sonarscanner begin /k:"monetaris" /d:sonar.host.url="http://localhost:9000"
dotnet build
dotnet test --collect:"XPlat Code Coverage"
dotnet sonarscanner end

# Frontend
npx sonar-scanner
```

**Coder Rule:**
- Check SonarQube after every PR
- Fix all bugs and vulnerabilities immediately
- Reduce code smells progressively

---

## 10. Storybook (Frontend Component Documentation)

**Status: 🔜 PLANNED - NOT YET CONFIGURED**

**When implemented, rules will be:**

```tsx
// Every component MUST have a story
// Frontend/components/UserCard.stories.tsx

import type { Meta, StoryObj } from '@storybook/react';
import { UserCard } from './UserCard';

const meta: Meta<typeof UserCard> = {
  title: 'Components/UserCard',
  component: UserCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UserCard>;

export const Default: Story = {
  args: {
    user: { name: 'Max Mustermann', role: 'ADMIN' },
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};
```

**Coder Rule (when active):**
- Every new component MUST have a `.stories.tsx` file
- Include all significant states (default, loading, error, empty)
- Add proper documentation with `tags: ['autodocs']`

---

## 11. Flyway (Database Migrations)

**Status: 🔜 PLANNED - USING EF CORE MIGRATIONS CURRENTLY**

**Current Approach:** EF Core Migrations
```bash
dotnet ef migrations add MigrationName
dotnet ef database update
```

**When Flyway is implemented:**

**Migration Location:** `Backend/migrations/`
```
migrations/
├── V1__Initial_schema.sql
├── V2__Add_tenant_table.sql
├── V3__Add_case_workflow.sql
└── V4__Add_audit_log.sql
```

**Naming Convention:**
```
V{version}__{description}.sql
R{version}__{description}.sql  (repeatable)
```

**Docker Service (to be added):**
```yaml
flyway:
  image: flyway/flyway:latest
  container_name: monetaris-flyway
  command: migrate
  volumes:
    - ./migrations:/flyway/sql
  environment:
    FLYWAY_URL: jdbc:postgresql://postgres:5432/monetaris
    FLYWAY_USER: monetaris_user
    FLYWAY_PASSWORD: monetaris_pass
  depends_on:
    postgres:
      condition: service_healthy
```

**Coder Rule (when active):**
- NEVER modify existing migrations
- ALWAYS create new migration for schema changes
- Use descriptive migration names
- Test migrations in both directions (up/down)

---

## Backend Architecture Patterns (MANDATORY)

### Vertical Slice Architecture

```
Backend/Monetaris.{Domain}/
├── api/                      ← 1 endpoint = 1 file (<150 lines)
│   ├── GetAll{Entity}.cs
│   ├── Get{Entity}ById.cs
│   ├── Create{Entity}.cs
│   ├── Update{Entity}.cs
│   ├── Delete{Entity}.cs
│   └── _TEMPLATE_*.cs        ← Copy these for new endpoints
├── services/
│   ├── I{Entity}Service.cs   ← Interface
│   └── {Entity}Service.cs    ← Implementation (<300 lines)
├── models/
│   ├── {Entity}Dto.cs
│   ├── Create{Entity}Request.cs
│   └── Update{Entity}Request.cs
├── tests/
│   ├── Create{Entity}.Tests.cs
│   └── {Entity}Service.Tests.cs
├── .editorconfig
└── README.md                 ← AI Instructions
```

### Result<T> Pattern (Error Handling)

```csharp
// ✅ ALWAYS return Result<T> from services
public async Task<Result<KreditorDto>> CreateAsync(CreateKreditorRequest request)
{
    // 1. Validation
    var validationResult = _validator.Validate(request);
    if (!validationResult.IsValid)
        return Result<KreditorDto>.Failure(validationResult.Errors);

    // 2. Business Logic
    var entity = _mapper.Map<Kreditor>(request);
    await _db.Kreditoren.AddAsync(entity);
    await _db.SaveChangesAsync();

    // 3. Return Success
    return Result<KreditorDto>.Success(_mapper.Map<KreditorDto>(entity));
}

// ✅ Handle Result in Controller
[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateKreditorRequest request)
{
    var result = await _service.CreateAsync(request);

    if (!result.IsSuccess)
        return BadRequest(new ProblemDetails { Detail = result.ErrorMessage });

    return CreatedAtAction(nameof(GetById), new { id = result.Data.Id }, result.Data);
}
```

### FluentValidation (Input Validation)

```csharp
// ✅ ALWAYS create validator for request models
public class CreateKreditorRequestValidator : AbstractValidator<CreateKreditorRequest>
{
    public CreateKreditorRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name ist erforderlich")
            .MaximumLength(200).WithMessage("Name darf maximal 200 Zeichen lang sein");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("E-Mail ist erforderlich")
            .EmailAddress().WithMessage("Ungültige E-Mail-Adresse");

        RuleFor(x => x.TaxId)
            .Matches(@"^DE\d{9}$").When(x => !string.IsNullOrEmpty(x.TaxId))
            .WithMessage("USt-IdNr muss Format DE123456789 haben");
    }
}
```

### Authorization Pattern

```csharp
// ✅ ALWAYS add [Authorize] with specific roles
[Authorize(Roles = "ADMIN,AGENT")]
[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateKreditorRequest request)

// ✅ Role hierarchy for Monetaris:
// ADMIN   - Full access
// AGENT   - Case handling, read clients
// CLIENT  - Own data only
// DEBTOR  - Own portal only
```

---

## Runner Enforcement Checklist

The **runner agent** validates ALL of these before marking PASS:

```
□ TypeScript: No .js/.jsx files created
□ OpenAPI: All endpoints have XML docs and [ProducesResponseType]
□ Prettier: npm run format:check passes
□ ESLint: npm run lint passes with 0 errors
□ Schemathesis: All API contracts pass
□ Playwright: E2E tests pass
□ Commitlint: Commit message follows convention
□ Serilog: All operations logged (spot check)
□ SonarQube: Quality gate passes
□ Backend Coverage: ≥ 90%
□ Frontend Coverage: ≥ 80%
□ Result<T>: Services return Result<T>
□ FluentValidation: Request models have validators
□ Vertical Slices: Files in correct locations
□ File Size: Endpoints <150 lines, Services <300 lines
```

---

## Quick Reference Card

| When creating... | You MUST... |
|------------------|-------------|
| **Frontend Component** | Use `.tsx`, add types, create story (when Storybook active) |
| **Frontend Test** | Use Vitest + RTL + MSW, achieve 80% coverage |
| **Backend Endpoint** | Copy template, add XML docs, add [Authorize], <150 lines |
| **Backend Service** | Return Result<T>, use ILogger, <300 lines |
| **Backend Model** | Create FluentValidation validator |
| **Database Change** | Create migration (EF Core now, Flyway later) |
| **Any Commit** | Use conventional format: `type(scope): description` |

