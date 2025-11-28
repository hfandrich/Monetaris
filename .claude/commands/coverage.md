---
description: "Generiere Coverage-Report mit Gap-Analyse und Empfehlungen"
argument-hint: "backend|frontend|all (default: all)"
---

# Coverage Report

Generiere Coverage-Report für: **$1** (default: all)

## Backend Coverage

```bash
# Tests mit Coverage ausführen
dotnet test Backend/tests \
  --collect:"XPlat Code Coverage" \
  --results-directory ./coverage \
  --configuration Release

# Report generieren (wenn reportgenerator installiert)
reportgenerator \
  -reports:"./coverage/**/coverage.cobertura.xml" \
  -targetdir:"./coverage/report" \
  -reporttypes:Html
```

### Backend Thresholds

| Scope | Target | Minimum |
|-------|--------|---------|
| New files | 90% | 85% |
| Modified files | Don't decrease | +5% if touched |
| Shared/Utils | 95% | 90% |
| All domains | - | 85% (new files) |

## Frontend Coverage

```bash
cd Frontend

# Component Tests mit Coverage
npm run test:components -- --coverage

# API Tests mit Coverage
npm run test:api -- --coverage
```

### Frontend Thresholds

| Scope | Target | Minimum |
|-------|--------|---------|
| New Components | 85% | 80% |
| New Services | 90% | 85% |
| Utils | 95% | 90% |
| UI Pages | 65% | 60% + E2E |
| Modified files | Don't decrease | +5% if touched |

## Report Format

```
COVERAGE REPORT
===============

Backend Overall: XX.X%  [PASS/FAIL]
Frontend Overall: XX.X%  [PASS/FAIL]

DATEIEN UNTER THRESHOLD:
------------------------

Backend New Files (< 85%):
  Monetaris.Case/services/CaseService.cs      78% (-7%)
    - Uncovered lines: 45-48, 67-72, 123-130
    - Missing: Error handling branches

  Monetaris.Kreditor/api/UpdateKreditor.cs    82% (-3%)
    - Uncovered lines: 34-38
    - Missing: Validation error path

Modified Files (Coverage decreased):
  Monetaris.Shared/Utils.cs                   85% → 82% (-3%)
    - New uncovered: Line 45
    - Action: Add test or revert change

Frontend New Files (< 80%):
  components/ClaimDetailModal.tsx             65% (-15%)
    - Uncovered branches: Error states, Loading states

  services/dataService.ts                     72% (-8%)
    - Uncovered: Edge cases in filterByScope()

UI Pages (< 60% + missing E2E):
  pages/Dashboard.tsx                         55% (-5%)
    - Missing: E2E test for critical path

TOP 5 NIEDRIGSTE COVERAGE:
--------------------------
1. [FILE] - XX%
2. [FILE] - XX%
3. [FILE] - XX%
4. [FILE] - XX%
5. [FILE] - XX%

EMPFOHLENE NÄCHSTE TESTS:
-------------------------
1. Test für [SPECIFIC_SCENARIO] in [FILE]
2. Test für [SPECIFIC_SCENARIO] in [FILE]
3. Test für [SPECIFIC_SCENARIO] in [FILE]
```

## Feedback Loop

Wenn Coverage unter Threshold:
1. Identifiziere spezifische uncovered Lines
2. Erstelle Todo für fehlende Tests
3. Delegiere an coder Agent:
   ```
   "Add tests for [FILE] covering lines [X-Y].
   Specifically test: [SCENARIO]"
   ```
4. Re-run coverage nach Fix
5. Iteriere bis Threshold erreicht (max 3 Iterationen)
