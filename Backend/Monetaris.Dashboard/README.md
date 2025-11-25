# Dashboard Domain (KPIs & Analytics)

## Overview
Provides dashboard statistics, financial charts, and global search functionality for the Monetaris system.

This domain uses **Vertical Slice Architecture** with **AI-First + Vibe-First** principles:
- Each endpoint is a separate file (<150 lines)
- Template files show AI how to create new endpoints safely
- Services contain business logic (max 300 lines)
- Models (DTOs) define data contracts

## API Endpoints

### GET /api/dashboard/statistics
**File**: `api/GetStatistics.cs`
**Purpose**: Get dashboard KPI statistics
**Authorization**: All authenticated users (scoped by role)
**Response**: `DashboardStatsDto`

**Scoping Rules**:
- **ADMIN**: Statistics across ALL tenants
- **AGENT**: Statistics for assigned tenants only
- **CLIENT**: Statistics for own tenant only
- **DEBTOR**: No access to this domain

### GET /api/dashboard/activity
**File**: `api/GetRecentActivity.cs`
**Purpose**: Get financial data for charts
**Authorization**: All authenticated users (scoped by role)
**Response**: `FinancialChartDto`

### GET /api/dashboard/search?query={query}
**File**: `api/GlobalSearch.cs`
**Purpose**: Search across cases, debtors, and tenants
**Authorization**: All authenticated users (scoped by role)
**Response**: `List<SearchResultDto>`

**Search Behavior**:
- Searches across: Case numbers, debtor names, tenant names
- Results are scoped by user's access rights
- Minimum query length: 2 characters
- Case-insensitive search

## Business Rules

1. **Multi-Tenancy Scoping**:
   - ADMIN: Can access ALL data
   - AGENT: Can access only assigned tenants' data
   - CLIENT: Can access only their OWN tenant's data
   - DEBTOR: No access

2. **Statistics Calculation**:
   - TotalVolume: Sum of all case amounts
   - ActiveCases: Cases not in PAID/SETTLED/UNCOLLECTIBLE
   - LegalCases: Cases in MB_*/VB_*/ENFORCEMENT_* statuses
   - SuccessRate: (PAID + SETTLED) / Total Cases * 100
   - ProjectedRecovery: Sum of active case amounts

3. **Search Rules**:
   - Query must be at least 2 characters
   - Searches: case numbers, debtor names, tenant names
   - Results limited to 50 items
   - Sorted by relevance (exact matches first)

## Services

### IDashboardService
Located in: `services/IDashboardService.cs`

Methods:
- `Task<Result<DashboardStatsDto>> GetStatsAsync(User currentUser)`
- `Task<Result<FinancialChartDto>> GetFinancialDataAsync(User currentUser)`
- `Task<Result<List<SearchResultDto>>> SearchAsync(string query, User currentUser)`

### DashboardService
Located in: `services/DashboardService.cs`

Dependencies:
- `IApplicationDbContext` - Database access
- `ILogger<DashboardService>` - Logging

## Models (DTOs)

### DashboardStatsDto
Response model for KPI statistics.

**Properties**:
- `TotalVolume` (decimal) - Total amount across all cases
- `ActiveCases` (int) - Number of active cases
- `LegalCases` (int) - Cases in legal proceedings
- `SuccessRate` (double) - Recovery success rate (%)
- `ProjectedRecovery` (decimal) - Expected recovery amount
- `TotalDebtors` (int) - Total debtor count
- `TotalTenants` (int) - Total tenant count

### FinancialChartDto
Response model for financial chart data.

**Properties**:
- `MonthlyData` (List<MonthlyDataPoint>) - Monthly breakdown
- `CategoryData` (List<CategoryDataPoint>) - By case status

### SearchResultDto
Response model for search results.

**Properties**:
- `Id` (Guid) - Entity ID
- `Type` (string) - "Case", "Debtor", or "Tenant"
- `Title` (string) - Display name/number
- `Subtitle` (string) - Additional context
- `Url` (string) - Navigation URL

## AI Instructions

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
return Result<DashboardStatsDto>.Success(data);
return Result<DashboardStatsDto>.Failure("Error message");

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
var result = await _service.GetStatsAsync(currentUser);
```

### Scoping Logic Example:

```csharp
// In service
public async Task<Result<DashboardStatsDto>> GetStatsAsync(User currentUser)
{
    IQueryable<CollectionCase> query = _context.Cases;

    // Apply role-based filtering
    if (currentUser.Role == UserRole.CLIENT)
    {
        query = query.Where(c => c.TenantId == currentUser.TenantId);
    }
    else if (currentUser.Role == UserRole.AGENT)
    {
        var assignedTenantIds = await _context.UserTenantAssignments
            .Where(uta => uta.UserId == currentUser.Id)
            .Select(uta => uta.TenantId)
            .ToListAsync();
        query = query.Where(c => assignedTenantIds.Contains(c.TenantId));
    }
    // ADMIN gets all data (no filter)

    // Calculate statistics
    var stats = new DashboardStatsDto
    {
        TotalVolume = await query.SumAsync(c => c.TotalAmount),
        ActiveCases = await query.CountAsync(c => c.Status != CaseStatus.PAID),
        // ... etc
    };

    return Result<DashboardStatsDto>.Success(stats);
}
```

## Testing

Run tests for this domain:
```bash
cd Backend
dotnet test --filter "FullyQualifiedName~Monetaris.Dashboard.Tests"
```

Generate coverage report:
```bash
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover
```

## Architecture Notes

### Vertical Slice Architecture

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
5. **Heavy documentation**: Comments guide AI behavior

**Human Role**: Only reviews Merge Requests for correctness and business logic.

## Performance Considerations

### Statistics Calculation
- Cache results for 5 minutes (add caching middleware)
- Use indexed columns for filtering (TenantId, Status)
- Aggregate in database, not in application code

### Global Search
- Limit results to 50 items
- Use indexed columns (CaseNumber, Name fields)
- Consider adding full-text search for large datasets

### Financial Charts
- Pre-calculate monthly aggregates via background job
- Store in separate `DashboardCache` table
- Refresh cache daily at midnight
