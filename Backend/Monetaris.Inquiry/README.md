# Inquiry Domain (Case Clarifications)

## Overview
Manages inquiries (Rückfragen) for collection cases requiring additional information or clarification.

This domain uses **Vertical Slice Architecture** with **AI-First + Vibe-First** principles:
- Each endpoint is a separate file (<150 lines)
- Template files show AI how to create new endpoints safely
- Services contain business logic (max 300 lines)
- Models (DTOs) define data contracts

## API Endpoints

### GET /api/inquiries
**File**: `api/GetInquiries.cs`
**Purpose**: List all inquiries (scoped by user role)
**Authorization**: All authenticated users (scoped by role)
**Response**: `List<InquiryDto>`

**Scoping Rules**:
- **ADMIN**: Can access ALL inquiries
- **AGENT**: Can access only assigned cases' inquiries (via UserTenantAssignments)
- **CLIENT**: Can access only their own cases' inquiries
- **DEBTOR**: No access to this domain

### POST /api/inquiries
**File**: `api/CreateInquiry.cs`
**Purpose**: Create new inquiry for a case
**Authorization**: ADMIN, AGENT, CLIENT
**Request**: `CreateInquiryRequest`
**Response**: `InquiryDto` (201 Created)

### PUT /api/inquiries/{id}/resolve
**File**: `api/ResolveInquiry.cs`
**Purpose**: Resolve an inquiry with an answer
**Authorization**: ADMIN, AGENT
**Request**: `ResolveInquiryRequest`
**Response**: `InquiryDto`

## Business Rules

1. **Multi-Tenancy Scoping**:
   - ADMIN: Can access ALL inquiries
   - AGENT: Can access only assigned cases' inquiries
   - CLIENT: Can access only their OWN cases' inquiries
   - DEBTOR: No access

2. **Validation**:
   - Question is required (max 1000 chars)
   - Must reference valid CaseId
   - Answer is required when resolving

3. **Status Transitions**:
   - OPEN → RESOLVED (via ResolveInquiry endpoint)
   - Cannot re-open resolved inquiries

## Services

### IInquiryService
Located in: `services/IInquiryService.cs`

Methods:
- `Task<Result<List<InquiryDto>>> GetAllAsync(User currentUser)`
- `Task<Result<InquiryDto>> CreateAsync(CreateInquiryRequest request, User currentUser)`
- `Task<Result<InquiryDto>> ResolveAsync(Guid id, ResolveInquiryRequest request, User currentUser)`

### InquiryService
Located in: `services/InquiryService.cs`

Dependencies:
- `IApplicationDbContext` - Database access
- `ILogger<InquiryService>` - Logging

## Models (DTOs)

### InquiryDto
Response model for inquiry data.

**Properties**:
- `Id` (Guid)
- `CaseId` (Guid)
- `Question` (string)
- `Answer` (string?)
- `Status` (InquiryStatus)
- `CreatedAt` (DateTime)
- `ResolvedAt` (DateTime?)

### CreateInquiryRequest
- `CaseId` (required)
- `Question` (required, max 1000)

### ResolveInquiryRequest
- `Answer` (required, max 2000)

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
return Result<InquiryDto>.Success(data);
return Result<InquiryDto>.Failure("Error message");

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

## Testing

Run tests for this domain:
```bash
cd Backend
dotnet test --filter "FullyQualifiedName~Monetaris.Inquiry.Tests"
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
