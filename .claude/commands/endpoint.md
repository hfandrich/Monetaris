---
description: "Erstelle neuen Backend-Endpoint aus Vertical Slice Template"
argument-hint: "domain endpoint-name http-method"
---

# Endpoint Generator

Erstelle einen neuen Backend-Endpoint für Monetaris:

- **Domain**: $1 (z.B. Kreditor, Case, Debtor, Document, Inquiry, Template, Dashboard)
- **Endpoint Name**: $2 (z.B. GetKreditorById, UpdateCase, CreateDebtor)
- **HTTP Method**: $3 (Get, Post, Put, Delete)

## Workflow

### 1. Domain-Kontext lesen
Lies zuerst die Domain-README für Business Rules und bestehende Patterns:
- `Backend/Monetaris.$1/README.md`

### 2. Template kopieren
Kopiere das passende Template:
- `Backend/Monetaris.$1/api/_TEMPLATE_$3.cs.template`

### 3. Platzhalter ersetzen
Ersetze in der kopierten Datei:
- `[ENDPOINT_NAME]` → `$2`
- `[DOMAIN]` → `$1`
- `[HTTP_METHOD]` → `$3`

### 4. Endpoint erstellen
Erstelle: `Backend/Monetaris.$1/api/$2.cs`

### 5. Test erstellen
Erstelle Test-Datei: `Backend/tests/Monetaris.$1.Tests/$2.Tests.cs`

### 6. Build & Test
```bash
dotnet build Backend/Monetaris.$1
dotnet test Backend/tests/Monetaris.$1.Tests
```

## Code Standards (MUST)

- **Max 150 Zeilen** pro Endpoint-Datei
- **Result<T> Pattern** für Service-Aufrufe
- **ILogger** für alle Operationen
- **[Authorize]** Attribute mit korrekten Rollen
- **XML Documentation** (///) für public Methods
- **FluentValidation** für Request-Validation

## Beispiel-Output

Nach Ausführung solltest du haben:
1. `Backend/Monetaris.$1/api/$2.cs` (≤150 Zeilen)
2. `Backend/tests/Monetaris.$1.Tests/$2.Tests.cs` (≥90% Coverage)
3. Erfolgreicher Build
4. Alle Tests grün
