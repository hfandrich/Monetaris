---
description: "Erstelle Pull Request mit Monetaris-Standard-Format"
argument-hint: "pr-title"
---

# Pull Request Creator

Erstelle einen Pull Request: **$ARGUMENTS**

## Pre-Flight Checks

### 1. Branch Status prüfen

```bash
# Aktueller Branch
git branch --show-current

# Uncommitted Changes
git status

# Commits seit main
git log main..HEAD --oneline

# Diff zu main
git diff main..HEAD --stat
```

### 2. Quality Gates prüfen

Vor PR-Erstellung müssen alle Gates PASS sein:

- [ ] **Build**: `dotnet build` ohne Errors
- [ ] **Unit Tests**: Alle grün
- [ ] **Integration Tests**: Alle grün
- [ ] **Coverage Backend**: ≥90%
- [ ] **Coverage Frontend**: ≥80%
- [ ] **Security Audit**: PASS (keine CRITICAL/HIGH)

### 3. Push zu Remote

```bash
# Push mit Upstream Tracking
git push -u origin $(git branch --show-current)
```

## PR erstellen

```bash
gh pr create \
  --title "$ARGUMENTS" \
  --body "$(cat <<'EOF'
## Summary

[Kurze Beschreibung der Änderungen - 1-3 Sätze]

## Changes

### Added
- [Neue Features/Dateien]

### Changed
- [Geänderte Funktionalität]

### Fixed
- [Behobene Bugs]

## Test Plan

- [ ] Unit Tests passing
- [ ] Integration Tests passing
- [ ] Security Audit: PASS
- [ ] Coverage Backend: ≥90%
- [ ] Coverage Frontend: ≥80%

## Screenshots

[Falls UI-Änderungen - Playwright Screenshots einfügen]

## Checklist

- [ ] Code folgt Vertical Slice Architecture
- [ ] Endpoint-Dateien ≤150 Zeilen
- [ ] Service-Dateien ≤300 Zeilen
- [ ] Result<T> Pattern verwendet
- [ ] ILogger für alle Operationen
- [ ] XML Documentation vorhanden
- [ ] Tests für alle neuen Klassen

---
🤖 Generated with [Claude Code](https://claude.com/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

## Post-PR Actions

Nach PR-Erstellung:

1. **Zeige PR-URL** für direkten Zugriff
2. **CI/CD Status** beobachten:
   - GitHub Actions Build
   - SonarQube Quality Gate
   - Schemathesis API Tests
   - Playwright E2E Tests

3. **Bei CI Failure**:
   - Identifiziere fehlgeschlagene Checks
   - Invoke coder Agent für Fixes
   - Push Fixes
   - NICHT Force-Push verwenden

## Output

```
PULL REQUEST CREATED
====================

PR URL: https://github.com/[repo]/pull/[number]
Branch: [branch-name] → main

Status:
- Build: ⏳ Pending
- Tests: ⏳ Pending
- Security: ⏳ Pending
- Coverage: ⏳ Pending

Next Steps:
1. Wait for CI checks
2. Request review
3. Address feedback
4. Merge when approved
```
