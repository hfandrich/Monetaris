# Quality Tools - AI-First Development

## Philosophy

**AI writes 99% of code, tools validate 100% automatically.**

Human only reviews final PR when all tools are green ✅.

## Local Tools (Pre-Commit)

### Backend (.NET)

#### SonarLint
- **Purpose**: Real-time code quality analysis
- **Runs**: In IDE (VS Code/Visual Studio)
- **Configuration**: `Backend/.editorconfig`
- **Standards**: Naming conventions, code complexity, best practices

#### .NET Analyzer
- **Purpose**: Static code analysis
- **Runs**: On `dotnet build`
- **Configuration**: `.editorconfig` + project files
- **Enforced**: Warnings as errors in CI

#### Schemathesis
- **Purpose**: Automated API contract testing
- **Runs**: On-demand (requires running backend)
- **Configuration**: `Backend/infrastructure/testing/schemathesis.yaml`
- **Tests**: All 40 endpoints against OpenAPI spec (2000+ test cases)
- **Command**: `cd Backend/infrastructure/testing && ./run-contract-tests.sh` (or `.ps1` on Windows)
- **Checks**: Status codes, response schemas, no server errors, content types
- **Benefits**: Ensures API implementation matches OpenAPI specification

### Frontend (React + TypeScript)

#### Prettier
- **Purpose**: Code formatting
- **Runs**: Pre-commit hook + on-demand
- **Command**: `npm run format`
- **Configuration**: `.prettierrc.json`
- **Standards**: Indentation, quotes, line length

#### ESLint
- **Purpose**: Code quality linting
- **Runs**: Pre-commit hook + on-demand
- **Command**: `npm run lint`
- **Configuration**: `.eslintrc.json`
- **Standards**: TypeScript rules, React best practices

#### Commitlint
- **Purpose**: Enforce conventional commit messages
- **Runs**: commit-msg hook
- **Configuration**: `commitlint.config.js`
- **Format**: `type(scope): subject` (e.g., `feat(auth): add login endpoint`)

## Git Hooks (Husky)

Husky runs tools automatically before commits:

**pre-commit**:
1. Prettier formats code
2. ESLint checks quality
3. Files staged automatically

**commit-msg**:
1. Commitlint validates message format

## Workflow

```
AI writes code
    ↓
Git add + commit
    ↓
Pre-commit hook runs:
  - Prettier ✅
  - ESLint ✅
    ↓
Commit-msg hook runs:
  - Commitlint ✅
    ↓
Commit succeeds ✅
    ↓
Push to remote
    ↓
CI/CD pipeline runs (see infrastructure/ci-cd/)
```

## Commands

### Backend
```bash
cd Backend
dotnet build                    # Build + analyzers
dotnet test                     # Run tests

# API Contract Testing (requires running backend)
cd infrastructure/testing
./install-schemathesis.sh       # Install Schemathesis (one-time)
./run-contract-tests.sh         # Run contract tests (Linux/Mac)
./run-contract-tests.ps1        # Run contract tests (Windows)
```

### Frontend
```bash
cd Frontend
npm run format                  # Format all files
npm run format:check            # Check formatting
npm run lint                    # Lint TypeScript/React
npm run lint:fix                # Auto-fix lint issues
npm test                        # Run unit tests
```

## Quality Standards

- **Code Coverage**: Min 90%
- **Cyclomatic Complexity**: Max 10 per method
- **File Size**: Max 300 lines per class, 150 lines per endpoint
- **Naming**: PascalCase classes, camelCase methods, _camelCase private fields
- **Commit Messages**: Conventional Commits format
- **No Warnings**: CI builds with TreatWarningsAsErrors=true

## AI Instructions

When AI generates code:
1. ✅ Follow Vertical Slice Architecture patterns
2. ✅ Use templates from `{domain}/api/_TEMPLATE_*.cs`
3. ✅ Keep files under line limits
4. ✅ Run `npm run format && npm run lint` before committing
5. ✅ Write conventional commit messages
6. ✅ Ensure all local tools pass before push

**Goal**: 0 human intervention until PR review!
