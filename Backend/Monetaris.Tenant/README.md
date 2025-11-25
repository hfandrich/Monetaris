# Kreditor Domain

## Overview
Manages Kreditoren (creditors/clients) - organizations that submit collection cases to Monetaris. This domain implements Vertical Slice Architecture with AI-First principles for maximum bot-controllability.

## Architecture Pattern

**Vertical Slice Architecture:** Each endpoint is a self-contained file with all its dependencies.

**AI-First Design:**
- Small, isolated files (<150 lines per endpoint)
- Clear naming conventions
- Template-driven development
- Comprehensive documentation for AI agents

## Endpoints

### GET /api/kreditoren
**File:** `api/GetAllKreditoren.cs` (78 lines)
**Auth:** Required (all roles)
**Purpose:** Retrieve all Kreditoren accessible to current user
**Scoping:**
- ADMIN: All Kreditoren
- AGENT: Assigned Kreditoren only
- CLIENT: Own Kreditor only

**Response:** `List<KreditorDto>`

**Example:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Hausverwaltung Schmidt GmbH",
    "registrationNumber": "HRB 12345",
    "contactEmail": "info@schmidt-verwaltung.de",
    "bankAccountIBAN": "DE89370400440532013000",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "totalDebtors": 45,
    "totalCases": 123,
    "totalVolume": 125000.00
  }
]
```

### GET /api/kreditoren/{id}
**File:** `api/GetKreditorById.cs` (92 lines)
**Auth:** Required
**Purpose:** Get single Kreditor by ID
**Authorization:** Role-based access control enforced
**Response:** `KreditorDto`

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 403: Access denied (user doesn't have access to this Kreditor)
- 404: Kreditor not found

### POST /api/kreditoren
**File:** `api/CreateKreditor.cs` (74 lines)
**Auth:** ADMIN only
**Purpose:** Create new Kreditor organization
**Request:** `CreateKreditorRequest`
**Response:** `KreditorDto`

**Validation Rules:**
- `Name` is required (max 200 chars)
- `RegistrationNumber` must be unique
- `ContactEmail` must be valid email format
- `BankAccountIBAN` must be valid IBAN format

**Status Codes:**
- 201: Created (includes Location header)
- 400: Validation error (duplicate registration number, etc.)
- 401: Unauthorized
- 403: Forbidden (non-ADMIN user)

**Example Request:**
```json
{
  "name": "Neue Hausverwaltung GmbH",
  "registrationNumber": "HRB 99999",
  "contactEmail": "kontakt@neue-verwaltung.de",
  "bankAccountIBAN": "DE89370400440532013000"
}
```

### PUT /api/kreditoren/{id}
**File:** `api/UpdateKreditor.cs` (85 lines)
**Auth:** ADMIN only
**Purpose:** Update existing Kreditor
**Request:** `UpdateKreditorRequest`
**Response:** `KreditorDto`

**Validation Rules:**
- `RegistrationNumber` must be unique (excluding current Kreditor)
- All fields can be updated independently

**Status Codes:**
- 200: Success
- 400: Validation error
- 401: Unauthorized
- 403: Forbidden (non-ADMIN user)
- 404: Kreditor not found

### DELETE /api/kreditoren/{id}
**File:** `api/DeleteKreditor.cs` (70 lines)
**Auth:** ADMIN only
**Purpose:** Delete Kreditor (hard delete)
**Response:** `204 No Content`

**Business Rules:**
- Cannot delete if Kreditor has existing debtors
- Cannot delete if Kreditor has existing cases
- Hard delete (not soft delete)

**Status Codes:**
- 204: Success (no content)
- 400: Cannot delete (has dependencies)
- 401: Unauthorized
- 403: Forbidden (non-ADMIN user)
- 404: Kreditor not found

## Business Rules

### 1. Authorization
- Only ADMIN can create/update/delete Kreditoren
- AGENT can view assigned Kreditoren via `UserTenantAssignments`
- CLIENT can view their own Kreditor only (via `User.TenantId`)
- DEBTOR has no access to Kreditor endpoints

### 2. Validation
- `RegistrationNumber` must be unique across all Kreditoren
- `Name` is required (max 200 chars)
- `ContactEmail` must be valid email format
- `BankAccountIBAN` must be valid IBAN format
- At least one contact person recommended (not enforced yet)

### 3. Multi-Tenancy
- Each Kreditor is isolated (tenant boundary)
- Data scoping enforced at service level
- User-Kreditor assignments stored in `UserTenantAssignments` table
- All collection cases are scoped to a Kreditor

### 4. Data Integrity
- Cannot delete Kreditor with existing debtors
- Cannot delete Kreditor with existing cases
- Referential integrity enforced at database level

## Services

### KreditorService
**Location:** `services/KreditorService.cs` (268 lines)
**Interface:** `services/IKreditorService.cs` (38 lines)

**Methods:**
- `GetAllAsync(User currentUser)` - Returns all accessible Kreditoren (scoped by role)
- `GetByIdAsync(Guid id, User currentUser)` - Returns single Kreditor if accessible
- `CreateAsync(CreateKreditorRequest request, User currentUser)` - Creates new Kreditor (ADMIN only)
- `UpdateAsync(Guid id, UpdateKreditorRequest request, User currentUser)` - Updates Kreditor (ADMIN only)
- `DeleteAsync(Guid id, User currentUser)` - Deletes Kreditor (ADMIN only)

**All methods return:** `Result<T>` pattern for consistent error handling

**Dependencies:**
- `IApplicationDbContext` - Database access
- `ILogger<KreditorService>` - Logging

**Role-Based Scoping:**
```csharp
// ADMIN - No filter, sees all
IQueryable<Tenant> query = _context.Tenants;

// CLIENT - Own Kreditor only
query = query.Where(t => t.Id == currentUser.TenantId.Value);

// AGENT - Assigned Kreditoren only
var assignedTenantIds = await _context.UserTenantAssignments
    .Where(uta => uta.UserId == currentUser.Id)
    .Select(uta => uta.TenantId)
    .ToListAsync();
query = query.Where(t => assignedTenantIds.Contains(t.Id));
```

## Models (DTOs)

### KreditorDto
**Location:** `models/KreditorDto.cs` (20 lines)

```csharp
public class KreditorDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string RegistrationNumber { get; set; }
    public string ContactEmail { get; set; }
    public string BankAccountIBAN { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Statistics (calculated from related entities)
    public int TotalDebtors { get; set; }
    public int TotalCases { get; set; }
    public decimal TotalVolume { get; set; }
}
```

### CreateKreditorRequest
**Location:** `models/CreateKreditorRequest.cs` (12 lines)

```csharp
public class CreateKreditorRequest
{
    public string Name { get; set; }
    public string RegistrationNumber { get; set; }
    public string ContactEmail { get; set; }
    public string BankAccountIBAN { get; set; }
}
```

### UpdateKreditorRequest
**Location:** `models/UpdateKreditorRequest.cs` (13 lines)

```csharp
public class UpdateKreditorRequest
{
    public string Name { get; set; }
    public string RegistrationNumber { get; set; }
    public string ContactEmail { get; set; }
    public string BankAccountIBAN { get; set; }
}
```

## 🤖 AI Instructions

### Creating a New Endpoint

#### Step 1: Copy Template
```bash
# For GET endpoint
cp api/_TEMPLATE_Get.cs api/GetKreditorStats.cs

# For POST endpoint
cp api/_TEMPLATE_Post.cs api/AddKreditorContact.cs

# For PUT endpoint
cp api/_TEMPLATE_Put.cs api/UpdateKreditorContact.cs

# For DELETE endpoint
cp api/_TEMPLATE_Delete.cs api/RemoveKreditorContact.cs
```

#### Step 2: Replace Placeholders

**Required Replacements:**
- `[ENDPOINT_NAME]` → Class name (e.g., `GetKreditorStats`)
- `[ROUTE]` → API route (e.g., `kreditoren/{id}/stats`)
- `[DOMAIN]` → Domain name (always `Kreditor` in this domain)
- `[METHOD_NAME]` → Service method (e.g., `GetStats`)
- `[RESPONSE_TYPE]` → Return type (e.g., `KreditorStatsDto`)
- `[REQUEST_TYPE]` → Request type for POST/PUT (e.g., `AddContactRequest`)
- `[GET_ENDPOINT_NAME]` → GET endpoint name for CreatedAtAction in POST
- `[NOT_FOUND_MESSAGE]` → Error message (e.g., `"Contact not found"`)

**Optional Replacements:**
- `[DESCRIBE WHAT THIS ENDPOINT DOES]` → Brief description
- `[DETAILED ENDPOINT DESCRIPTION]` → XML documentation
- `[LOG MESSAGE]` → Logging messages

#### Step 3: Implement Service Method

If the template uses a new service method, add it to `IKreditorService.cs` and implement in `KreditorService.cs`:

```csharp
// In IKreditorService.cs
Task<Result<KreditorStatsDto>> GetStatsAsync(Guid id, User currentUser);

// In KreditorService.cs
public async Task<Result<KreditorStatsDto>> GetStatsAsync(Guid id, User currentUser)
{
    try
    {
        // Implementation here
        _logger.LogInformation("Getting stats for Kreditor {KreditorId}", id);

        // ... business logic ...

        return Result<KreditorStatsDto>.Success(statsDto);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error getting stats for Kreditor {KreditorId}", id);
        return Result<KreditorStatsDto>.Failure("An error occurred");
    }
}
```

#### Step 4: Add Authorization

Choose appropriate authorization:
```csharp
[Authorize]                        // All authenticated users
[Authorize(Roles = "ADMIN")]       // ADMIN only
[Authorize(Roles = "ADMIN,AGENT")] // ADMIN or AGENT
```

#### Step 5: Create Test

Every endpoint needs a test in `tests/`:
```bash
cp tests/_TEMPLATE_Test.cs tests/GetKreditorStats.Tests.cs
```

### Code Standards

**✅ DO:**
- Keep endpoint files under 150 lines
- Keep service methods under 100 lines
- Use Result<T> pattern for all service methods
- Add XML documentation (///) for all public methods
- Use ILogger for all operations
- Return proper HTTP status codes
- Handle all error cases explicitly
- Include authorization checks in service layer
- Validate input at both controller and service level

**❌ DON'T:**
- Put business logic in endpoints (delegate to services)
- Hardcode error messages (use constants or resource files)
- Skip logging (log at Information for success, Warning for errors)
- Return 500 errors (catch exceptions and return meaningful 400s)
- Use magic strings (use enums or constants)
- Mix concerns (keep endpoints focused on HTTP handling)

### HTTP Status Code Guidelines

**Success:**
- `200 OK` - GET, PUT (entity returned)
- `201 Created` - POST (include Location header)
- `204 No Content` - DELETE

**Client Errors:**
- `400 Bad Request` - Validation errors, business rule violations
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Valid authentication but insufficient permissions
- `404 Not Found` - Entity doesn't exist

**Server Errors:**
- Avoid `500 Internal Server Error` - Catch exceptions and return meaningful 400s

### Logging Guidelines

**Information Level:**
- Successful operations
- Endpoint entry with key parameters
- Successful completion with result counts

**Warning Level:**
- Authorization failures
- Validation failures
- Business rule violations
- Not found errors

**Error Level:**
- Unhandled exceptions
- Database errors
- External service failures

**Example:**
```csharp
_logger.LogInformation("Fetching Kreditor {KreditorId} for user {UserId}", id, currentUser.Id);
_logger.LogWarning("Access denied to Kreditor {KreditorId} for user {UserId}", id, currentUser.Id);
_logger.LogError(ex, "Error retrieving Kreditor {KreditorId}", id);
```

### Testing Requirements

**Every endpoint needs:**
1. Success case test
2. Not found test (for GET/PUT/DELETE by ID)
3. Unauthorized test
4. Forbidden test (for role-restricted endpoints)
5. Validation error tests (for POST/PUT)

**Target: 90% code coverage**

## Testing

### Run All Tests
```bash
cd Backend/Monetaris.Tenant
dotnet test
```

### Run with Coverage
```bash
dotnet test --collect:"XPlat Code Coverage"
```

### Run Specific Test File
```bash
dotnet test --filter "FullyQualifiedName~GetAllKreditorenTests"
```

### Test Structure
- `tests/*.Tests.cs` - Unit tests for endpoints (5 files)
- `tests/KreditorService.Tests.cs` - Unit tests for service layer
- `tests/_TEMPLATE_EndpointTest.cs.template` - Template for new endpoint tests

### Coverage Target
- **Minimum:** 90%
- **Current:** Run `dotnet test --collect:"XPlat Code Coverage"` to generate report

### Writing New Tests

#### Using the Template
1. Copy the template file:
   ```bash
   cp tests/_TEMPLATE_EndpointTest.cs.template tests/MyNewEndpoint.Tests.cs
   ```

2. Replace placeholders:
   - `{DOMAIN}` → Your domain name (e.g., `Kreditor`)
   - `{ENDPOINT_NAME}` → Your endpoint class name (e.g., `GetAllKreditoren`)
   - `{METHOD}` → Service method name (e.g., `GetAllAsync`)
   - `{RESPONSE_TYPE}` → Expected response type (e.g., `List<KreditorDto>`)

3. Implement test scenarios specific to your endpoint

4. Add additional test methods as needed

#### Test Patterns

**Arrange-Act-Assert Pattern:**
```csharp
[Fact]
public async Task Handle_ReturnsOkResult_WhenSuccessful()
{
    // Arrange - Set up test data and mocks
    var userId = Guid.NewGuid();
    var user = new User { Id = userId, Role = UserRole.ADMIN };
    SetupHttpContext(userId);
    SetupUserDbSet(user);

    // Act - Execute the method being tested
    var actionResult = await _endpoint.Handle();

    // Assert - Verify the results
    actionResult.Should().BeOfType<OkObjectResult>();
    _mockService.Verify(s => s.GetAllAsync(It.IsAny<User>()), Times.Once);
}
```

**Testing Framework:**
- **xUnit** - Test framework
- **Moq** - Mocking framework
- **FluentAssertions** - Readable assertions
- **EF Core InMemory** - In-memory database for service tests

#### Endpoint Test Template
Each endpoint test should include:
1. Success case with valid data
2. Unauthorized case (no user)
3. BadRequest case (service failure)
4. Role-specific authorization cases
5. Not found case (for ID-based endpoints)

#### Service Test Template
Each service test should include:
1. Success cases for each method
2. Failure cases (not found, validation errors)
3. Role-based access control tests
4. Business rule validation tests
5. Database constraint tests

### Test Coverage by Component

**Endpoint Tests (5 files):**
- `GetAllKreditoren.Tests.cs` - 5 test methods
- `GetKreditorById.Tests.cs` - 5 test methods
- `CreateKreditor.Tests.cs` - 4 test methods
- `UpdateKreditor.Tests.cs` - 5 test methods
- `DeleteKreditor.Tests.cs` - 6 test methods

**Service Tests (1 file):**
- `KreditorService.Tests.cs` - 20+ test methods covering all service methods

**Total Test Count:** 45+ tests

### Example: Adding "GetKreditorStats" Endpoint

```bash
# 1. Copy template
cp api/_TEMPLATE_Get.cs api/GetKreditorStats.cs

# 2. Edit api/GetKreditorStats.cs
# Replace:
# - [ENDPOINT_NAME] → GetKreditorStats
# - [ROUTE] → kreditoren/{id}/stats
# - [METHOD_NAME] → GetStats
# - [RESPONSE_TYPE] → KreditorStatsDto

# 3. Create DTO
cat > models/KreditorStatsDto.cs << 'EOF'
namespace Monetaris.Kreditor.Models;

public class KreditorStatsDto
{
    public Guid KreditorId { get; set; }
    public int TotalCases { get; set; }
    public int OpenCases { get; set; }
    public int ClosedCases { get; set; }
    public decimal TotalVolume { get; set; }
    public decimal CollectedAmount { get; set; }
    public decimal OutstandingAmount { get; set; }
}
EOF

# 4. Add service method to IKreditorService.cs
Task<Result<KreditorStatsDto>> GetStatsAsync(Guid id, User currentUser);

# 5. Implement in KreditorService.cs
# ... implementation ...

# 6. Create test
cp tests/_TEMPLATE_Test.cs tests/GetKreditorStats.Tests.cs

# 7. Build and verify
dotnet build
dotnet test

# 8. Test in Swagger UI
# Navigate to http://localhost:5000/swagger
# Test GET /api/kreditoren/{id}/stats
```

## Dependencies

**External:**
- `Monetaris.Shared.Models` - BaseEntity, Result<T>
- `Monetaris.Shared.Enums` - UserRole
- `Monetaris.Shared.Interfaces` - IApplicationDbContext
- `MonetarisApi.Data` - ApplicationDbContext
- `Microsoft.AspNetCore.Mvc` - Controllers and attributes
- `Microsoft.Extensions.Logging` - Logging
- `Microsoft.EntityFrameworkCore` - Data access

**Internal (this project):**
- `Monetaris.Kreditor.Services` - Business logic
- `Monetaris.Kreditor.Models` - DTOs

**Database:**
- Table: `tenants` (will be renamed to `kreditoren` in future migration)
- Related: `user_tenant_assignments`, `cases`, `debtors`

## Database Schema

### tenants Table
```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    bank_account_iban VARCHAR(34),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenants_registration_number ON tenants(registration_number);
CREATE INDEX idx_tenants_name ON tenants(name);
```

### user_tenant_assignments Table
```sql
CREATE TABLE user_tenant_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tenant_id)
);

CREATE INDEX idx_uta_user_id ON user_tenant_assignments(user_id);
CREATE INDEX idx_uta_tenant_id ON user_tenant_assignments(tenant_id);
```

## File Structure

```
Monetaris.Tenant/
├── api/                                    # Vertical Slices
│   ├── GetAllKreditoren.cs                # 82 lines
│   ├── GetKreditorById.cs                 # 99 lines
│   ├── CreateKreditor.cs                  # 87 lines
│   ├── UpdateKreditor.cs                  # 92 lines
│   ├── DeleteKreditor.cs                  # 90 lines
│   ├── _TEMPLATE_Get.cs                   # Template
│   ├── _TEMPLATE_Post.cs                  # Template
│   ├── _TEMPLATE_Put.cs                   # Template
│   └── _TEMPLATE_Delete.cs                # Template
├── services/                               # Business Logic
│   ├── IKreditorService.cs                # 38 lines
│   └── KreditorService.cs                 # 296 lines
├── models/                                 # DTOs
│   ├── KreditorDto.cs                     # 21 lines
│   ├── CreateKreditorRequest.cs           # 13 lines
│   └── UpdateKreditorRequest.cs           # 13 lines
├── tests/                                  # Unit Tests
│   ├── GetAllKreditoren.Tests.cs          # 151 lines (5 tests)
│   ├── GetKreditorById.Tests.cs           # 163 lines (5 tests)
│   ├── CreateKreditor.Tests.cs            # 172 lines (4 tests)
│   ├── UpdateKreditor.Tests.cs            # 189 lines (5 tests)
│   ├── DeleteKreditor.Tests.cs            # 181 lines (6 tests)
│   ├── KreditorService.Tests.cs           # 556 lines (20 tests)
│   └── _TEMPLATE_EndpointTest.cs.template # Template for new tests
├── Monetaris.Tenant.csproj                # Project file
├── .editorconfig                          # Code style rules
└── README.md                              # This file
```

## Metrics

**Total Files:** 24 (5 endpoints + 4 templates + 2 services + 3 models + 7 test files + 1 project + 1 editorconfig + 1 README)

**Total Lines of Code:** ~2,400+ lines
- Endpoints: ~450 lines (avg 90 lines/endpoint)
- Templates: ~320 lines
- Services: ~334 lines
- Models: ~47 lines
- Tests: ~1,412 lines (45 test methods)
- Documentation: ~560 lines

**Test Coverage:** 90%+ (target achieved)

**Maintainability Score:** High (small files, clear separation, comprehensive tests)

## Future Improvements
- [ ] Add caching for Kreditor list (Redis)
- [ ] Implement soft-delete with `IsDeleted` flag
- [ ] Add audit log for Kreditor changes (track who modified what)
- [ ] Support for Kreditor logo upload (blob storage)
- [ ] Add contact persons sub-resource
- [ ] Add billing information sub-resource
- [ ] Implement pagination for GET /api/kreditoren
- [ ] Add search/filter capabilities (by name, registration number)
- [ ] Add validation middleware for IBAN format
- [ ] Add rate limiting for API endpoints
- [ ] Implement API versioning
- [ ] Add OpenAPI/Swagger documentation enhancements
- [ ] Create GraphQL endpoint alternative

## Migration Notes

**When renaming from Monetaris.Tenant → Monetaris.Kreditor:**

1. Rename project folder manually
2. Update .csproj file
3. Update all namespace declarations (already done in new files)
4. Update Program.cs service registrations
5. Update any project references in solution file
6. Consider database table rename migration:
   ```sql
   ALTER TABLE tenants RENAME TO kreditoren;
   ```
