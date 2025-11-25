# TASK: Update Namespaces from DTOs to Models

## Context
Three domains (Template, Dashboard, Inquiry) have been renamed from `DTOs/` folder to `models/` folder, but the C# namespace declarations still say `.DTOs` instead of `.Models`.

## Files Requiring Namespace Declaration Changes

### Template Domain (5 files)
Update namespace from `Monetaris.Template.DTOs` to `Monetaris.Template.Models`:
1. `Monetaris.Template/models/CreateTemplateRequest.cs`
2. `Monetaris.Template/models/UpdateTemplateRequest.cs`
3. `Monetaris.Template/models/RenderTemplateRequest.cs`
4. `Monetaris.Template/models/RenderTemplateResponse.cs`
5. `Monetaris.Template/models/TemplateDto.cs`

### Dashboard Domain (3 files)
Update namespace from `Monetaris.Dashboard.DTOs` to `Monetaris.Dashboard.Models`:
1. `Monetaris.Dashboard/models/DashboardStatsDto.cs`
2. `Monetaris.Dashboard/models/FinancialChartDto.cs`
3. `Monetaris.Dashboard/models/SearchResultDto.cs`

### Inquiry Domain (0 files)
Models already have correct namespace `Monetaris.Inquiry.Models` - no changes needed.

## Files Requiring Using Statement Changes

### Template Using Statements (5 files)
Change `using Monetaris.Template.DTOs;` to `using Monetaris.Template.Models;`:
1. `MonetarisApi/Controllers/TemplateController.cs`
2. `Monetaris.Template/services/ITemplateService.cs`
3. `Monetaris.Template/services/TemplateService.cs`
4. `Monetaris.Template/Validators/CreateTemplateRequestValidator.cs`
5. `Monetaris.Template/Validators/UpdateTemplateRequestValidator.cs`

### Dashboard Using Statements (3 files)
Change `using Monetaris.Dashboard.DTOs;` to `using Monetaris.Dashboard.Models;`:
1. `MonetarisApi/Controllers/DashboardController.cs`
2. `Monetaris.Dashboard/services/IDashboardService.cs`
3. `Monetaris.Dashboard/services/DashboardService.cs`

### Inquiry Using Statements (3 files)
Change `using Monetaris.Inquiry.DTOs;` to `using Monetaris.Inquiry.Models;`:
1. `MonetarisApi/Controllers/InquiryController.cs`
2. `Monetaris.Inquiry/Validators/CreateInquiryRequestValidator.cs`
3. `Monetaris.Inquiry/Validators/ResolveInquiryRequestValidator.cs`

## Task Steps

1. Update namespace declarations in all 8 model files (Template: 5, Dashboard: 3)
2. Update using statements in all 11 service/controller/validator files
3. Build all 3 domains to verify no compilation errors
4. Report back with build results

## Success Criteria
- All namespace declarations updated from `.DTOs` to `.Models`
- All using statements updated from `.DTOs` to `.Models`
- All 3 domains build successfully with 0 errors
- Warnings are acceptable (expected from template files)

## Absolute Paths (for reference)
Base: C:\Users\fandrich\OneDrive - Strukturschmiede - Ihr Erfolg GmbH\Mieterverwaltung\Mahnwesen\Monetaris\Backend
