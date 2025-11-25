# Template Domain (Communication Templates)

## Overview
Manages communication templates for letters, emails, and legal documents used in the collection process.

This domain uses **Vertical Slice Architecture** with **AI-First + Vibe-First** principles:
- Each endpoint is a separate file (<150 lines)
- Template files show AI how to create new endpoints safely
- Services contain business logic (max 300 lines)
- Models (DTOs) define data contracts

## API Endpoints

### GET /api/templates
**File**: `api/GetAllTemplates.cs`
**Purpose**: List all communication templates
**Authorization**: All authenticated users
**Response**: `List<TemplateDto>`

### GET /api/templates/{id}
**File**: `api/GetTemplateById.cs`
**Purpose**: Get single template by ID
**Authorization**: All authenticated users
**Response**: `TemplateDto`

### POST /api/templates
**File**: `api/CreateTemplate.cs`
**Purpose**: Create new communication template
**Authorization**: ADMIN only
**Request**: `CreateTemplateRequest`
**Response**: `TemplateDto` (201 Created)

### PUT /api/templates/{id}
**File**: `api/UpdateTemplate.cs`
**Purpose**: Update existing template
**Authorization**: ADMIN only
**Request**: `UpdateTemplateRequest`
**Response**: `TemplateDto`

### DELETE /api/templates/{id}
**File**: `api/DeleteTemplate.cs`
**Purpose**: Delete template (hard delete)
**Authorization**: ADMIN only
**Response**: 204 No Content

### POST /api/templates/{id}/render
**File**: `api/RenderTemplate.cs`
**Purpose**: Render template with variable substitution
**Authorization**: ADMIN, AGENT
**Request**: `RenderTemplateRequest`
**Response**: `RenderTemplateResponse`

## Business Rules

1. **Access Control**:
   - All users can VIEW templates
   - Only ADMIN can CREATE, UPDATE, DELETE templates
   - ADMIN and AGENT can RENDER templates

2. **Validation**:
   - Name is required (max 200 chars)
   - Content is required
   - Type must be EMAIL, LETTER, or SMS
   - Category must be REMINDER, LEGAL, PAYMENT, or INFO

3. **Template Variables**:
   - Variables use format: `{{variableName}}`
   - Common variables: `{{debtorName}}`, `{{caseNumber}}`, `{{amount}}`, `{{dueDate}}`
   - Rendering replaces all variables with actual values

4. **Deletion Rules**:
   - Hard delete (removes from DB)
   - No dependency checks (templates are passive)

## Services

### ITemplateService
Located in: `services/ITemplateService.cs`

Methods:
- `Task<Result<List<TemplateDto>>> GetAllAsync()`
- `Task<Result<TemplateDto>> GetByIdAsync(Guid id)`
- `Task<Result<TemplateDto>> CreateAsync(CreateTemplateRequest request, User currentUser)`
- `Task<Result<TemplateDto>> UpdateAsync(Guid id, UpdateTemplateRequest request, User currentUser)`
- `Task<Result> DeleteAsync(Guid id, User currentUser)`
- `Task<Result<RenderTemplateResponse>> RenderAsync(Guid id, RenderTemplateRequest request, User currentUser)`

### TemplateService
Located in: `services/TemplateService.cs`

Dependencies:
- `IApplicationDbContext` - Database access
- `ILogger<TemplateService>` - Logging

## Models (DTOs)

### TemplateDto
Response model for template data.

**Properties**:
- `Id` (Guid)
- `Name` (string)
- `Type` (TemplateType) - EMAIL, LETTER, SMS
- `Category` (TemplateCategory) - REMINDER, LEGAL, PAYMENT, INFO
- `Subject` (string?) - For emails
- `Content` (string)
- `LastModified` (DateTime)
- `CreatedAt` (DateTime)

### CreateTemplateRequest
- `Name` (required, max 200)
- `Type` (required)
- `Category` (required)
- `Subject` (optional, for emails)
- `Content` (required)

### UpdateTemplateRequest
- `Name` (required)
- `Type` (required)
- `Category` (required)
- `Subject` (optional)
- `Content` (required)

### RenderTemplateRequest
- `Variables` (Dictionary<string, string>) - Key-value pairs for replacement

### RenderTemplateResponse
- `RenderedContent` (string) - Template with variables replaced
- `RenderedSubject` (string?) - Subject with variables replaced

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
return Result<TemplateDto>.Success(data);
return Result<TemplateDto>.Failure("Error message");

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
var result = await _service.CreateAsync(request, currentUser);
```

### Template Rendering Example:

```csharp
// Template content
"Dear {{debtorName}}, your payment of {{amount}} is due on {{dueDate}}."

// Variables
{
    "debtorName": "John Doe",
    "amount": "500.00 EUR",
    "dueDate": "2025-12-31"
}

// Rendered output
"Dear John Doe, your payment of 500.00 EUR is due on 2025-12-31."
```

## Testing

Run tests for this domain:
```bash
cd Backend
dotnet test --filter "FullyQualifiedName~Monetaris.Template.Tests"
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

## Common Template Variables

Standard variables supported in templates:

**Debtor Info**:
- `{{debtorName}}` - Full name
- `{{debtorAddress}}` - Complete address
- `{{debtorEmail}}` - Email address

**Case Info**:
- `{{caseNumber}}` - Case reference number
- `{{amount}}` - Total amount owed
- `{{principalAmount}}` - Main debt amount
- `{{costs}}` - Collection costs
- `{{interest}}` - Interest amount
- `{{dueDate}}` - Payment due date
- `{{caseStatus}}` - Current case status

**Creditor Info**:
- `{{creditorName}}` - Creditor/tenant name
- `{{creditorIBAN}}` - Bank account for payment

**System**:
- `{{currentDate}}` - Today's date
- `{{deadline}}` - Calculated deadline date
