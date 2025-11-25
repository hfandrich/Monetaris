# TASK: Complete Document Domain Restructure

## Context
Document domain is 95% complete. Need to finalize the structure.

## Specific Tasks

1. **Remove empty DTOs/ folder**
   - Location: `Monetaris.Document/DTOs/`
   - This folder is empty and should not exist (we use models/)

2. **Delete Class1.cs**
   - Location: `Monetaris.Document/Class1.cs`
   - This is a placeholder file created by dotnet new classlib

3. **Verify Build**
   - Run: `dotnet build Monetaris.Document/Monetaris.Document.csproj`
   - Expected: 0 errors, 0 warnings
   - If build fails, invoke stuck agent immediately

## Success Criteria
- DTOs/ folder deleted
- Class1.cs deleted
- Build succeeds with 0 errors
- Report back with build output

## File Structure Should Look Like
```
Monetaris.Document/
├── api/
│   ├── UploadDocument.cs
│   ├── GetDocumentById.cs
│   ├── DownloadDocument.cs
│   ├── DeleteDocument.cs
│   ├── _TEMPLATE_Get.cs
│   ├── _TEMPLATE_Post.cs
│   ├── _TEMPLATE_Put.cs
│   └── _TEMPLATE_Delete.cs
├── models/
│   └── DocumentDto.cs
├── services/
│   ├── IDocumentService.cs
│   └── DocumentService.cs
├── tests/
│   └── .gitkeep
├── README.md
├── .editorconfig
└── Monetaris.Document.csproj
```

NO DTOs/ folder, NO Class1.cs
