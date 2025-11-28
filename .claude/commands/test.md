---
description: "Führe Tests für eine Domain oder den gesamten Stack aus"
argument-hint: "domain|frontend|backend|all [unit|integration|all]"
---

# Test Runner

Führe Tests aus für: **$1**
Test-Typ: **$2** (default: all)

## Backend Domain Tests

Wenn $1 eine Backend-Domain ist (Kreditor, Case, Debtor, Document, Inquiry, Template, Dashboard, Tenant, User):

```bash
# Unit Tests
dotnet test Backend/tests/Monetaris.$1.Tests --filter "Category=Unit" --verbosity normal

# Integration Tests
dotnet test Backend/tests/Monetaris.$1.Tests --filter "Category=Integration" --verbosity normal

# Alle Tests mit Coverage
dotnet test Backend/tests/Monetaris.$1.Tests --collect:"XPlat Code Coverage"
```

## Frontend Tests

Wenn $1 = "frontend":

```bash
cd Frontend

# Component Tests
npm run test:components

# API Integration Tests (MSW)
npm run test:api

# E2E Tests (Playwright)
npm run test:e2e
```

## Gesamter Backend

Wenn $1 = "backend":

```bash
dotnet test Backend/tests/Monetaris.UnitTests
dotnet test Backend/tests/Monetaris.IntegrationTests
```

## Alles

Wenn $1 = "all":

```bash
# Backend
dotnet test Backend/tests --collect:"XPlat Code Coverage"

# Frontend
cd Frontend && npm run test
```

## Ausgabe

Zeige nach Test-Durchlauf:
1. **Anzahl Tests**: Bestanden / Fehlgeschlagen / Übersprungen
2. **Coverage %**: Gesamt und pro Datei
3. **Dateien unter Threshold**: Backend <90%, Frontend <80%
4. **Fehlgeschlagene Tests**: Name und Fehlermeldung

## Quality Gates

| Bereich | Threshold | Status |
|---------|-----------|--------|
| Backend Unit | ≥90% | ❓ |
| Backend Integration | ≥90% | ❓ |
| Frontend Components | ≥80% | ❓ |
| Frontend E2E | Critical Paths | ❓ |
