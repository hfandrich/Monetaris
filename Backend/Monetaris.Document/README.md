# Document Domain (File Management)

## Overview
Manages document uploads and downloads for debtors. Supports secure file storage with validation and authorization controls.

This domain uses **Vertical Slice Architecture** with each endpoint as a separate file.

## API Endpoints

### POST /api/documents
**File**: `api/UploadDocument.cs`
**Purpose**: Upload a document file for a debtor
**Authorization**: ADMIN, AGENT, CLIENT
**Request**: Multipart form-data with `debtorId` (Guid) and `file` (IFormFile)
**Response**: `DocumentDto` (201 Created)

**Validation**:
- Max file size: 10MB
- Allowed types: PDF, JPG, JPEG, PNG, DOC, DOCX, XLS, XLSX
- Debtor must exist
- User must have access to debtor

### GET /api/documents/{id}
**File**: `api/GetDocumentById.cs`
**Purpose**: Get document metadata by ID
**Authorization**: All authenticated users (scoped by debtor access)
**Response**: `DocumentDto`

### GET /api/documents/{id}/download
**File**: `api/DownloadDocument.cs`
**Purpose**: Download document file stream
**Authorization**: All authenticated users (scoped by debtor access)
**Response**: FileStreamResult with proper Content-Type and Content-Disposition

### DELETE /api/documents/{id}
**File**: `api/DeleteDocument.cs`
**Purpose**: Delete a document (soft delete)
**Authorization**: ADMIN, AGENT only
**Response**: 204 No Content

## Business Rules

1. **File Validation**:
   - Max size: 10MB
   - Allowed extensions: .pdf, .jpg, .jpeg, .png, .doc, .docx, .xls, .xlsx
   - File name is sanitized

2. **Storage**:
   - Files stored in `uploads/{debtorId}/` directory
   - Unique file names generated (GUID + extension)
   - Physical file deleted on document deletion

3. **Authorization**:
   - ADMIN: Access all documents
   - AGENT: Access documents for assigned debtors
   - CLIENT: Access documents for own debtors
   - DEBTOR: No access to this domain

4. **Document Types**:
   - PDF: application/pdf
   - IMAGE: image/jpeg, image/png
   - WORD: .doc, .docx
   - EXCEL: .xls, .xlsx

## Services

### IDocumentService
Located in: `services/IDocumentService.cs`

Methods:
- `Task<Result<DocumentDto>> UploadAsync(Guid debtorId, IFormFile file, User currentUser)`
- `Task<Result<List<DocumentDto>>> GetByDebtorIdAsync(Guid debtorId, User currentUser)`
- `Task<Result<Stream>> DownloadAsync(Guid id, User currentUser)`
- `Task<Result<(string FileName, string ContentType)>> GetDocumentMetadataAsync(Guid id, User currentUser)`
- `Task<Result> DeleteAsync(Guid id, User currentUser)`

### DocumentService
Located in: `services/DocumentService.cs`

Dependencies:
- `IApplicationDbContext` - Database access
- `ILogger<DocumentService>` - Logging

## Models (DTOs)

### DocumentDto
Response model for document metadata.

**Properties**:
- `Id` (Guid)
- `DebtorId` (Guid)
- `Name` (string) - Original file name
- `Type` (DocumentType enum) - PDF, IMAGE, WORD, EXCEL
- `SizeBytes` (long) - File size in bytes
- `PreviewUrl` (string?) - Optional preview URL
- `UploadedAt` (DateTime)
- `SizeFormatted` (string) - Human-readable size (e.g., "2.5 MB")

## AI Instructions

### When creating a NEW endpoint:

1. **Copy the appropriate template**:
   - GET → Copy `api/_TEMPLATE_Get.cs`
   - POST → Copy `api/_TEMPLATE_Post.cs`
   - PUT → Copy `api/_TEMPLATE_Put.cs`
   - DELETE → Copy `api/_TEMPLATE_Delete.cs`

2. **Modify only these sections**:
   - Class name (match the endpoint purpose)
   - Route attribute
   - Service method call
   - Log messages

3. **NEVER change**:
   - Constructor injection pattern
   - `Result<T>` return pattern
   - Error handling structure
   - HTTP status codes

4. **Always include**:
   - XML documentation
   - `ProducesResponseType` attributes
   - `ILogger` usage
   - Proper error messages

### Code Quality Rules:

- **Max 150 lines per endpoint file**
- **Max 300 lines per service class**
- Every class must have a test
- 90%+ code coverage required

### Logging Pattern:

```csharp
// At start
_logger.LogInformation("EndpointName called: {Param}", param);

// On success
_logger.LogInformation("Operation succeeded: {Result}", result);

// On error
_logger.LogWarning("Operation failed: {Error}", error);
```

### File Upload Pattern:

```csharp
[HttpPost]
public async Task<IActionResult> Handle([FromForm] Guid debtorId, [FromForm] IFormFile file)
{
    // Validate file
    if (file == null || file.Length == 0)
        return BadRequest("No file provided");

    // Call service
    var result = await _service.UploadAsync(debtorId, file, currentUser);

    // Return 201 Created
    return CreatedAtAction(nameof(GetDocumentById.Handle), new { id = result.Data.Id }, result.Data);
}
```

### File Download Pattern:

```csharp
[HttpGet("{id}/download")]
public async Task<IActionResult> Handle(Guid id)
{
    // Get metadata and stream
    var metadataResult = await _service.GetDocumentMetadataAsync(id, currentUser);
    var streamResult = await _service.DownloadAsync(id, currentUser);

    // Return file
    return File(streamResult.Data, contentType, fileName);
}
```

## Testing

Run tests for this domain:
```bash
cd Backend
dotnet test --filter "FullyQualifiedName~Monetaris.Document.Tests"
```

## Architecture Notes

### Vertical Slice Architecture

Each endpoint is isolated in its own file:
- `api/UploadDocument.cs` - POST /api/documents
- `api/GetDocumentById.cs` - GET /api/documents/{id}
- `api/DownloadDocument.cs` - GET /api/documents/{id}/download
- `api/DeleteDocument.cs` - DELETE /api/documents/{id}

**Benefits**:
- Easy to understand each endpoint in isolation
- Changes don't affect other endpoints
- AI can generate new endpoints from templates
- Better for code review
