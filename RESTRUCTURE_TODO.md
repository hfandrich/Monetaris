# Restructure 4 Domains to Vertical Slice Architecture

## Status Overview
- Document: MOSTLY DONE (has api/, models/, templates, README, .editorconfig)
- Inquiry: NEEDS COMPLETION (has api/ with 3 endpoints, models/, services/)
- Template: NEEDS COMPLETION (has DTOs/, services/, validators/)
- Dashboard: NEEDS COMPLETION (has DTOs/, services/)

## Domain 1: Document (MOSTLY COMPLETE)
- [x] api/UploadDocument.cs - EXISTS
- [x] api/GetDocumentById.cs - EXISTS
- [x] api/DownloadDocument.cs - EXISTS
- [x] api/DeleteDocument.cs - EXISTS
- [x] 4 template files - EXISTS
- [ ] Rename DTOs/ folder to models/ (if needed)
- [x] models/DocumentDto.cs - EXISTS
- [ ] Create missing request models (UploadDocumentRequest, etc.)
- [x] README.md - EXISTS
- [x] .editorconfig - EXISTS
- [ ] tests/.gitkeep
- [ ] Build and verify

## Domain 2: Inquiry (PARTIAL STRUCTURE)
- [x] api/GetInquiries.cs - EXISTS (rename to GetInquiriesByCaseId.cs)
- [x] api/CreateInquiry.cs - EXISTS
- [x] api/ResolveInquiry.cs - EXISTS
- [x] 4 template files - EXISTS
- [ ] Rename DTOs/ to models/
- [x] models/InquiryDto.cs - EXISTS
- [x] models/CreateInquiryRequest.cs - EXISTS
- [x] models/ResolveInquiryRequest.cs - EXISTS
- [ ] README.md
- [ ] .editorconfig
- [ ] tests/.gitkeep
- [ ] Build and verify

## Domain 3: Template (NEEDS RESTRUCTURING)
- [ ] api/GetAllTemplates.cs - CREATE
- [ ] api/GetTemplateById.cs - CREATE
- [ ] api/CreateTemplate.cs - CREATE
- [ ] api/UpdateTemplate.cs - CREATE
- [ ] api/DeleteTemplate.cs - CREATE
- [ ] api/RenderTemplate.cs - CREATE
- [ ] 4 template files - CREATE
- [ ] Rename DTOs/ to models/
- [ ] Move CreateTemplateRequest to models/
- [ ] Move UpdateTemplateRequest to models/
- [ ] Move RenderTemplateRequest to models/
- [ ] Move RenderTemplateResponse to models/
- [ ] Move TemplateDto to models/
- [ ] README.md
- [ ] .editorconfig
- [ ] tests/.gitkeep
- [ ] Build and verify

## Domain 4: Dashboard (NEEDS RESTRUCTURING)
- [ ] api/GetStatistics.cs - CREATE
- [ ] api/GetRecentActivity.cs - CREATE
- [ ] api/GlobalSearch.cs - CREATE
- [ ] 4 template files - CREATE
- [ ] Rename DTOs/ to models/
- [ ] Move DashboardStatsDto to models/
- [ ] Move FinancialChartDto to models/
- [ ] Move SearchResultDto to models/
- [ ] README.md
- [ ] .editorconfig
- [ ] tests/.gitkeep
- [ ] Build and verify

## Final Verification
- [ ] Build entire Backend solution
- [ ] Verify all 4 domains compile
- [ ] Check file counts match expectations
- [ ] Remove Class1.cs files from all domains
