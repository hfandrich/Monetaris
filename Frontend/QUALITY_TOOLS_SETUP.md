# Quality Tools Setup Instructions

## Overview

Local quality tools have been configured for the Monetaris project:
- **Prettier**: Code formatting
- **ESLint**: Code quality linting
- **Commitlint**: Conventional commit messages
- **Husky**: Git hooks automation

## Current Status

✅ All tools installed and configured
✅ npm scripts ready to use
✅ Git hooks prepared

## Git Repository Initialization Required

The project is currently NOT a git repository. To enable automatic git hooks, initialize git:

### Step 1: Initialize Git Repository

```bash
# In the project root (Monetaris directory)
git init

# Configure git (if not already configured)
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Step 2: Activate Husky Git Hooks

Once git is initialized, activate Husky:

```bash
cd Frontend
npx husky install

# Set up prepare script (optional but recommended)
npm pkg set scripts.prepare="husky install"
```

This will automatically link the pre-commit and commit-msg hooks.

### Step 3: Verify Hooks Are Active

```bash
# Check that .git/hooks contains symlinks to .husky files
ls -la .git/hooks/
```

You should see:
- `pre-commit` → ../.husky/pre-commit
- `commit-msg` → ../.husky/commit-msg

## Manual Usage (Without Git Hooks)

You can run quality tools manually even without git:

### Frontend Commands

```bash
cd Frontend

# Format all code
npm run format

# Check formatting (without changing files)
npm run format:check

# Lint TypeScript/React code
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### Backend Commands

```bash
cd Backend

# Build with code analyzers
dotnet build /p:TreatWarningsAsErrors=true

# Run tests
dotnet test
```

## How Git Hooks Work (Once Active)

### Pre-Commit Hook
Runs automatically before every commit:
1. Formats all staged files with Prettier
2. Lints TypeScript/React files with ESLint
3. Re-stages formatted files
4. Blocks commit if linting fails

### Commit-Msg Hook
Runs automatically on commit message:
1. Validates commit message format
2. Enforces Conventional Commits standard
3. Blocks commit if message is invalid

## Commit Message Format

Use Conventional Commits format:

```
type(scope): subject

Examples:
feat(auth): add login endpoint
fix(ui): resolve button alignment issue
docs(readme): update installation instructions
chore(deps): upgrade react to v19
```

**Valid types**: feat, fix, docs, style, refactor, test, chore, revert

## Troubleshooting

### Husky hooks not running
- Verify git is initialized: `git status`
- Reinstall Husky: `cd Frontend && npx husky install`
- Check hook files are executable: `chmod +x Frontend/.husky/*`

### ESLint errors in existing code
This is expected! The tools were just installed. To fix:
```bash
cd Frontend
npm run lint:fix  # Auto-fix what can be fixed
npm run lint      # Review remaining issues
```

### Prettier changing too many files
This is normal on first run. Prettier enforces consistent formatting.
```bash
npm run format    # Format everything once
git add -A        # Stage all changes
git commit -m "chore: apply prettier formatting"
```

## IDE Integration

### VS Code
Install extensions for real-time feedback:
- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- SonarLint (`SonarSource.sonarlint-vscode`)

Configure VS Code to format on save:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["javascript", "typescript", "typescriptreact"]
}
```

## Documentation

- **Backend Quality Tools**: `Backend/infrastructure/quality/README.md`
- **SonarLint Setup**: `Backend/infrastructure/quality/sonar-lint-local.md`
- **ESLint Config**: `Frontend/eslint.config.js`
- **Prettier Config**: `Frontend/.prettierrc.json`
- **Commitlint Config**: `Frontend/commitlint.config.js`

## Next Steps

1. Initialize git repository (see Step 1 above)
2. Activate Husky hooks (see Step 2 above)
3. Run `npm run format && npm run lint:fix` to clean up existing code
4. Install IDE extensions for better DX
5. Start committing with conventional commit messages!

---

**Goal**: AI writes code, tools validate automatically, humans only review PRs when everything is green ✅
