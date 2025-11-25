# Monetaris.Case Domain

**The core domain of Monetaris** - manages collection cases through the complete German legal debt collection workflow (ZPO-compliant).

This is the **most complex and important domain** in the system, implementing the entire lifecycle of collection cases from initial reminder through court proceedings to enforcement and closure.

## Domain Overview

The Case domain handles:
- **Collection Cases (Inkassofälle)**: Individual debt collection cases with complete financial tracking
- **ZPO Workflow Engine**: German civil procedure (Zivilprozessordnung) compliant status transitions
- **Multi-Phase Legal Process**: Pre-court reminders → Court dunning → Enforcement order → Bailiff enforcement
- **Audit Logging**: Complete history of all case actions and status changes
- **Financial Management**: Principal amount, costs, interest with auto-calculation
- **Multi-Tenancy**: Role-based access control (ADMIN/AGENT/CLIENT scoping)

## API Endpoints

### 1. GET /api/cases
Get all cases with filtering and pagination.

**Authorization**: All authenticated roles (ADMIN, AGENT, CLIENT, DEBTOR)

**Query Parameters**:
- `TenantId` (Guid, optional): Filter by tenant/kreditor
- `DebtorId` (Guid, optional): Filter by debtor
- `AgentId` (Guid, optional): Filter by assigned agent
- `Status` (CaseStatus, optional): Filter by workflow status
- `Page` (int, default=1): Page number
- `PageSize` (int, default=20): Items per page

**Role-Based Scoping**:
- **ADMIN**: Sees all cases across all tenants
- **AGENT**: Sees cases for assigned tenants only
- **CLIENT**: Sees only their own tenant's cases
- **DEBTOR**: No access (uses Portal endpoints)

**Response**: `200 OK`
```json
{
  "items": [
    {
      "id": "uuid",
      "invoiceNumber": "INV-2024-001",
      "debtorName": "Max Mustermann",
      "status": "REMINDER_1",
      "totalAmount": 1500.00,
      "nextActionDate": "2024-02-01T00:00:00Z",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 42
}
```

### 2. GET /api/cases/{id}
Get a specific case by ID with full details.

**Authorization**: All authenticated roles (must have access to case)

**Path Parameters**:
- `id` (Guid): Case ID

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "debtorId": "uuid",
  "agentId": "uuid",
  "principalAmount": 1200.00,
  "costs": 250.00,
  "interest": 50.00,
  "totalAmount": 1500.00,
  "currency": "EUR",
  "invoiceNumber": "INV-2024-001",
  "invoiceDate": "2023-12-01T00:00:00Z",
  "dueDate": "2023-12-31T00:00:00Z",
  "status": "REMINDER_1",
  "nextActionDate": "2024-02-01T00:00:00Z",
  "competentCourt": "Amtsgericht Coburg - Zentrales Mahngericht",
  "courtFileNumber": null,
  "aiAnalysis": "Risk: Medium. Debtor has history of payment delays.",
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-15T14:30:00Z",
  "tenantName": "Immobilien GmbH",
  "debtorName": "Max Mustermann",
  "agentName": "Anna Schmidt"
}
```

**Error Responses**:
- `404 Not Found`: Case not found
- `403 Forbidden`: User does not have access to this case

### 3. POST /api/cases
Create a new collection case.

**Authorization**: ADMIN, AGENT, CLIENT

**Request Body**:
```json
{
  "tenantId": "uuid",
  "debtorId": "uuid",
  "agentId": "uuid (optional)",
  "principalAmount": 1200.00,
  "costs": 0,
  "interest": 0,
  "currency": "EUR",
  "invoiceNumber": "INV-2024-001",
  "invoiceDate": "2023-12-01T00:00:00Z",
  "dueDate": "2023-12-31T00:00:00Z",
  "competentCourt": "Amtsgericht Coburg - Zentrales Mahngericht",
  "courtFileNumber": null
}
```

**Business Rules**:
- Case starts in `NEW` status automatically
- Debtor must exist and belong to the specified tenant
- Invoice number must be unique within tenant
- User must have access to the tenant
- Initial audit log entry created automatically
- Debtor's `TotalDebt` and `OpenCases` counters updated

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "status": "NEW",
  "nextActionDate": "2024-01-08T00:00:00Z",
  ...
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors (duplicate invoice, invalid debtor, etc.)
- `403 Forbidden`: No access to tenant

### 4. PUT /api/cases/{id}
Update case details (NOT workflow status - use AdvanceWorkflow for that).

**Authorization**: ADMIN, AGENT

**Path Parameters**:
- `id` (Guid): Case ID

**Request Body**:
```json
{
  "agentId": "uuid (optional)",
  "principalAmount": 1200.00,
  "costs": 250.00,
  "interest": 50.00,
  "currency": "EUR",
  "competentCourt": "Amtsgericht Coburg - Zentrales Mahngericht",
  "courtFileNumber": "123 C 456/24",
  "aiAnalysis": "Updated risk analysis"
}
```

**Business Rules**:
- Cannot update case status here (use `/cases/{id}/advance` endpoint)
- Cannot update cases in final states (PAID, SETTLED, UNCOLLECTIBLE, INSOLVENCY)
- Financial amount changes update debtor's `TotalDebt` automatically
- Agent must have AGENT role if specified
- Audit log entry created automatically

**Response**: `200 OK` (updated case)

**Error Responses**:
- `404 Not Found`: Case not found
- `403 Forbidden`: No access to case
- `400 Bad Request`: Validation errors

### 5. DELETE /api/cases/{id}
Soft-delete a case.

**Authorization**: ADMIN only

**Path Parameters**:
- `id` (Guid): Case ID

**Business Rules**:
- **HIGHLY RESTRICTED**: Only ADMIN role can delete
- Can only delete cases in `DRAFT` or `NEW` status
- **Cannot delete** cases in court proceedings (MB_REQUESTED or later)
- Debtor's `TotalDebt` and `OpenCases` counters updated automatically

**Response**: `204 No Content`

**Error Responses**:
- `404 Not Found`: Case not found
- `403 Forbidden`: Not ADMIN role
- `400 Bad Request`: Case cannot be deleted (wrong status)

### 6. PUT /api/cases/{id}/advance ⚠️ MOST IMPORTANT ENDPOINT
Advance case workflow status through ZPO-compliant transitions.

**This is the CORE workflow management endpoint for German legal debt collection.**

**Authorization**: ADMIN, AGENT

**Path Parameters**:
- `id` (Guid): Case ID

**Request Body**:
```json
{
  "newStatus": "REMINDER_1",
  "note": "First reminder sent via registered mail (optional)"
}
```

**ZPO Workflow Phases**:

**Phase 1: Pre-Court Reminders (Außergerichtlich)**
- `DRAFT` → `NEW` (Case created, ready to process)
- `NEW` → `REMINDER_1` (First reminder sent - 7 days to pay)
- `REMINDER_1` → `REMINDER_2` (Second reminder sent - 14 days to pay)
- `REMINDER_2` → `PREPARE_MB` (Prepare court dunning request)

**Phase 2: Court Dunning Procedure (Mahnverfahren - §§ 688-703e ZPO)**
- `PREPARE_MB` → `MB_REQUESTED` (Mahnbescheid requested from court)
- `MB_REQUESTED` → `MB_ISSUED` (Court issued dunning notice - typically 2-3 weeks)
- `MB_ISSUED` → `MB_OBJECTION` (Debtor filed objection - § 339 ZPO)
- `MB_ISSUED` → `PREPARE_VB` (No objection - prepare enforcement order)

**Phase 3: Enforcement Order (Vollstreckungsbescheid - §§ 699-703 ZPO)**
- `PREPARE_VB` → `VB_REQUESTED` (Enforcement order requested)
- `VB_REQUESTED` → `VB_ISSUED` (Enforcement order issued)
- `VB_ISSUED` → `TITLE_OBTAINED` (Title becomes enforceable after waiting period)

**Phase 4: Enforcement (Zwangsvollstreckung - §§ 704-915h ZPO)**
- `TITLE_OBTAINED` → `ENFORCEMENT_PREP` (Prepare enforcement measures)
- `ENFORCEMENT_PREP` → `GV_MANDATED` (Bailiff (Gerichtsvollzieher) mandated)
- `GV_MANDATED` → `EV_TAKEN` (Affidavit of assets (Eidesstattliche Versicherung) taken)

**Phase 5: Address Research**
- `NEW/REMINDER_1/REMINDER_2` → `ADDRESS_RESEARCH` (Debtor address unknown)
- `ADDRESS_RESEARCH` → `REMINDER_1/REMINDER_2/PREPARE_MB` (Address found)
- `ADDRESS_RESEARCH` → `UNCOLLECTIBLE` (Address not found)

**Phase 6: Closure States (Terminal - No Further Transitions)**
- Any active status → `PAID` (Debt fully paid)
- Any active status → `SETTLED` (Settlement agreement reached)
- Any active status → `INSOLVENCY` (Debtor filed insolvency)
- Any active status → `UNCOLLECTIBLE` (Case deemed uncollectible)

**Business Rules**:
- **Workflow validation**: WorkflowEngine validates all transitions (cannot skip states or go backwards)
- **Auto-calculation**: NextActionDate calculated automatically based on new status
- **Audit logging**: Complete history entry created with actor name and optional note
- **Debtor statistics**: Updates debtor's `OpenCases` and `TotalDebt` on closure
- **Final states**: PAID, SETTLED, INSOLVENCY, UNCOLLECTIBLE cannot transition further
- **No backwards**: Cannot go from MB_REQUESTED back to NEW (workflow is unidirectional)

**Auto-Calculated NextActionDate by Status**:
- `NEW`: +7 days (first reminder)
- `REMINDER_1`: +14 days (second reminder)
- `REMINDER_2`: +14 days (escalation)
- `PREPARE_MB`: +3 days (submit to court)
- `MB_REQUESTED`: +21 days (court processing)
- `MB_ISSUED`: +14 days (objection period per § 339 ZPO)
- `PREPARE_VB`: +3 days (prepare enforcement order)
- `VB_REQUESTED`: +14 days (court processing)
- `VB_ISSUED`: +7 days (waiting period)
- `TITLE_OBTAINED`: +7 days (prepare enforcement)
- `ENFORCEMENT_PREP`: +7 days (mandate bailiff)
- `GV_MANDATED`: +30 days (bailiff action)
- `EV_TAKEN`: +60 days (review progress)
- `ADDRESS_RESEARCH`: +30 days (address lookup)
- Closure states: `null` (no further action)

**Response**: `200 OK` (updated case with new status)

**Error Responses**:
- `404 Not Found`: Case not found
- `403 Forbidden`: No access to case
- `400 Bad Request`: Invalid workflow transition (e.g., "Invalid workflow transition from NEW to MB_REQUESTED")

**Example Valid Transitions**:
```
NEW → REMINDER_1 → REMINDER_2 → PREPARE_MB → MB_REQUESTED → MB_ISSUED → PREPARE_VB → VB_REQUESTED → VB_ISSUED → TITLE_OBTAINED → ENFORCEMENT_PREP → GV_MANDATED → EV_TAKEN → PAID
```

**Example Invalid Transitions**:
```
NEW → MB_REQUESTED ❌ (must go through REMINDER_1, REMINDER_2, PREPARE_MB first)
MB_REQUESTED → NEW ❌ (cannot go backwards)
PAID → REMINDER_1 ❌ (final states cannot transition)
```

### 7. GET /api/cases/{id}/history
Get complete audit log for a case.

**Authorization**: All authenticated roles (must have access to case)

**Path Parameters**:
- `id` (Guid): Case ID

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "action": "STATUS_CHANGE",
    "details": "Status changed from NEW to REMINDER_1. Note: First reminder sent",
    "actor": "Anna Schmidt",
    "createdAt": "2024-01-15T14:30:00Z"
  },
  {
    "id": "uuid",
    "action": "UPDATED",
    "details": "Case details updated",
    "actor": "Anna Schmidt",
    "createdAt": "2024-01-10T11:20:00Z"
  },
  {
    "id": "uuid",
    "action": "CREATED",
    "details": "Case created with status NEW",
    "actor": "Max Admin",
    "createdAt": "2024-01-01T10:00:00Z"
  }
]
```

**Action Types**:
- `CREATED`: Case initially created
- `STATUS_CHANGE`: Workflow status advanced
- `UPDATED`: Case details modified

**Error Responses**:
- `404 Not Found`: Case not found
- `403 Forbidden`: No access to case

## ZPO Workflow Documentation

### Complete Status State Machine

```
                    ┌─────────────────────────────────────────┐
                    │         PRE-COURT PHASE                 │
                    │      (Außergerichtlich)                 │
                    └─────────────────────────────────────────┘
                                    │
                              ┌─────▼─────┐
                              │   DRAFT   │ (initial creation)
                              └─────┬─────┘
                                    │
                              ┌─────▼─────┐
                              │    NEW    │ (ready for processing)
                              └─────┬─────┘
                                    │
                         ┌──────────┼──────────┐
                         │          │          │
                    ┌────▼────┐     │     ┌────▼─────────────┐
                    │REMINDER_1│     │     │ADDRESS_RESEARCH  │
                    └────┬────┘     │     └────┬─────────────┘
                         │          │          │
                    ┌────▼────┐     │     ┌────▼────┐
                    │REMINDER_2│     │     │Can return│
                    └────┬────┘     │     │to flow   │
                         │          │     └──────────┘
                    ┌────▼─────┐    │
                    │PREPARE_MB│    │
                    └────┬─────┘    │
                         │          │
    ┌────────────────────┴──────────┴─────────────────────┐
    │         COURT DUNNING PROCEDURE                      │
    │    (Mahnverfahren - §§ 688-703e ZPO)                │
    └──────────────────────────────────────────────────────┘
                         │
                    ┌────▼──────┐
                    │MB_REQUESTED│ (Mahnbescheid requested)
                    └────┬──────┘
                         │
                    ┌────▼─────┐
                    │MB_ISSUED │ (Court dunning notice issued)
                    └────┬─────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
         ┌────▼──────┐   │   ┌──────▼─────┐
         │MB_OBJECTION│   │   │PREPARE_VB  │ (no objection)
         └────┬──────┘   │   └──────┬─────┘
              │          │          │
    ┌─────────┴──────────┴──────────┴───────────────────┐
    │         ENFORCEMENT ORDER                          │
    │   (Vollstreckungsbescheid - §§ 699-703 ZPO)       │
    └────────────────────────────────────────────────────┘
                                    │
                              ┌─────▼──────┐
                              │VB_REQUESTED│
                              └─────┬──────┘
                                    │
                              ┌─────▼─────┐
                              │VB_ISSUED  │
                              └─────┬─────┘
                                    │
                              ┌─────▼────────┐
                              │TITLE_OBTAINED│
                              └─────┬────────┘
                                    │
    ┌───────────────────────────────┴────────────────────────┐
    │            ENFORCEMENT                                  │
    │   (Zwangsvollstreckung - §§ 704-915h ZPO)              │
    └─────────────────────────────────────────────────────────┘
                                    │
                         ┌──────────▼──────────┐
                         │ ENFORCEMENT_PREP    │
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │   GV_MANDATED       │ (Bailiff)
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │    EV_TAKEN         │ (Affidavit)
                         └──────────┬──────────┘
                                    │
    ┌───────────────────────────────┴────────────────────────┐
    │              CLOSURE STATES                            │
    │             (Terminal - No Further Transitions)        │
    └────────────────────────────────────────────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │           │         │         │           │
         ┌────▼───┐  ┌────▼────┐ ┌─▼────────┐ ┌─────────▼──┐
         │  PAID  │  │SETTLED  │ │INSOLVENCY│ │UNCOLLECTIBLE│
         └────────┘  └─────────┘ └──────────┘ └────────────┘
```

### German Legal Terms Explained

- **Mahnbescheid (MB)**: Court-issued dunning notice that gives debtor 2 weeks to object or pay
- **Vollstreckungsbescheid (VB)**: Enforcement order that becomes an enforceable title if not objected
- **Gerichtsvollzieher (GV)**: Bailiff who executes enforcement measures (asset seizure, etc.)
- **Eidesstattliche Versicherung (EV)**: Affidavit of assets where debtor must disclose all property
- **Zwangsvollstreckung**: Forced enforcement/execution (bailiff seizure, wage garnishment, etc.)
- **ZPO**: Zivilprozessordnung (German Civil Procedure Code)
- **Inkasso**: Debt collection
- **Mahnung**: Dunning letter/reminder
- **Schuldner**: Debtor
- **Gläubiger**: Creditor
- **Sachbearbeiter**: Case handler/agent

### Timeline Expectations

**Pre-Court Phase** (4-6 weeks):
- NEW: Case opened, 7 days to first reminder
- REMINDER_1: First reminder sent, 14 days to pay
- REMINDER_2: Second reminder sent, 14 days to pay
- PREPARE_MB: Prepare court documents, 3 days

**Court Dunning Phase** (6-8 weeks):
- MB_REQUESTED: Submit to court, 2-3 weeks processing
- MB_ISSUED: Debtor has 2 weeks to object (§ 339 ZPO)
- If no objection: Proceed to enforcement order

**Enforcement Order Phase** (4-6 weeks):
- PREPARE_VB: Prepare application, 3 days
- VB_REQUESTED: Court processes, 2 weeks
- VB_ISSUED: Waiting period, 1 week
- TITLE_OBTAINED: Enforceable title obtained

**Enforcement Phase** (3-6 months):
- ENFORCEMENT_PREP: Prepare measures, 1 week
- GV_MANDATED: Bailiff attempts collection, 1 month
- EV_TAKEN: Asset disclosure, review progress

**Total Duration**:
- Uncontested case: ~3-4 months (NEW → TITLE_OBTAINED)
- With enforcement: 6-12 months (NEW → GV_MANDATED)
- Difficult cases: 12-24 months

## Business Rules

### Workflow Validation (WorkflowEngine)

The `WorkflowEngine` service enforces all valid transitions:

**Cannot Skip States**:
- ❌ NEW → MB_REQUESTED (must go through REMINDER_1, REMINDER_2, PREPARE_MB)
- ✅ NEW → REMINDER_1 → REMINDER_2 → PREPARE_MB → MB_REQUESTED

**Cannot Go Backwards**:
- ❌ MB_REQUESTED → NEW
- ❌ VB_ISSUED → MB_ISSUED
- ✅ Only forward progression through workflow

**Emergency Exits Allowed**:
- ✅ Any active state → PAID (debtor paid)
- ✅ Any active state → SETTLED (settlement reached)
- ✅ Any active state → INSOLVENCY (debtor insolvent)
- ✅ Any active state → UNCOLLECTIBLE (case abandoned)

**Final States Are Terminal**:
- ❌ PAID → any state (cannot reopen paid case)
- ❌ UNCOLLECTIBLE → REMINDER_1 (cannot revive abandoned case)

### Financial Calculations

**Auto-Calculated Total**:
```
TotalAmount = PrincipalAmount + Costs + Interest
```

**Example**:
- PrincipalAmount: €1,200.00 (original debt)
- Costs: €250.00 (collection/court fees)
- Interest: €50.00 (5% p.a. for 60 days late)
- **TotalAmount: €1,500.00** (automatically calculated)

**Debtor Statistics Auto-Update**:
- When case created: `Debtor.TotalDebt += Case.TotalAmount`, `Debtor.OpenCases += 1`
- When amounts updated: `Debtor.TotalDebt` adjusted by difference
- When case paid/settled: `Debtor.TotalDebt -= Case.TotalAmount`, `Debtor.OpenCases -= 1`
- When case closed (other): `Debtor.OpenCases -= 1`

### Multi-Tenancy & Authorization

**Access Control Matrix**:

| Role   | GetAll | GetById | Create | Update | Delete | Advance | History |
|--------|--------|---------|--------|--------|--------|---------|---------|
| ADMIN  | All    | All     | ✅     | ✅     | ✅     | ✅      | All     |
| AGENT  | Assigned | Assigned | ✅   | ✅     | ❌     | ✅      | Assigned |
| CLIENT | Own    | Own     | ✅     | ❌     | ❌     | ❌      | Own     |
| DEBTOR | ❌     | ❌      | ❌     | ❌     | ❌     | ❌      | ❌      |

**Scoping Logic**:
- **ADMIN**: Full access to all cases across all tenants
- **AGENT**: Access limited to cases of assigned tenants (via UserTenantAssignments)
- **CLIENT**: Access limited to cases of their own tenant (User.TenantId)
- **DEBTOR**: No direct case access (uses Portal endpoints instead)

### Audit Logging Requirements

**Every case action MUST create audit log entry**:
- Case creation: `CREATED` action
- Status change: `STATUS_CHANGE` action with old/new status
- Details update: `UPDATED` action

**Audit Entry Includes**:
- Timestamp (CreatedAt)
- Action type (CREATED, STATUS_CHANGE, UPDATED)
- Details (descriptive text with context)
- Actor (name of user who performed action)

**Example Audit Log**:
```
2024-01-15 14:30:00 | STATUS_CHANGE | Status changed from REMINDER_1 to REMINDER_2. Note: Second reminder sent via email | Anna Schmidt
2024-01-10 11:20:00 | UPDATED | Case details updated | Anna Schmidt
2024-01-01 10:00:00 | CREATED | Case created with status NEW | Max Admin
```

## Services

### ICaseService
Service interface defining all case operations with Result<T> pattern.

**Methods**:
- `GetAllAsync(filters, currentUser)`: Get paginated cases with filtering
- `GetByIdAsync(id, currentUser)`: Get single case by ID
- `CreateAsync(request, currentUser)`: Create new case
- `UpdateAsync(id, request, currentUser)`: Update case details
- `DeleteAsync(id, currentUser)`: Delete case (ADMIN only)
- `AdvanceWorkflowAsync(id, request, currentUser)`: Advance workflow status
- `GetHistoryAsync(id, currentUser)`: Get audit log

### CaseService
Implementation of ICaseService with:
- Role-based data scoping (`ApplyRoleBasedFiltering`)
- Authorization checks (`HasAccessToCase`, `HasAccessToTenant`)
- Workflow validation via WorkflowEngine
- Automatic audit logging
- Debtor statistics updates
- Financial calculations

### IWorkflowEngine
Interface for ZPO workflow validation and calculations.

**Methods**:
- `CanTransition(from, to)`: Validate if status transition is allowed
- `CalculateNextActionDate(status)`: Calculate next action date for status
- `GetAllowedTransitions(status)`: Get list of valid next states

### WorkflowEngine
Implementation defining:
- Valid transitions dictionary (22 statuses, ~60 allowed transitions)
- NextActionDate calculation logic (7 to 60 days based on status)
- German legal deadlines (§ 339 ZPO objection period, etc.)

## Models (DTOs)

### CaseDto
Full case details with navigation properties (tenant name, debtor name, agent name).

**Properties**: Id, TenantId, DebtorId, AgentId, PrincipalAmount, Costs, Interest, TotalAmount, Currency, InvoiceNumber, InvoiceDate, DueDate, Status, NextActionDate, CompetentCourt, CourtFileNumber, AiAnalysis, CreatedAt, UpdatedAt, TenantName, DebtorName, AgentName

### CaseListDto
Lightweight case summary for list views.

**Properties**: Id, InvoiceNumber, DebtorName, Status, TotalAmount, NextActionDate, CreatedAt

### CreateCaseRequest
Request model for creating new case.

**Required**: TenantId, DebtorId, PrincipalAmount, InvoiceNumber, InvoiceDate, DueDate

**Optional**: AgentId, Costs, Interest, Currency, CompetentCourt, CourtFileNumber

### UpdateCaseRequest
Request model for updating case details.

**Editable**: AgentId, PrincipalAmount, Costs, Interest, Currency, CompetentCourt, CourtFileNumber, AiAnalysis

**NOT editable via this endpoint**: Status (use AdvanceWorkflow instead)

### AdvanceWorkflowRequest
Request model for advancing workflow status.

**Required**: NewStatus (CaseStatus enum)

**Optional**: Note (string, descriptive note about the action)

### CaseFilterRequest
Filter and pagination options for GetAll endpoint.

**Filters**: TenantId, DebtorId, AgentId, Status

**Pagination**: Page (default 1), PageSize (default 20)

### CaseHistoryDto
Audit log entry.

**Properties**: Id, Action, Details, Actor, CreatedAt

## 🤖 AI Instructions

When working with the Case domain, AI assistants MUST follow these rules:

### Critical Workflow Rules

1. **NEVER skip workflow validation**
   - ALWAYS call `WorkflowEngine.CanTransition(from, to)` before status change
   - NEVER directly set `case.Status` without validation
   - ❌ BAD: `case.Status = CaseStatus.MB_REQUESTED;`
   - ✅ GOOD: `if (_workflowEngine.CanTransition(case.Status, newStatus)) { ... }`

2. **ALWAYS log status changes**
   - Every workflow advance MUST create CaseHistory entry
   - Include old status, new status, actor name, and optional note
   - ✅ REQUIRED:
   ```csharp
   var historyEntry = new CaseHistory {
       CaseId = case.Id,
       Action = "STATUS_CHANGE",
       Details = $"Status changed from {oldStatus} to {newStatus}. Note: {note}",
       Actor = currentUser.Name
   };
   ```

3. **Workflow transitions MUST use AdvanceWorkflow endpoint**
   - NEVER update status via PUT /api/cases/{id}
   - ALWAYS use PUT /api/cases/{id}/advance for status changes
   - This ensures workflow validation and proper audit logging

4. **Cannot manually set status field**
   - UpdateCaseRequest does NOT include Status field
   - Status can ONLY be changed via AdvanceWorkflowAsync method
   - This architectural decision enforces workflow integrity

### Financial Integrity

5. **ALWAYS auto-calculate TotalAmount**
   - TotalAmount = PrincipalAmount + Costs + Interest
   - Update debtor statistics when amounts change

6. **Update debtor counters correctly**
   - Create: Increment TotalDebt and OpenCases
   - Update amounts: Adjust TotalDebt by difference
   - Close (paid/settled): Decrement both TotalDebt and OpenCases
   - Close (other): Decrement OpenCases only

### Authorization & Scoping

7. **Respect role-based access control**
   - ADMIN: Full access
   - AGENT: Assigned tenants only
   - CLIENT: Own tenant only
   - DEBTOR: No access (Portal endpoints only)

8. **ALWAYS check authorization**
   - Call `HasAccessToCase(case, user)` before operations
   - Return 403 Forbidden if access denied
   - Return 404 Not Found (not 403) to avoid information leakage

### Code Quality

9. **Keep endpoint files under 150 lines**
   - Delegate business logic to CaseService
   - Endpoint should only handle HTTP concerns
   - Use comprehensive XML documentation

10. **Use Result<T> pattern consistently**
    - NEVER throw exceptions for business logic failures
    - Return Result.Failure with descriptive error message
    - Let controller handle HTTP status code mapping

### Testing Considerations

11. **Test workflow transitions extensively**
    - Test all valid transitions (60+ combinations)
    - Test all invalid transitions return proper errors
    - Test that final states cannot transition further

12. **Test multi-tenancy scoping**
    - Verify AGENT cannot access other tenants' cases
    - Verify CLIENT cannot access other clients' cases
    - Verify authorization returns 403, not 404

---

**Domain Complexity**: ⭐⭐⭐⭐⭐ (Highest)

**Lines of Code**: ~1,200 (endpoints ~700, services ~500)

**Key Dependencies**: Monetaris.Shared (entities, enums), EntityFrameworkCore

**Legal Compliance**: ZPO (Zivilprozessordnung) - German Civil Procedure Code
