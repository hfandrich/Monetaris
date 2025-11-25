# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Monetaris** is an enterprise-grade debt collection and dunning management system (Inkasso-/Mahnwesen) designed for the German market. It implements ZPO (Zivilprozessordnung) compliant workflows for managing collection cases from initial reminder through court proceedings to enforcement.

The system supports multi-tenant operations with role-based access control for:
- **ADMIN**: System administrators with full access
- **AGENT**: Case handlers (Sachbearbeiter) managing collection workflows
- **CLIENT**: Creditors (Mandanten/Gläubiger) who submit cases
- **DEBTOR**: Debtors (Schuldner) with limited portal access

## Architecture

### Frontend-Only Application (Currently)

The project is currently a **frontend-only React application** using:
- **React 19** with TypeScript
- **Vite** as build tool (port 3000)
- **React Router DOM 7** with HashRouter for routing
- **Lucide React** for icons
- **Recharts** for data visualization
- **Google Gemini AI** integration for intelligent case assistance

**Backend Status**: The `Backend/` directory is currently empty and reserved for future implementation.

## Backend Architecture: Vertical Slice Architecture

### Principles

Monetaris backend follows **Vertical Slice Architecture** optimized for AI-First development:

1. **Feature-Oriented**: Each endpoint = separate file (max 150 lines)
2. **Co-Location**: All code for a feature in one domain folder
3. **Minimal Coupling**: Domains are independent
4. **Template-Driven**: AI copies templates, not writes from scratch
5. **Test-Per-Class**: Every class has a corresponding test file

### Why Vertical Slice Over Traditional Layered?

**Traditional (❌ Token-Inefficient):**
```
Backend/
├── Controllers/           # All controllers together
│   ├── KreditorController.cs (300 lines)
│   └── DebtorController.cs (400 lines)
├── Services/              # All services together
│   ├── KreditorService.cs (500 lines)
│   └── DebtorService.cs (600 lines)
└── DTOs/                  # All DTOs together
```

**Problem:** AI must read 1000+ lines across 3+ directories to understand one feature.

**Vertical Slice (✅ Token-Efficient):**
```
Backend/
├── kreditor/
│   ├── api/              # 1 endpoint = 1 file
│   │   ├── GetAllKreditoren.cs (82 lines)
│   │   ├── CreateKreditor.cs (85 lines)
│   │   └── _TEMPLATE_Post.cs ← AI copies this
│   ├── services/
│   │   └── KreditorService.cs
│   ├── models/
│   └── README.md         ← AI reads this first (200 lines)
```

**Benefit:** AI reads 200 lines (README) + 50 lines (template) = 250 lines total. **87% token savings!**

### Domain Structure

Every domain follows this structure:

```
{domain-name}/
├── api/                   # Vertical Slices (1 endpoint = 1 file)
│   ├── CreateX.cs        # POST /api/{domain}
│   ├── GetAllX.cs        # GET /api/{domain}
│   ├── GetXById.cs       # GET /api/{domain}/{id}
│   ├── UpdateX.cs        # PUT /api/{domain}/{id}
│   ├── DeleteX.cs        # DELETE /api/{domain}/{id}
│   ├── _TEMPLATE_Get.cs  # Template for GET endpoints
│   ├── _TEMPLATE_Post.cs # Template for POST endpoints
│   ├── _TEMPLATE_Put.cs  # Template for PUT endpoints
│   └── _TEMPLATE_Delete.cs # Template for DELETE endpoints
├── services/              # Business Logic
│   ├── I{Domain}Service.cs
│   └── {Domain}Service.cs
├── models/                # DTOs (Data Transfer Objects)
│   ├── {Domain}Dto.cs
│   ├── Create{Domain}Request.cs
│   └── Update{Domain}Request.cs
├── tests/                 # Tests (1:1 mapping to classes)
│   ├── CreateX.Tests.cs
│   ├── GetAllX.Tests.cs
│   └── {Domain}Service.Tests.cs
├── .editorconfig          # Domain-specific code style
└── README.md              # 🤖 AI Instructions & Business Rules
```

### README.md as AI Knowledge Base

Every domain's README.md contains:

1. **Domain Overview**: What this domain does
2. **Endpoints**: All API routes with examples
3. **Business Rules**: Validation, authorization, workflows
4. **Services**: Method signatures and purposes
5. **Models**: DTO schemas
6. **🤖 AI Instructions**: How to create new endpoints using templates

**Example from kreditor/README.md:**

```markdown
## 🤖 AI Instructions

### When creating a new endpoint:
1. Copy `api/_TEMPLATE_Post.cs`
2. Replace placeholders:
   - [ENDPOINT_NAME] → CreateKreditor
   - [ROUTE] → kreditoren
   - [REQUEST_TYPE] → CreateKreditorRequest
3. Implement business logic call
4. Create test file: `tests/CreateKreditor.Tests.cs`
5. Run: `dotnet build && dotnet test`

### Code Standards:
- Max 150 lines per endpoint file
- Max 300 lines per service class
- Use Result<T> pattern
- Log all operations with ILogger
- Include XML documentation (///)
```

### 8 Domains Implemented

All domains follow this structure:

1. **kreditor** (5 endpoints) - Creditor/client management
2. **user** (6 endpoints) - Authentication & authorization
3. **debtor** (6 endpoints) - Debtor management
4. **document** (4 endpoints) - File upload/download
5. **inquiry** (3 endpoints) - Case Q&A
6. **template** (6 endpoints) - Communication templates
7. **dashboard** (3 endpoints) - Statistics & search
8. **case** (7 endpoints) - ZPO workflow (most complex)

### Code Quality Standards

**File Size Limits:**
- Endpoint files: ≤ 150 lines
- Service files: ≤ 300 lines
- Test files: ≤ 300 lines

**Required Elements:**
- XML documentation (///) for all public methods
- ILogger for all operations
- Result<T> pattern for service returns
- FluentValidation for request validation
- [Authorize] attributes with proper roles

**Testing Requirements:**
- Test file for EVERY class
- Unit tests + integration tests
- Target: 90% code coverage
- xUnit framework

### Development Workflow with AI

**Step 1: User creates issue**
```
User: "Add UpdateKreditor endpoint"
```

**Step 2: AI explores (uses MCP tools)**
```
AI: list_directory("Backend/kreditor/api")
    → sees all existing endpoints and templates
AI: read_file("Backend/kreditor/README.md")
    → learns business rules and code patterns
```

**Step 3: AI implements**
```
AI: Copies _TEMPLATE_Put.cs
AI: Replaces 3 placeholders
AI: Creates UpdateKreditor.cs (92 lines)
AI: Creates UpdateKreditor.Tests.cs (75 lines)
```

**Step 4: Local tools validate**
```
SonarLint → ✅ Green
Prettier → ✅ Formatted
ESLint → ✅ Green
Tests → ✅ All pass
```

**Step 5: Commit & Push**
```
Git hooks run automatically:
- pre-commit: format + lint + tests
- commit-msg: validate conventional commit format
```

**Step 6: CI/CD Pipeline**
```
GitHub Actions:
- Build ✅
- Unit Tests ✅
- Integration Tests ✅
- Schemathesis ✅
- Playwright E2E ✅
- SonarQube Quality Gate ✅
```

**Step 7: Human reviews PR (2-5 minutes)**
```
Human:
- Sees: 2 new files (endpoint + test)
- Sees: All checks ✅ Green
- Reviews: Business logic (2 minutes)
- Clicks: Merge button
```

**Time Savings:**
- Traditional: 2-4 hours dev + 1 hour test + 30 min review = 3.5-5.5 hours
- AI-First: 5 min AI + 2 min human = **95% time savings!**

### Token Efficiency Gains

**Before (Traditional):**
```
AI must read to create endpoint:
- Controllers/KreditorController.cs (300 lines)
- Services/KreditorService.cs (500 lines)
- DTOs/*.cs (200 lines)
- Shared/Models/*.cs (300 lines)
- Program.cs (500 lines)
= 1800 lines = ~7000 tokens
```

**After (Vertical Slice + MCP):**
```
AI reads:
- kreditor/README.md (200 lines)
- kreditor/api/_TEMPLATE_Put.cs (50 lines)
= 250 lines = ~1000 tokens

Token Savings: 86% reduction!
```

### Data Architecture

The application uses a **mock database layer** with localStorage persistence:

1. **db.ts** (`services/db.ts`): Core database class that simulates async operations with network delay. Stores data in localStorage under `monetaris_enterprise_db_v2`. Provides generic CRUD operations: `getAll()`, `getById()`, `create()`, `update()`.

2. **dataService.ts** (`services/dataService.ts`): Business logic layer that implements:
   - Role-based data filtering (`filterByScope()`)
   - Dashboard statistics calculation
   - Workflow management (status transitions, audit logging)
   - Multi-tenant access control
   - Global search with scoping

3. **authService.ts** (`services/authService.ts`): Authentication service with three login methods:
   - Standard email login (Admin/Agent/Client)
   - Debtor "magic link" login via case number + zip code
   - Session persistence via localStorage

4. **mockData.ts** (`services/mockData.ts`): Seed data for users, cases, debtors, tenants, templates, and documents.

### State Management

- Authentication state managed in `App.tsx` with `useState`
- User context passed through Layout component
- No external state management library (Redux, Zustand, etc.) currently used
- LocalStorage used for persistence of:
  - User session (`monetaris_token`, `monetaris_user`)
  - Database records (`monetaris_enterprise_db_v2`)
  - Theme preference (`monetaris_theme`)

### Routing Structure

The application uses nested routing with role-based protection:

```
/ (Landing)
/login (Admin/Agent/Client login)
/client-login (Dedicated client login)
/resolve (Debtor login via case number)
/pay/:caseId (Public payment page)

Protected routes (require authentication):
/dashboard (Main dashboard - redirects DEBTOR role)
/claims (Cases/claims list)
/debtors (Debtors list and management)
/debtors/:id (Detailed debtor view)
/compliance (Compliance monitoring)
/import (Batch import interface)
/clients (Tenants/clients management)
/clients/:id (Detailed client view)
/settings (User and system settings)
/templates (Communication templates)
/portal/client (Client-only portal view)
/portal/debtor (Debtor-only portal view)
```

### Legal Workflow (CaseStatus Enum)

Cases follow German legal dunning procedure (ZPO-compliant):

1. **Pre-Court Phase**: `DRAFT`, `NEW`, `REMINDER_1`, `REMINDER_2`, `ADDRESS_RESEARCH`
2. **Court Dunning Procedure**: `PREPARE_MB`, `MB_REQUESTED`, `MB_ISSUED`, `MB_OBJECTION`
3. **Enforcement Order**: `PREPARE_VB`, `VB_REQUESTED`, `VB_ISSUED`, `TITLE_OBTAINED`
4. **Enforcement**: `ENFORCEMENT_PREP`, `GV_MANDATED`, `EV_TAKEN`
5. **Closure**: `PAID`, `SETTLED`, `INSOLVENCY`, `UNCOLLECTIBLE`

MB = Mahnbescheid (dunning notice)
VB = Vollstreckungsbescheid (enforcement order)
GV = Gerichtsvollzieher (bailiff)
EV = Eidesstattliche Versicherung (affidavit of assets)

## Development Commands

### Running the Application

```bash
cd Frontend
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Environment Setup

Create `Frontend/.env.local` and set:
```
GEMINI_API_KEY=your_api_key_here
```

The Gemini API key is used for the AI assistant feature (GeminiAssistant component).

### Path Aliases

The project uses `@/*` alias mapping to the Frontend root directory (configured in `vite.config.ts` and `tsconfig.json`).

## Key Components

### Layout System

- **Layout.tsx**: Main layout wrapper with sidebar, header, theme management, and global keyboard shortcuts
- **AppSidebar.tsx**: Navigation sidebar with role-based menu items
- **AppHeader.tsx**: Top header with search, notifications, and user menu
- **CommandPalette.tsx**: Global command palette (Ctrl+K / Cmd+K)
- **ShortcutsModal.tsx**: Help overlay showing keyboard shortcuts (?)

### Theme System

Three themes supported: `'light'`, `'dark'`, `'barbie'`
- Theme state persisted in localStorage
- Applied via CSS classes on document root
- Tailwind CSS used for styling with custom color palette (monetaris-* colors)

### AI Integration

**GeminiAssistant.tsx**: Floating AI assistant with function calling capabilities:
- Dashboard statistics retrieval
- Database queries (cases, debtors)
- Workflow recommendations
- Risk analysis
- Document generation suggestions

Tools defined in component use Google Gemini function calling API.

## Data Models

Core domain types defined in `types.ts`:

- **User**: Authentication and role information
- **Tenant**: Multi-tenant client organizations (Mandanten)
- **Debtor**: Person or company owing money (Schuldner)
- **CollectionCase**: Individual collection case with financials, workflow status, and audit log
- **Address**: Address with status tracking (UNKNOWN, CONFIRMED, MOVED, DECEASED)
- **CommunicationTemplate**: Email/letter templates with placeholders
- **Document**: File attachments (PDFs, images)
- **Inquiry**: Q&A for case clarification
- **AuditLogEntry**: Audit trail for case history

### Financial Calculation

Cases have three amount components:
- `principalAmount`: Main debt (Hauptforderung)
- `costs`: Collection/court costs (Mahn-/Gerichtskosten)
- `interest`: Interest (Zinsen)
- `totalAmount`: Calculated sum of above three

## Component Organization

```
Frontend/
├── components/
│   ├── Layout.tsx (main layout container)
│   ├── UI.tsx (legacy UI components)
│   ├── ClaimDetailModal.tsx (case detail view)
│   ├── CreationWizard.tsx (multi-step case creation)
│   ├── GeminiAssistant.tsx (AI assistant)
│   ├── CommandPalette.tsx (command search)
│   ├── layout/ (header, sidebar, shortcuts)
│   └── ui/ (reusable UI elements, searchable selects)
├── pages/ (route components for each view)
├── services/ (data layer and authentication)
└── types.ts (TypeScript type definitions)
```

## Important Patterns

### Multi-Tenancy and Scoping

When fetching data, always use scoped methods from `dataService`:
- `getAccessibleTenants(user)`
- `getAccessibleCases(user)`
- `getAccessibleDebtors(user)`
- `getDashboardStats(user)`

These methods automatically filter data based on user role and assigned tenants.

### Workflow Advancement

Use `dataService.advanceWorkflow(caseId, newStatus, note, actor)` to:
- Change case status
- Add audit log entry
- Auto-calculate next action dates (e.g., 14-day deadline after MB request)

### Authentication Flow

1. User logs in via `authService.login()` or `authService.loginDebtor()`
2. Token and user object stored in localStorage
3. `App.tsx` checks session on mount via `authService.checkSession()`
4. Protected routes verify authentication and redirect if needed
5. User role determines UI visibility and data access

## Keyboard Shortcuts

Global shortcuts (handled in Layout.tsx):
- `Ctrl/Cmd + K`: Open command palette
- `Ctrl/Cmd + B`: Toggle sidebar
- `/`: Focus global search
- `?`: Show help/shortcuts modal

## Future Backend Integration

To replace mock database with real backend:

1. Update `services/db.ts` to use `fetch()` calls instead of localStorage
2. Replace `authService.ts` methods with API authentication (JWT/OAuth)
3. Remove `SEED_*` data from `mockData.ts`
4. Update environment variables for API endpoints
5. Backend directory is reserved for future C#/.NET implementation

## Domain Vocabulary

German legal/business terms used throughout:
- **Inkasso**: Debt collection
- **Mahnung**: Dunning/reminder letter
- **Mahnbescheid (MB)**: Court dunning order
- **Vollstreckungsbescheid (VB)**: Enforcement order
- **Gerichtsvollzieher (GV)**: Bailiff
- **Schuldner**: Debtor
- **Gläubiger**: Creditor
- **Mandant**: Client/tenant
- **Sachbearbeiter**: Case handler/agent
- **ZPO**: Zivilprozessordnung (German civil procedure code)
