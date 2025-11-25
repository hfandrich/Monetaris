# Backend Implementation Plan - Monetaris

## 📋 Projektübersicht

Aufbau eines .NET 9 Backend für das Monetaris Inkasso-/Mahnwesen-System mit Migration der Mock-Daten aus dem Frontend in eine PostgreSQL Datenbank.

---

## 🏗️ Architektur-Entscheidungen

### Tech Stack
- **Framework**: .NET 9 (Microservices-ready, aber initial als Modular Monolith)
- **API Gateway**: Ocelot (vorbereitet für zukünftige Microservices)
- **Datenbank**: PostgreSQL 16 (Docker)
- **ORM**: Entity Framework Core 9
- **Migrations**: Flyway (für DB-Versionierung) + EF Core Migrations
- **Auth**: JWT Bearer mit Refresh Tokens
- **API Docs**: OpenAPI/Swagger (Swashbuckle)
- **Validation**: FluentValidation
- **Testing**: xUnit + Schemathesis + Playwright
- **Logging**: Serilog (Structured Logging)
- **Code Quality**: SonarQube (optional)

---

## 📦 Domain Contexts (Bounded Contexts)

Basierend auf den Frontend Mock-Daten:

```
Backend/
├── gateway/                          # API Gateway (Ocelot)
│   └── MonetarisGateway/
│
├── tenant/                           # Mandantenverwaltung (Gläubiger)
├── user/                             # Benutzerverwaltung & Authentication
├── debtor/                           # Schuldnerverwaltung
├── case/                             # Fallverwaltung (Kern-Domain)
├── document/                         # Dokumentenverwaltung
├── inquiry/                          # Anfragen/Rückfragen
├── template/                         # Kommunikationsvorlagen
├── dashboard/                        # Statistiken & KPIs
│
├── shared/                           # Shared Code
│   ├── utils/
│   ├── abstractions/
│   └── exceptions/
│
├── infrastructure/                   # Quality & DevOps
│   ├── docker/                      # Docker Compose für PostgreSQL
│   ├── quality/                     # Code Quality Rules
│   └── migrations/                  # Flyway Migrations
│
└── tests/                           # Separate Test Solution
    ├── UnitTests/
    ├── IntegrationTests/
    ├── ApiContractTests/            # Schemathesis
    └── E2ETests/                    # Playwright
```

---

## 🗄️ Datenbank-Schema

### Entities (PostgreSQL Tabellen)

#### **tenants** (Mandanten/Gläubiger)
```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    contact_email VARCHAR(200) NOT NULL,
    bank_account_iban VARCHAR(34) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **users** (Benutzer mit Rollen)
```sql
CREATE TYPE user_role AS ENUM ('ADMIN', 'AGENT', 'CLIENT', 'DEBTOR');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(500) NOT NULL,
    role user_role NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,  -- For CLIENT role
    avatar_initials VARCHAR(5),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Agents können mehrere Tenants betreuen
CREATE TABLE user_tenant_assignments (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, tenant_id)
);
```

#### **debtors** (Schuldner)
```sql
CREATE TYPE address_status AS ENUM ('UNKNOWN', 'RESEARCH_PENDING', 'CONFIRMED', 'MOVED', 'DECEASED');
CREATE TYPE risk_score AS ENUM ('A', 'B', 'C', 'D', 'E');

CREATE TABLE debtors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_company BOOLEAN NOT NULL DEFAULT FALSE,
    company_name VARCHAR(300),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(200),
    phone VARCHAR(50),

    -- Address embedded
    street VARCHAR(200),
    zip_code VARCHAR(10),
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Deutschland',
    address_status address_status DEFAULT 'UNKNOWN',
    address_last_checked TIMESTAMP,

    risk_score risk_score DEFAULT 'C',
    total_debt DECIMAL(15,2) DEFAULT 0.00,
    open_cases INT DEFAULT 0,
    notes TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_debtors_tenant ON debtors(tenant_id);
CREATE INDEX idx_debtors_agent ON debtors(agent_id);
```

#### **cases** (Inkassofälle) - HAUPTTABELLE
```sql
CREATE TYPE case_status AS ENUM (
    'DRAFT', 'NEW', 'REMINDER_1', 'REMINDER_2', 'ADDRESS_RESEARCH',
    'PREPARE_MB', 'MB_REQUESTED', 'MB_ISSUED', 'MB_OBJECTION',
    'PREPARE_VB', 'VB_REQUESTED', 'VB_ISSUED', 'TITLE_OBTAINED',
    'ENFORCEMENT_PREP', 'GV_MANDATED', 'EV_TAKEN',
    'PAID', 'SETTLED', 'INSOLVENCY', 'UNCOLLECTIBLE'
);

CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    debtor_id UUID NOT NULL REFERENCES debtors(id) ON DELETE RESTRICT,
    agent_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Financials
    principal_amount DECIMAL(15,2) NOT NULL,
    costs DECIMAL(15,2) DEFAULT 0.00,
    interest DECIMAL(15,2) DEFAULT 0.00,
    total_amount DECIMAL(15,2) GENERATED ALWAYS AS (principal_amount + costs + interest) STORED,
    currency VARCHAR(3) DEFAULT 'EUR',

    -- Workflow
    invoice_number VARCHAR(50) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status case_status DEFAULT 'NEW',
    next_action_date TIMESTAMP,

    -- Legal
    competent_court VARCHAR(200) DEFAULT 'Amtsgericht Coburg - Zentrales Mahngericht',
    court_file_number VARCHAR(50),

    ai_analysis TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cases_tenant ON cases(tenant_id);
CREATE INDEX idx_cases_debtor ON cases(debtor_id);
CREATE INDEX idx_cases_agent ON cases(agent_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_invoice ON cases(invoice_number);
```

#### **case_history** (Audit Log)
```sql
CREATE TABLE case_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    actor VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_case_history_case ON case_history(case_id);
```

#### **documents** (Dokumente)
```sql
CREATE TYPE document_type AS ENUM ('PDF', 'IMAGE', 'WORD', 'EXCEL');

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debtor_id UUID NOT NULL REFERENCES debtors(id) ON DELETE CASCADE,
    name VARCHAR(300) NOT NULL,
    type document_type NOT NULL,
    size_bytes BIGINT NOT NULL,
    file_path VARCHAR(500) NOT NULL,  -- S3/Filesystem path
    preview_url VARCHAR(500),
    uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_documents_debtor ON documents(debtor_id);
```

#### **inquiries** (Anfragen)
```sql
CREATE TYPE inquiry_status AS ENUM ('OPEN', 'RESOLVED');

CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT,
    status inquiry_status DEFAULT 'OPEN',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

CREATE INDEX idx_inquiries_case ON inquiries(case_id);
```

#### **templates** (Kommunikationsvorlagen)
```sql
CREATE TYPE template_type AS ENUM ('EMAIL', 'LETTER', 'SMS');
CREATE TYPE template_category AS ENUM ('REMINDER', 'LEGAL', 'PAYMENT', 'GENERAL');

CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    type template_type NOT NULL,
    category template_category NOT NULL,
    subject VARCHAR(300),  -- Für E-Mails
    content TEXT NOT NULL,
    last_modified TIMESTAMP DEFAULT NOW()
);
```

#### **refresh_tokens** (JWT Refresh Tokens)
```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    revoked_at TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
```

---

## 🚀 Implementierungs-Phasen

### **Phase 1: Foundation (Woche 1-2) - 10 Tage**

#### 1.1 Projekt Setup (2 Tage)
- [ ] .NET 9 Solution erstellen mit Domain Context Struktur
- [ ] Docker Compose für PostgreSQL 16 + pgAdmin
- [ ] Shared Projects (Utils, Abstractions, Exceptions)
- [ ] Git Repository Setup + .gitignore
- [ ] Prettier + ESLint für C# (CSharpier)

#### 1.2 Infrastruktur (2 Tage)
- [ ] PostgreSQL Connection String Configuration
- [ ] Entity Framework Core 9 Setup
- [ ] Flyway Integration für DB Migrations
- [ ] Serilog Structured Logging Setup
- [ ] OpenAPI/Swagger Configuration

#### 1.3 Shared Layer (2 Tage)
- [ ] Base Entity Pattern (Id, CreatedAt, UpdatedAt)
- [ ] Repository Pattern Interface
- [ ] Result<T> Pattern für fehlerfreundliche APIs
- [ ] Custom Exceptions (NotFoundException, ValidationException, etc.)
- [ ] JWT Helper Classes

#### 1.4 Database Schema (2 Tage)
- [ ] Flyway Migration V001: Enum Types erstellen
- [ ] Flyway Migration V002: Core Tables (tenants, users, debtors)
- [ ] Flyway Migration V003: Cases + History
- [ ] Flyway Migration V004: Documents, Inquiries, Templates
- [ ] Seed Data Migration (Mock-Daten import)

#### 1.5 Testing Setup (2 Tage)
- [ ] xUnit Test Projects erstellen
- [ ] Integration Test Base (Testcontainers für PostgreSQL)
- [ ] Schemathesis Setup für Contract Tests
- [ ] Playwright Setup für E2E Tests
- [ ] CI/CD Pipeline Vorbereitung (.github/workflows)

---

### **Phase 2: Authentication & Authorization (Woche 3) - 5 Tage**

#### 2.1 User Domain Context (3 Tage)
```
user/
├── api/
│   ├── Register.cs                  # POST /api/users/register
│   ├── Login.cs                     # POST /api/users/login
│   ├── RefreshToken.cs              # POST /api/users/refresh
│   ├── Logout.cs                    # POST /api/users/logout
│   ├── GetCurrentUser.cs            # GET /api/users/me
│   └── UpdateProfile.cs             # PUT /api/users/me
├── services/
│   ├── UserService.cs
│   ├── AuthService.cs
│   ├── PasswordHasher.cs
│   └── JwtTokenGenerator.cs
├── models/
│   ├── User.cs                      # Entity
│   ├── RefreshToken.cs              # Entity
│   ├── LoginRequest.cs
│   ├── RegisterRequest.cs
│   └── UserDto.cs
├── validators/
│   └── RegisterRequestValidator.cs
└── tests/
    └── AuthService.Tests.cs
```

**Endpoints:**
- `POST /api/auth/register` - Benutzer registrieren
- `POST /api/auth/login` - Login (Email/Password) → JWT + Refresh Token
- `POST /api/auth/login-debtor` - Debtor Login (CaseNumber + ZipCode)
- `POST /api/auth/refresh` - Refresh Token erneuern
- `POST /api/auth/logout` - Logout (Refresh Token revoken)
- `GET /api/users/me` - Aktueller User

#### 2.2 JWT & Authorization Policies (2 Tage)
- [ ] JWT Bearer Configuration (appsettings.json)
- [ ] Custom Authorization Policies (AdminOnly, AgentOrAdmin, etc.)
- [ ] Role-based Authorization Attributes
- [ ] Tenant-Scoped Data Filtering Middleware

---

### **Phase 3: Core Domain - Tenants (Woche 4) - 5 Tage**

#### 3.1 Tenant Domain Context (3 Tage)
```
tenant/
├── api/
│   ├── CreateTenant.cs              # POST /api/tenants
│   ├── ListTenants.cs               # GET /api/tenants
│   ├── GetTenantById.cs             # GET /api/tenants/{id}
│   ├── UpdateTenant.cs              # PUT /api/tenants/{id}
│   └── DeleteTenant.cs              # DELETE /api/tenants/{id}
├── services/
│   └── TenantService.cs
├── models/
│   ├── Tenant.cs
│   ├── TenantDto.cs
│   └── CreateTenantRequest.cs
└── tests/
    └── TenantService.Tests.cs
```

#### 3.2 Scoping & Multi-Tenancy (2 Tage)
- [ ] Tenant Context Provider (erkennt Tenant aus User Claims)
- [ ] Global Query Filter für Tenant-Scoped Entities
- [ ] Agent-Tenant Assignment Management

---

### **Phase 4: Core Domain - Debtors (Woche 5) - 5 Tage**

#### 4.1 Debtor Domain Context (4 Tage)
```
debtor/
├── api/
│   ├── CreateDebtor.cs              # POST /api/debtors
│   ├── ListDebtors.cs               # GET /api/debtors (mit Filtering)
│   ├── GetDebtorById.cs             # GET /api/debtors/{id}
│   ├── UpdateDebtor.cs              # PUT /api/debtors/{id}
│   ├── DeleteDebtor.cs              # DELETE /api/debtors/{id}
│   └── SearchDebtors.cs             # GET /api/debtors/search?q={query}
├── services/
│   ├── DebtorService.cs
│   └── AddressValidator.cs
├── models/
│   ├── Debtor.cs
│   ├── Address.cs (Value Object)
│   ├── DebtorDto.cs
│   └── CreateDebtorRequest.cs
└── tests/
    └── DebtorService.Tests.cs
```

**Besonderheiten:**
- Volltextsuche (PostgreSQL `ts_vector` für Namen)
- Risk Score Berechnung (Service)
- Address Validation

#### 4.2 Tests (1 Tag)
- [ ] Unit Tests für DebtorService
- [ ] Integration Tests für API Endpoints
- [ ] Schemathesis Contract Tests

---

### **Phase 5: Core Domain - Cases (Woche 6-7) - 10 Tage**

#### 5.1 Case Domain Context (7 Tage)
```
case/
├── api/
│   ├── CreateCase.cs                # POST /api/cases
│   ├── ListCases.cs                 # GET /api/cases (Pagination + Filters)
│   ├── GetCaseById.cs               # GET /api/cases/{id}
│   ├── UpdateCase.cs                # PUT /api/cases/{id}
│   ├── DeleteCase.cs                # DELETE /api/cases/{id}
│   ├── AdvanceWorkflow.cs           # POST /api/cases/{id}/advance
│   ├── GetCaseHistory.cs            # GET /api/cases/{id}/history
│   └── BulkImportCases.cs           # POST /api/cases/import (CSV)
├── services/
│   ├── CaseService.cs
│   ├── WorkflowEngine.cs            # ZPO-Workflow Logic
│   ├── CaseCalculator.cs            # Total Amount, Costs, Interest
│   ├── CourtDetector.cs             # Zuständiges Gericht ermitteln
│   └── CsvImporter.cs
├── models/
│   ├── Case.cs
│   ├── CaseHistory.cs
│   ├── CaseDto.cs
│   ├── CreateCaseRequest.cs
│   ├── AdvanceWorkflowRequest.cs
│   └── CaseStatus.cs (Enum)
└── tests/
    ├── CaseService.Tests.cs
    ├── WorkflowEngine.Tests.cs
    └── CsvImporter.Tests.cs
```

**Workflow-Logik (WorkflowEngine.cs):**
- Status-Transitionen validieren (z.B. NEW → REMINDER_1 → REMINDER_2 → PREPARE_MB)
- Automatische Berechnung von `nextActionDate` (z.B. 14 Tage nach MB_REQUESTED)
- Audit Log Entry bei jedem Status-Wechsel
- Debtor Statistics Update (totalDebt, openCases)

#### 5.2 Advanced Features (3 Tage)
- [ ] Pagination, Sorting, Filtering (PaginatedResult<T>)
- [ ] CSV Import mit Mapping (Provider: DATEV, SAP, LEXWARE, etc.)
- [ ] Bulk Operations (Status ändern für mehrere Cases)

---

### **Phase 6: Supporting Domains (Woche 8) - 5 Tage**

#### 6.1 Document Domain (2 Tage)
```
document/
├── api/
│   ├── UploadDocument.cs            # POST /api/debtors/{debtorId}/documents
│   ├── ListDocuments.cs             # GET /api/debtors/{debtorId}/documents
│   ├── DownloadDocument.cs          # GET /api/documents/{id}/download
│   └── DeleteDocument.cs            # DELETE /api/documents/{id}
├── services/
│   ├── DocumentService.cs
│   └── FileStorageService.cs        # Local/S3 abstraction
└── models/
    └── Document.cs
```

#### 6.2 Inquiry Domain (1 Tag)
```
inquiry/
├── api/
│   ├── CreateInquiry.cs             # POST /api/inquiries
│   ├── ListInquiries.cs             # GET /api/inquiries
│   ├── ResolveInquiry.cs            # PUT /api/inquiries/{id}/resolve
└── models/
    └── Inquiry.cs
```

#### 6.3 Template Domain (2 Tage)
```
template/
├── api/
│   ├── CreateTemplate.cs            # POST /api/templates
│   ├── ListTemplates.cs             # GET /api/templates
│   ├── GetTemplateById.cs           # GET /api/templates/{id}
│   ├── UpdateTemplate.cs            # PUT /api/templates/{id}
│   ├── DeleteTemplate.cs            # DELETE /api/templates/{id}
│   └── RenderTemplate.cs            # POST /api/templates/{id}/render
├── services/
│   └── TemplateRenderer.cs          # {{variable}} replacement
└── models/
    └── Template.cs
```

---

### **Phase 7: Dashboard & Analytics (Woche 9) - 5 Tage**

#### 7.1 Dashboard Domain (4 Tage)
```
dashboard/
├── api/
│   ├── GetDashboardStats.cs         # GET /api/dashboard/stats
│   ├── GetFinancialChart.cs         # GET /api/dashboard/financial
│   ├── GetRiskDistribution.cs       # GET /api/dashboard/risk
│   └── GetPerformanceMetrics.cs     # GET /api/dashboard/performance
├── services/
│   └── DashboardService.cs
└── models/
    ├── DashboardStatsDto.cs
    └── FinancialChartDto.cs
```

**KPIs:**
- `totalVolume` - Gesamte Forderungssumme
- `activeCases` - Aktive Fälle (nicht PAID/UNCOLLECTIBLE)
- `legalCases` - Fälle in gerichtlichem Verfahren
- `successRate` - Erfolgsquote (%)
- `projectedRecovery` - Voraussichtliche Einnahmen

#### 7.2 Global Search (1 Tag)
- [ ] `GET /api/search?q={query}` - Suche über Cases, Debtors, Tenants
- [ ] PostgreSQL Full-Text Search Integration

---

### **Phase 8: Quality & DevOps (Woche 10) - 5 Tage**

#### 8.1 Code Quality (2 Tage)
- [ ] SonarQube Setup (Docker)
- [ ] Code Coverage > 80%
- [ ] Static Code Analysis Rules

#### 8.2 Testing (2 Tage)
- [ ] Commitlint + Husky für Git Hooks
- [ ] Playwright E2E Tests (Frontend + Backend)
- [ ] Schemathesis API Contract Tests
- [ ] Performance Tests (Load Testing mit k6)

#### 8.3 CI/CD (1 Tag)
- [ ] GitHub Actions Workflow
  - Build + Test
  - Docker Image Build
  - SonarQube Scan
  - Deploy to Staging

---

### **Phase 9: API Gateway & Final Integration (Woche 11) - 5 Tage**

#### 9.1 Ocelot API Gateway (3 Tage)
```
gateway/
└── MonetarisGateway/
    ├── ocelot.json                  # Route Configuration
    ├── Program.cs
    └── appsettings.json
```

**Ocelot Routes:**
```json
{
  "Routes": [
    { "UpstreamPathTemplate": "/api/auth/{everything}", "DownstreamPathTemplate": "/api/auth/{everything}", "DownstreamScheme": "http", "DownstreamHostAndPorts": [{"Host": "localhost", "Port": 5001}] },
    { "UpstreamPathTemplate": "/api/tenants/{everything}", "DownstreamPathTemplate": "/api/tenants/{everything}", "DownstreamScheme": "http", "DownstreamHostAndPorts": [{"Host": "localhost", "Port": 5001}] }
  ]
}
```

#### 9.2 Frontend Integration (2 Tage)
- [ ] Frontend `services/dataService.ts` umschreiben auf `fetch()` API calls
- [ ] Frontend `services/authService.ts` umschreiben auf JWT
- [ ] Environment Variables für API URL
- [ ] CORS Configuration im Backend

---

## 📊 Timeline Zusammenfassung

| Phase | Beschreibung | Dauer | Status |
|-------|-------------|-------|---------|
| 1 | Foundation (Setup, DB, Testing) | 10 Tage | ⏳ Pending |
| 2 | Authentication & Authorization | 5 Tage | ⏳ Pending |
| 3 | Tenants Domain | 5 Tage | ⏳ Pending |
| 4 | Debtors Domain | 5 Tage | ⏳ Pending |
| 5 | Cases Domain (Core) | 10 Tage | ⏳ Pending |
| 6 | Supporting Domains (Docs, Inquiries, Templates) | 5 Tage | ⏳ Pending |
| 7 | Dashboard & Analytics | 5 Tage | ⏳ Pending |
| 8 | Quality & DevOps | 5 Tage | ⏳ Pending |
| 9 | API Gateway & Frontend Integration | 5 Tage | ⏳ Pending |
| **TOTAL** | | **55 Arbeitstage (~11 Wochen)** | |

---

## 🐳 Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: monetaris-db
    environment:
      POSTGRES_DB: monetaris
      POSTGRES_USER: monetaris_user
      POSTGRES_PASSWORD: monetaris_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - monetaris-network

  pgadmin:
    image: dpage/pgadmin4
    container_name: monetaris-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@monetaris.local
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres
    networks:
      - monetaris-network

  sonarqube:
    image: sonarqube:community
    container_name: monetaris-sonar
    ports:
      - "9000:9000"
    environment:
      - SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true
    networks:
      - monetaris-network

volumes:
  postgres_data:

networks:
  monetaris-network:
    driver: bridge
```

**Starten:**
```bash
docker-compose up -d
```

---

## 🔑 Connection String

```json
// appsettings.json
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
  "Serilog": {
    "MinimumLevel": "Information",
    "WriteTo": [
      { "Name": "Console" },
      { "Name": "File", "Args": { "path": "logs/monetaris-.log", "rollingInterval": "Day" } }
    ]
  }
}
```

---

## 🧪 Testing Strategie

### 1. Unit Tests (xUnit)
- **Services**: Geschäftslogik isoliert testen
- **Validators**: FluentValidation Rules
- **Utilities**: Helper Functions

### 2. Integration Tests (xUnit + Testcontainers)
- **API Endpoints**: HTTP Requests gegen echte DB
- **Database**: EF Core Queries mit PostgreSQL Container
- **Authentication**: JWT Token Flow

### 3. Contract Tests (Schemathesis)
- **OpenAPI Spec Validation**: Alle Endpoints gegen Swagger Schema testen
- **Auto-Generated Test Cases**: Property-based Testing

### 4. E2E Tests (Playwright)
- **User Flows**: Login → Dashboard → Create Case → Workflow Advance
- **Cross-Browser Testing**: Chromium, Firefox, WebKit

---

## 📝 Nächste Schritte

### Sofort starten:
```bash
# 1. Docker starten
cd infrastructure/docker
docker-compose up -d

# 2. .NET Solution erstellen
dotnet new sln -n Monetaris
dotnet new webapi -n MonetarisApi
dotnet sln add MonetarisApi

# 3. Domain Projects erstellen
dotnet new classlib -n Monetaris.Tenant
dotnet new classlib -n Monetaris.User
dotnet new classlib -n Monetaris.Debtor
dotnet new classlib -n Monetaris.Case
dotnet new classlib -n Monetaris.Shared

# 4. Test Projects erstellen
dotnet new xunit -n Monetaris.UnitTests
dotnet new xunit -n Monetaris.IntegrationTests

# 5. NuGet Packages installieren
dotnet add MonetarisApi package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add MonetarisApi package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add MonetarisApi package Swashbuckle.AspNetCore
dotnet add MonetarisApi package FluentValidation.AspNetCore
dotnet add MonetarisApi package Serilog.AspNetCore

# 6. Erste Migration
dotnet ef migrations add InitialCreate
dotnet ef database update
```

---

## 🎯 Erfolgskriterien

✅ **Funktional:**
- Alle Mock-Daten erfolgreich in PostgreSQL migriert
- Alle 8 Domain Contexts implementiert
- Frontend kann komplett auf Backend umgestellt werden
- ZPO-Workflow korrekt implementiert

✅ **Qualität:**
- Code Coverage > 80%
- SonarQube Quality Gate: Pass
- Alle Schemathesis Tests: Pass
- Alle Playwright E2E Tests: Pass

✅ **DevOps:**
- Docker Compose für lokale Entwicklung
- CI/CD Pipeline automatisiert
- Structured Logging in Production
- OpenAPI Dokumentation vollständig

---

**Bereit zum Start? 🚀**
