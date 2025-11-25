# Kreditor Domain (Creditors/Mandanten)

## 🎯 Overview
Manages creditor organizations (Gläubiger/Mandanten) who submit collection cases to Monetaris.

This domain uses **Vertical Slice Architecture** with **AI-First + Vibe-First** principles:
- Each endpoint is a separate file (<150 lines)
- Template files show AI how to create new endpoints safely
- Services contain business logic (max 300 lines)
- Models (DTOs) define data contracts

## 📡 API Endpoints

### GET /api/kreditoren
**File**: `api/GetAllKreditoren.cs`
**Purpose**: List all kreditoren (scoped by user role)
**Authorization**: All authenticated users (scoped by role)
**Response**: `List<KreditorDto>`

**Scoping Rules**:
- **ADMIN**: Can access ALL kreditoren
- **AGENT**: Can access only assigned kreditoren (via UserTenantAssignments)
- **CLIENT**: Can access only their OWN kreditor
- **DEBTOR**: No access to this domain

### GET /api/kreditoren/{id}
**File**: `api/GetKreditorById.cs`
**Purpose**: Get single kreditor by ID
**Authorization**: ADMIN (all), AGENT (assigned only), CLIENT (own only)
**Response**: `KreditorDto`

### POST /api/kreditoren
**File**: `api/CreateKreditor.cs`
**Purpose**: Create new kreditor organization
**Authorization**: ADMIN only
**Request**: `CreateKreditorRequest`
**Response**: `KreditorDto` (201 Created)

### PUT /api/kreditoren/{id}
**File**: `api/UpdateKreditor.cs`
**Purpose**: Update existing kreditor
**Authorization**: ADMIN only
**Request**: `UpdateKreditorRequest`
**Response**: `KreditorDto`

### DELETE /api/kreditoren/{id}
**File**: `api/DeleteKreditor.cs`
**Purpose**: Delete kreditor (hard delete, but checks for dependencies)
**Authorization**: ADMIN only
**Response**: 204 No Content

## 🔒 Business Rules

1. **Multi-Tenancy Scoping**:
   - ADMIN: Can access ALL kreditoren
   - AGENT: Can access only assigned kreditoren (via UserTenantAssignments)
   - CLIENT: Can access only their OWN kreditor
   - DEBTOR: No access to this domain

2. **Validation**:
   - RegistrationNumber must be unique
   - Name is required (max 200 chars)
   - Email must be valid format
   - BankAccountIBAN is required

3. **Deletion Rules**:
   - Cannot delete kreditor with existing debtors
   - Cannot delete kreditor with existing cases
   - Performs hard delete (removes from DB)

## 🧩 Services

### IKreditorService
Located in: `services/IKreditorService.cs`

Methods:
- `Task<Result<List<KreditorDto>>> GetAllAsync(User currentUser)`
- `Task<Result<KreditorDto>> GetByIdAsync(Guid id, User currentUser)`
- `Task<Result<KreditorDto>> CreateAsync(CreateKreditorRequest request, User currentUser)`
- `Task<Result<KreditorDto>> UpdateAsync(Guid id, UpdateKreditorRequest request, User currentUser)`
- `Task<Result> DeleteAsync(Guid id, User currentUser)`

### KreditorService
Located in: `services/KreditorService.cs`

Dependencies:
- `IApplicationDbContext` - Database access
- `ILogger<KreditorService>` - Logging

## 📦 Models (DTOs)

### KreditorDto
Response model for kreditor data (includes statistics).

**Properties**:
- `Id` (Guid)
- `Name` (string)
- `RegistrationNumber` (string)
- `ContactEmail` (string)
- `BankAccountIBAN` (string)
- `CreatedAt` (DateTime)
- `UpdatedAt` (DateTime)
- `TotalDebtors` (int) - Statistics
- `TotalCases` (int) - Statistics
- `TotalVolume` (decimal) - Statistics

### CreateKreditorRequest
- `Name` (required, max 200)
- `RegistrationNumber` (required, unique)
- `ContactEmail` (required, valid format)
- `BankAccountIBAN` (required)

### UpdateKreditorRequest
- `Name` (required)
- `RegistrationNumber` (required)
- `ContactEmail` (required)
- `BankAccountIBAN` (required)

## 🤖 AI Instructions

### When creating a NEW endpoint:

1. **Copy the appropriate template**:
   - GET → Copy `api/_TEMPLATE_Get.cs`
   - POST → Copy `api/_TEMPLATE_Post.cs`
   - PUT → Copy `api/_TEMPLATE_Put.cs`
   - DELETE → Copy `api/_TEMPLATE_Delete.cs`

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

### When creating a TEST:

1. Copy `tests/_TEMPLATE_Test.cs`
2. Test matrix (test ALL scenarios):
   - Success case (200/201/204)
   - Validation errors (400)
   - Not found (404)
   - Authorization (401/403)
   - Business rule violations

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
return Result<KreditorDto>.Success(data);
return Result<KreditorDto>.Failure("Error message");

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
var result = await _service.GetAllAsync(currentUser);
```

### Endpoint Naming Convention:

- **Class name** = `VerbNounDomain` (e.g., `GetAllKreditoren`, `CreateKreditor`)
- **Method name** = `Handle` (always)
- **Route** = `/api/kreditoren` (kebab-case, plural)

### Example - Creating a new GET endpoint:

```csharp
// 1. Copy api/_TEMPLATE_Get.cs to api/GetKreditorStatistics.cs
// 2. Rename class: _TEMPLATE_Get → GetKreditorStatistics
// 3. Update route: [HttpGet("statistics")]
// 4. Update service call: _service.GetStatisticsAsync(currentUser)
// 5. Update logging: "GetKreditorStatistics called"
```

## 🧪 Testing

Run tests for this domain:
```bash
cd Backend
dotnet test --filter "FullyQualifiedName~Monetaris.Kreditor.Tests"
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

1. **Templates** (`_TEMPLATE_*.cs`): Show AI exactly how to create endpoints
2. **README.md**: Comprehensive instructions for AI to follow
3. **Strict file size limits**: Force simple, focused code
4. **Consistent patterns**: Same structure in every file
5. **Heavy documentation**: 🤖 comments guide AI behavior

**Human Role**: Only reviews Merge Requests for correctness and business logic.

## 🔄 Migration Notes

This domain was renamed from "Tenant" to "Kreditor" for clarity:
- Project: `Monetaris.Tenant` → `Monetaris.Kreditor`
- Namespace: `Monetaris.Tenant` → `Monetaris.Kreditor`
- DTOs: `TenantDto` → `KreditorDto`
- Service: `ITenantService` → `IKreditorService`
- Database: Table remains `tenants` (for backwards compatibility)

## 🚀 Next Steps

To use this domain as a template for other domains:

1. Copy the entire `Monetaris.Kreditor` folder
2. Rename to `Monetaris.{DomainName}`
3. Update all namespaces
4. Update models to match domain entities
5. Update service logic for domain-specific rules
6. Update README.md with domain-specific documentation

**Example domains to migrate**:
- User → Monetaris.User
- Debtor → Monetaris.Debtor
- Case → Monetaris.Case
- Document → Monetaris.Document
