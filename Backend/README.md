# Monetaris Backend

.NET 9 Backend für das Monetaris Inkasso-/Mahnwesen-System.

## 🏗️ Architektur

**Domain-Driven Design** mit folgenden Bounded Contexts:
- `tenant/` - Mandantenverwaltung (Gläubiger)
- `user/` - Benutzerverwaltung & Authentication
- `debtor/` - Schuldnerverwaltung
- `case/` - Fallverwaltung (Kern-Domain)
- `document/` - Dokumentenverwaltung
- `inquiry/` - Anfragen/Rückfragen
- `template/` - Kommunikationsvorlagen
- `dashboard/` - Statistiken & KPIs

## 🚀 Quick Start

### Voraussetzungen
- .NET 9 SDK
- Docker Desktop
- PostgreSQL Client (optional, für lokale DB-Verwaltung)

### 1. Docker Datenbank starten

```bash
cd infrastructure/docker
docker-compose up -d
```

**Services:**
- PostgreSQL: `localhost:5432`
- pgAdmin: `http://localhost:5050` (admin@monetaris.local / admin)
- SonarQube: `http://localhost:9000` (admin / admin)

### 2. Projekt bauen

```bash
# Solution erstellen
dotnet new sln -n Monetaris

# API Projekt
dotnet new webapi -n MonetarisApi -o MonetarisApi
dotnet sln add MonetarisApi

# Domain Projects
dotnet new classlib -n Monetaris.Tenant -o tenant
dotnet new classlib -n Monetaris.User -o user
dotnet new classlib -n Monetaris.Debtor -o debtor
dotnet new classlib -n Monetaris.Case -o case
dotnet new classlib -n Monetaris.Document -o document
dotnet new classlib -n Monetaris.Inquiry -o inquiry
dotnet new classlib -n Monetaris.Template -o template
dotnet new classlib -n Monetaris.Dashboard -o dashboard
dotnet new classlib -n Monetaris.Shared -o shared

# Test Projects
dotnet new xunit -n Monetaris.UnitTests -o tests/UnitTests
dotnet new xunit -n Monetaris.IntegrationTests -o tests/IntegrationTests

# Alle zur Solution hinzufügen
dotnet sln add tenant user debtor case document inquiry template dashboard shared
dotnet sln add tests/UnitTests tests/IntegrationTests
```

### 3. NuGet Packages installieren

```bash
cd MonetarisApi

# PostgreSQL & EF Core
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.EntityFrameworkCore.Design

# Authentication
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer

# API Documentation
dotnet add package Swashbuckle.AspNetCore

# Validation
dotnet add package FluentValidation.AspNetCore

# Logging
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.Console
dotnet add package Serilog.Sinks.File

# Ocelot (API Gateway - separates Projekt)
# dotnet add package Ocelot
```

### 4. Datenbank Migrations

```bash
# Erste Migration erstellen
dotnet ef migrations add InitialCreate -o Data/Migrations

# Datenbank aktualisieren
dotnet ef database update

# Seed Data (Mock-Daten importieren)
dotnet run --project MonetarisApi -- seed
```

### 5. Starten

```bash
dotnet run --project MonetarisApi
```

API läuft auf: `https://localhost:5001`
Swagger UI: `https://localhost:5001/swagger`

## 📁 Projekt-Struktur

```
Backend/
├── gateway/                          # API Gateway (Ocelot)
│   └── MonetarisGateway/
│
├── tenant/                           # Domain Context
│   ├── api/
│   ├── services/
│   ├── models/
│   ├── validators/
│   └── tests/
│
├── user/                             # Domain Context
├── debtor/                           # Domain Context
├── case/                             # Domain Context (Hauptdomain)
├── document/                         # Domain Context
├── inquiry/                          # Domain Context
├── template/                         # Domain Context
├── dashboard/                        # Domain Context
│
├── shared/                           # Shared Code
│   ├── utils/
│   ├── abstractions/
│   └── exceptions/
│
├── infrastructure/                   # DevOps
│   ├── docker/
│   │   └── docker-compose.yml
│   └── migrations/
│
├── tests/                           # Tests
│   ├── UnitTests/
│   ├── IntegrationTests/
│   ├── ApiContractTests/
│   └── E2ETests/
│
└── MonetarisApi/                    # API Bootstrapper
    ├── Program.cs
    ├── appsettings.json
    └── Startup.cs
```

## 🗄️ Datenbank

**PostgreSQL 16** mit folgenden Tabellen:

### Core Tables
- `tenants` - Mandanten/Gläubiger
- `users` - Benutzer (Admin, Agent, Client, Debtor)
- `user_tenant_assignments` - Agent → Tenant Zuordnung
- `debtors` - Schuldner (Personen/Firmen)
- `cases` - Inkassofälle (Haupttabelle)
- `case_history` - Audit Log für Fälle

### Supporting Tables
- `documents` - Dokumente (PDFs, Bilder)
- `inquiries` - Anfragen zu Fällen
- `templates` - Kommunikationsvorlagen
- `refresh_tokens` - JWT Refresh Tokens

### Enums (PostgreSQL Types)
- `user_role`: ADMIN, AGENT, CLIENT, DEBTOR
- `case_status`: NEW, REMINDER_1, REMINDER_2, MB_REQUESTED, etc.
- `address_status`: UNKNOWN, CONFIRMED, MOVED, DECEASED
- `risk_score`: A, B, C, D, E
- `template_type`: EMAIL, LETTER, SMS
- `document_type`: PDF, IMAGE, WORD, EXCEL

## 🔐 Authentication

**JWT Bearer Tokens** mit Refresh Token Pattern:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "max@monetaris.com",
  "password": "password123"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "d8c7a9b0-...",
  "expiresIn": 3600,
  "user": {
    "id": "u2",
    "name": "Max Mustermann",
    "email": "max@monetaris.com",
    "role": "AGENT"
  }
}
```

**Roles & Permissions:**
- `ADMIN` - Vollzugriff auf alle Daten
- `AGENT` - Zugriff auf zugewiesene Tenants und eigene Fälle
- `CLIENT` - Zugriff nur auf eigenen Tenant
- `DEBTOR` - Zugriff nur auf eigene Fälle (via Portal)

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register          - Registrierung
POST   /api/auth/login             - Login (Email/Password)
POST   /api/auth/login-debtor      - Debtor Login (CaseNumber + ZipCode)
POST   /api/auth/refresh           - Token erneuern
POST   /api/auth/logout            - Logout
GET    /api/users/me               - Aktueller User
```

### Tenants (Mandanten)
```
GET    /api/tenants                - Liste aller Tenants
POST   /api/tenants                - Tenant erstellen
GET    /api/tenants/{id}           - Tenant Details
PUT    /api/tenants/{id}           - Tenant aktualisieren
DELETE /api/tenants/{id}           - Tenant löschen
```

### Debtors (Schuldner)
```
GET    /api/debtors                - Liste (Filter: tenantId, agentId, riskScore)
POST   /api/debtors                - Schuldner erstellen
GET    /api/debtors/{id}           - Schuldner Details + Fälle
PUT    /api/debtors/{id}           - Schuldner aktualisieren
DELETE /api/debtors/{id}           - Schuldner löschen
GET    /api/debtors/search?q=...   - Volltextsuche
```

### Cases (Fälle)
```
GET    /api/cases                  - Liste (Pagination, Filter, Sort)
POST   /api/cases                  - Fall erstellen
GET    /api/cases/{id}             - Fall Details
PUT    /api/cases/{id}             - Fall aktualisieren
DELETE /api/cases/{id}             - Fall löschen
POST   /api/cases/{id}/advance     - Workflow voranbringen
GET    /api/cases/{id}/history     - Audit Log
POST   /api/cases/import           - CSV Import
```

### Documents
```
POST   /api/debtors/{id}/documents - Dokument hochladen
GET    /api/debtors/{id}/documents - Alle Dokumente eines Schuldners
GET    /api/documents/{id}/download - Dokument herunterladen
DELETE /api/documents/{id}          - Dokument löschen
```

### Inquiries (Anfragen)
```
GET    /api/inquiries              - Liste aller Anfragen
POST   /api/inquiries              - Anfrage erstellen
PUT    /api/inquiries/{id}/resolve - Anfrage beantworten
```

### Templates (Vorlagen)
```
GET    /api/templates              - Alle Vorlagen
POST   /api/templates              - Vorlage erstellen
GET    /api/templates/{id}         - Vorlage laden
PUT    /api/templates/{id}         - Vorlage aktualisieren
DELETE /api/templates/{id}         - Vorlage löschen
POST   /api/templates/{id}/render  - Vorlage mit Daten rendern
```

### Dashboard
```
GET    /api/dashboard/stats        - KPI Statistiken
GET    /api/dashboard/financial    - Finanzübersicht
GET    /api/dashboard/risk         - Risikoverteilung
```

### Search
```
GET    /api/search?q=query         - Globale Suche (Cases, Debtors, Tenants)
```

## 🧪 Testing

### Unit Tests
```bash
dotnet test tests/UnitTests
```

### Integration Tests
```bash
# Mit Testcontainers (PostgreSQL Docker)
dotnet test tests/IntegrationTests
```

### API Contract Tests (Schemathesis)
```bash
# OpenAPI Schema validieren
schemathesis run https://localhost:5001/swagger/v1/swagger.json
```

### E2E Tests (Playwright)
```bash
cd tests/E2ETests
npm install
npx playwright test
```

## 📊 Logging

**Serilog** mit strukturiertem Logging:

```csharp
Log.Information("Case {CaseId} advanced to {Status} by {Agent}",
    caseId, newStatus, userId);
```

Logs werden geschrieben nach:
- **Console** (Development)
- **File** (`logs/monetaris-YYYY-MM-DD.log`)
- **Seq** (optional, strukturierte Log-Aggregation)

## 🔧 Konfiguration

### appsettings.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=monetaris;Username=monetaris_user;Password=monetaris_pass"
  },
  "Jwt": {
    "Secret": "your-super-secret-jwt-key-minimum-32-characters",
    "Issuer": "monetaris-api",
    "Audience": "monetaris-client",
    "ExpiryMinutes": 60,
    "RefreshTokenExpiryDays": 7
  },
  "FileStorage": {
    "Provider": "Local",
    "LocalPath": "./uploads",
    "MaxFileSizeMB": 10
  }
}
```

### appsettings.Development.json
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information"
    }
  }
}
```

## 🚀 Deployment

### Docker Build
```bash
docker build -t monetaris-api:latest .
docker run -p 5001:80 -e ASPNETCORE_ENVIRONMENT=Production monetaris-api:latest
```

### Docker Compose (Full Stack)
```bash
docker-compose -f docker-compose.production.yml up -d
```

## 📚 Weitere Dokumentation

- [BACKEND_PLAN.md](../BACKEND_PLAN.md) - Detaillierter Implementierungsplan
- [CLAUDE.md](../CLAUDE.md) - AI-Kontext für Code-Assistenten
- [API Documentation](https://localhost:5001/swagger) - OpenAPI/Swagger UI

## 🤝 Contributing

1. Branch erstellen: `git checkout -b feature/neue-funktion`
2. Änderungen committen (Commitlint-konform)
3. Tests schreiben und ausführen
4. Pull Request erstellen

## 📝 License

Proprietäre Software - Alle Rechte vorbehalten
