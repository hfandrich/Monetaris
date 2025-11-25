# Debtor Domain (Schuldner)

## 🎯 Overview
Manages debtors (Schuldner) - individuals or companies who owe money in collection cases.

This domain uses **Vertical Slice Architecture** with **AI-First + Vibe-First** principles:
- Each endpoint is a separate file (<150 lines)
- Template files show AI how to create new endpoints safely
- Services contain business logic (max 300 lines)
- Models (DTOs) define data contracts

## 📡 API Endpoints

### GET /api/debtors
**File**: `api/GetAllDebtors.cs`
**Purpose**: List all debtors with filtering and pagination (scoped by user role)
**Authorization**: All authenticated users (scoped by role)
**Request**: `DebtorFilterRequest` (query parameters)
**Response**: `PaginatedResult<DebtorDto>`

**Scoping Rules**:
- **ADMIN**: Can access ALL debtors
- **AGENT**: Can access only debtors from assigned tenants (via UserTenantAssignments)
- **CLIENT**: Can access only debtors from their own tenant
- **DEBTOR**: No access to this domain

**Filter Parameters**:
- `TenantId` (Guid?) - Filter by tenant/kreditor
- `AgentId` (Guid?) - Filter by assigned agent
- `RiskScore` (RiskScore?) - Filter by risk score (A/B/C/D/E)
- `SearchQuery` (string?) - Full-text search across name, email, company
- `Page` (int) - Page number (default: 1)
- `PageSize` (int) - Items per page (default: 20)

### GET /api/debtors/{id}
**File**: `api/GetDebtorById.cs`
**Purpose**: Get single debtor by ID with full details
**Authorization**: ADMIN (all), AGENT (assigned tenants only), CLIENT (own tenant only)
**Response**: `DebtorDto`

### GET /api/debtors/search?q={query}
**File**: `api/SearchDebtors.cs`
**Purpose**: Full-text search across debtor fields (lightweight response)
**Authorization**: All authenticated users (scoped by role)
**Response**: `List<DebtorSearchDto>` (max 10 results)

**Search Fields**:
- FirstName, LastName (for persons)
- CompanyName (for companies)
- Email
- City

### POST /api/debtors
**File**: `api/CreateDebtor.cs`
**Purpose**: Create new debtor
**Authorization**: ADMIN, AGENT (tenant assignment checked)
**Request**: `CreateDebtorRequest`
**Response**: `DebtorDto` (201 Created)

### PUT /api/debtors/{id}
**File**: `api/UpdateDebtor.cs`
**Purpose**: Update existing debtor
**Authorization**: ADMIN, AGENT (tenant assignment checked)
**Request**: `UpdateDebtorRequest`
**Response**: `DebtorDto`

### DELETE /api/debtors/{id}
**File**: `api/DeleteDebtor.cs`
**Purpose**: Delete debtor (hard delete, but checks for dependencies)
**Authorization**: ADMIN only
**Response**: 204 No Content

## 🔒 Business Rules

1. **Debtor Types**:
   - **PERSON** (Natürliche Person): Requires FirstName, LastName, optional DateOfBirth
   - **COMPANY** (Juristische Person): Requires CompanyName, optional RegistrationNumber

2. **Multi-Tenancy Scoping**:
   - ADMIN: Can access ALL debtors
   - AGENT: Can access only debtors from assigned tenants (via UserTenantAssignments)
   - CLIENT: Can access only debtors from their OWN tenant
   - DEBTOR: No access to this domain

3. **Address Status Lifecycle**:
   - `UNKNOWN` → Initial state, address not verified
   - `CONFIRMED` → Address verified and current
   - `MOVED` → Debtor moved, new address research needed
   - `DECEASED` → Debtor deceased, special handling required

4. **Risk Scoring** (RiskScore enum):
   - `A` - Very high risk / high recovery chance
   - `B` - High risk / medium recovery chance
   - `C` - Medium risk / average recovery chance
   - `D` - Low risk / difficult recovery
   - `E` - Very low risk / unlikely to recover

5. **Validation Rules**:
   - Email must be valid format (if provided)
   - Phone must be valid format (if provided)
   - **PERSON**: Either FirstName+LastName OR CompanyName required
   - **COMPANY**: CompanyName is required
   - TenantId must exist and user must have access

6. **Deletion Rules**:
   - Cannot delete debtor with existing cases (check `Cases.Count > 0`)
   - Performs hard delete (removes from DB)
   - Only ADMIN can delete debtors

7. **Address Management**:
   - When AddressStatus changes from UNKNOWN to CONFIRMED/MOVED, `AddressLastChecked` is set to current UTC time
   - Address research workflow triggered when status = MOVED

8. **Duplicate Detection** (recommended):
   - Same email across multiple debtors (warning)
   - Same phone number (warning)
   - Same name + date of birth for PERSON (error)
   - Same RegistrationNumber for COMPANY (error)

## 🧩 Services

### IDebtorService
Located in: `services/IDebtorService.cs`

Methods:
- `Task<Result<PaginatedResult<DebtorDto>>> GetAllAsync(DebtorFilterRequest filters, User currentUser)`
- `Task<Result<DebtorDto>> GetByIdAsync(Guid id, User currentUser)`
- `Task<Result<List<DebtorSearchDto>>> SearchAsync(string query, User currentUser)`
- `Task<Result<DebtorDto>> CreateAsync(CreateDebtorRequest request, User currentUser)`
- `Task<Result<DebtorDto>> UpdateAsync(Guid id, UpdateDebtorRequest request, User currentUser)`
- `Task<Result> DeleteAsync(Guid id, User currentUser)`

### DebtorService
Located in: `services/DebtorService.cs`

Dependencies:
- `IApplicationDbContext` - Database access
- `ILogger<DebtorService>` - Logging

Key Methods:
- `ApplyRoleBasedFiltering()` - Filters debtors based on user role and tenant assignments
- `HasAccessToDebtor()` - Validates user has access to specific debtor
- `HasAccessToTenant()` - Validates user has access to tenant (for creation)
- `MapToDto()` - Maps entity to DTO with statistics

## 📦 Models (DTOs)

### DebtorDto
Response model for debtor data (includes statistics).

**Properties**:
- `Id` (Guid)
- `TenantId` (Guid) - Related kreditor
- `AgentId` (Guid?) - Assigned agent
- **Identity (Person)**:
  - `IsCompany` (bool)
  - `FirstName` (string?)
  - `LastName` (string?)
  - `DateOfBirth` (DateTime?) - Not implemented yet
- **Identity (Company)**:
  - `CompanyName` (string?)
  - `RegistrationNumber` (string?) - Not implemented yet
- **Contact**:
  - `Email` (string?)
  - `Phone` (string?)
- **Address**:
  - `Street` (string?)
  - `ZipCode` (string?)
  - `City` (string?)
  - `Country` (string, default: "Deutschland")
  - `AddressStatus` (AddressStatus: UNKNOWN/CONFIRMED/MOVED/DECEASED)
  - `AddressLastChecked` (DateTime?)
- **Risk & Statistics**:
  - `RiskScore` (RiskScore: A/B/C/D/E)
  - `TotalDebt` (decimal) - Sum of all open case amounts
  - `OpenCases` (int) - Count of active cases
  - `Notes` (string?)
- **Timestamps**:
  - `CreatedAt` (DateTime)
  - `UpdatedAt` (DateTime)
- **Navigation**:
  - `TenantName` (string) - Kreditor name
  - `AgentName` (string?) - Assigned agent name
- **Computed**:
  - `DisplayName` (string) - "CompanyName" or "FirstName LastName"

### CreateDebtorRequest
Request model for creating a new debtor.

**Properties**:
- `TenantId` (Guid, required)
- `AgentId` (Guid?)
- `IsCompany` (bool, required)
- `CompanyName` (string?) - Required if IsCompany = true
- `FirstName` (string?) - Required if IsCompany = false
- `LastName` (string?) - Required if IsCompany = false
- `Email` (string?)
- `Phone` (string?)
- `Street` (string?)
- `ZipCode` (string?)
- `City` (string?)
- `Country` (string, default: "Deutschland")
- `AddressStatus` (AddressStatus, default: UNKNOWN)
- `RiskScore` (RiskScore, default: C)
- `Notes` (string?)

### UpdateDebtorRequest
Request model for updating an existing debtor.

**Properties** (same as CreateDebtorRequest except):
- No `TenantId` (cannot change tenant after creation)
- All other fields same as CreateDebtorRequest

### DebtorFilterRequest
Query parameters for filtering debtors.

**Properties**:
- `TenantId` (Guid?)
- `AgentId` (Guid?)
- `RiskScore` (RiskScore?)
- `SearchQuery` (string?)
- `Page` (int, default: 1)
- `PageSize` (int, default: 20, max: 100)

### DebtorSearchDto
Lightweight DTO for search results (faster queries).

**Properties**:
- `Id` (Guid)
- `IsCompany` (bool)
- `CompanyName` (string?)
- `FirstName` (string?)
- `LastName` (string?)
- `Email` (string?)
- `City` (string?)
- `TotalDebt` (decimal)
- `OpenCases` (int)
- `DisplayName` (string) - Computed

## 🤖 AI Instructions

### When creating a NEW endpoint:

1. **Copy the appropriate template**:
   - GET → Copy `api/_TEMPLATE_Get.cs.template`
   - POST → Copy `api/_TEMPLATE_Post.cs.template`
   - PUT → Copy `api/_TEMPLATE_Put.cs.template`
   - DELETE → Copy `api/_TEMPLATE_Delete.cs.template`

2. **Modify only these sections**:
   - Class name (match the endpoint purpose)
   - Route attribute (if needed)
   - Method parameters (e.g., add `Guid id` for single resource)
   - Service method call (call the appropriate service method)
   - Log messages (describe what's happening)

3. **NEVER change**:
   - Constructor injection pattern
   - `Result<T>` return pattern
   - Error handling structure
   - HTTP status codes (200/201/204/400/404)

4. **Always include**:
   - XML documentation (/// summary)
   - `ProducesResponseType` attributes for all possible responses
   - `ILogger` usage for information and warnings
   - Proper error messages with context
   - `GetCurrentUserAsync()` helper method

### When creating a TEST:

1. Copy `tests/_TEMPLATE_Test.cs`
2. Test matrix (test ALL scenarios):
   - Success case (200/201/204)
   - Validation errors (400)
   - Not found (404)
   - Authorization (401/403)
   - Business rule violations (e.g., cannot delete with cases)
   - Role-based scoping (ADMIN, AGENT, CLIENT)

### Code Quality Rules:

- **Max 150 lines per endpoint file** (strict limit)
- **Max 300 lines per service class** (strict limit)
- Every class must have a test
- 90%+ code coverage required
- 0 bugs, A rating in SonarQube

### Logging Pattern:

```csharp
// At start of endpoint
_logger.LogInformation("EndpointName called: {Param}", param);

// On success
_logger.LogInformation("Operation succeeded: {Result}", result);

// On error
_logger.LogWarning("Operation failed: {Error}", error);

// On exception (in service)
_logger.LogError(ex, "Exception in operation: {Context}", context);
```

### Result<T> Pattern:

All services MUST return `Result<T>`:

```csharp
// In service
return Result<DebtorDto>.Success(data);
return Result<DebtorDto>.Failure("Error message");

// In endpoint
if (!result.IsSuccess)
    return BadRequest(new { error = result.ErrorMessage });
return Ok(result.Data);
```

### Authorization Pattern:

```csharp
// Get current user
var currentUser = await GetCurrentUserAsync();
if (currentUser == null)
{
    return Unauthorized();
}

// Pass to service (service handles role-based logic)
var result = await _service.GetAllAsync(filters, currentUser);

// Helper method (copy to every endpoint)
private async Task<User?> GetCurrentUserAsync()
{
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
    {
        return null;
    }
    return await _context.Users.FindAsync(userId);
}
```

### Endpoint Naming Convention:

- **Class name** = `VerbNounDomain` (e.g., `GetAllDebtors`, `CreateDebtor`)
- **Method name** = `Handle` (always)
- **Route** = `/api/debtors` (kebab-case, plural)

### Pagination Pattern:

For list endpoints returning multiple results:

```csharp
// Request model
public class DebtorFilterRequest
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

// Response model
public class PaginatedResult<T>
{
    public List<T> Items { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}

// In service
var totalCount = await query.CountAsync();
var items = await query
    .Skip((filters.Page - 1) * filters.PageSize)
    .Take(filters.PageSize)
    .ToListAsync();

return Result<PaginatedResult<DebtorDto>>.Success(new PaginatedResult<DebtorDto>
{
    Items = items,
    Page = filters.Page,
    PageSize = filters.PageSize,
    TotalCount = totalCount
});
```

### Search Implementation Pattern:

For search endpoints (lightweight, fast queries):

```csharp
// Limit results to 10
var debtors = await query
    .Where(d =>
        (d.FirstName != null && d.FirstName.ToLower().Contains(searchLower)) ||
        (d.LastName != null && d.LastName.ToLower().Contains(searchLower)) ||
        (d.CompanyName != null && d.CompanyName.ToLower().Contains(searchLower)) ||
        (d.Email != null && d.Email.ToLower().Contains(searchLower)))
    .Take(10)
    .ToListAsync();

// Return lightweight DTO (not full DebtorDto)
return Result<List<DebtorSearchDto>>.Success(searchDtos);
```

### Example - Creating a new GET endpoint:

```csharp
// 1. Copy api/_TEMPLATE_Get.cs.template to api/GetDebtorStatistics.cs
// 2. Rename class: _TEMPLATE_Get → GetDebtorStatistics
// 3. Update route: [HttpGet("statistics")]
// 4. Update service call: _service.GetStatisticsAsync(currentUser)
// 5. Update logging: "GetDebtorStatistics called"
```

## 🧪 Testing

Run tests for this domain:
```bash
cd Backend
dotnet test --filter "FullyQualifiedName~Monetaris.Debtor.Tests"
```

Generate coverage report:
```bash
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover
```

## 📝 Architecture Notes

### Vertical Slice Architecture

This domain uses **Vertical Slice Architecture** instead of traditional layered architecture:

**Traditional Layered** (OLD):
```
Controllers/ (all controllers together)
Services/ (all services together)
DTOs/ (all DTOs together)
```

**Vertical Slice** (NEW):
```
api/ (one file per endpoint - vertical slice)
services/ (business logic)
models/ (data contracts)
tests/ (one test per endpoint)
```

**Benefits**:
- Each endpoint is isolated and easy to understand
- Changes to one endpoint don't affect others
- AI can easily generate new endpoints from templates
- Easier to test individual features
- Better for code review (small, focused files)

### AI-First Principles

This domain is designed for **90% AI automation**:

1. **Templates** (`_TEMPLATE_*.cs.template`): Show AI exactly how to create endpoints
2. **README.md**: Comprehensive instructions for AI to follow
3. **Strict file size limits**: Force simple, focused code
4. **Consistent patterns**: Same structure in every file
5. **Heavy documentation**: 🤖 comments guide AI behavior

**Human Role**: Only reviews Merge Requests for correctness and business logic.

## 🔄 Migration Notes

This domain was migrated from traditional layered architecture to vertical slice architecture:
- Old: `Controllers/DebtorController.cs` (250+ lines, all endpoints in one file)
- New: `api/GetAllDebtors.cs`, `api/GetDebtorById.cs`, etc. (6 separate files, <100 lines each)

## 🚀 Next Steps

To use this domain as a template for other domains:

1. Copy the entire `Monetaris.Debtor` folder
2. Rename to `Monetaris.{DomainName}`
3. Update all namespaces
4. Update models to match domain entities
5. Update service logic for domain-specific rules
6. Update README.md with domain-specific documentation

**Example domains to migrate**:
- Case → Monetaris.Case
- Document → Monetaris.Document
- Communication → Monetaris.Communication
- Payment → Monetaris.Payment
