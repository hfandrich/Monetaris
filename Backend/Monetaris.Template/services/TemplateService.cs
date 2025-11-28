using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Monetaris.Shared.Enums;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;
using Monetaris.Template.Models;
using Monetaris.Shared.Helpers;
using System.Text.RegularExpressions;

namespace Monetaris.Template.Services;

/// <summary>
/// Service implementation for Template operations with variable rendering
/// </summary>
public partial class TemplateService : ITemplateService
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<TemplateService> _logger;

    [GeneratedRegex(@"\{\{([^}]+)\}\}", RegexOptions.Compiled)]
    private static partial Regex VariablePattern();

    public TemplateService(IApplicationDbContext context, ILogger<TemplateService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<List<TemplateDto>>> GetAllAsync(User currentUser)
    {
        try
        {
            IQueryable<Shared.Models.Entities.Template> query = _context.Templates;

            // Apply role-based filtering
            if (currentUser.Role == UserRole.CLIENT)
            {
                // CLIENT sees only templates for their kreditor + global templates
                query = query.Where(t => t.KreditorId == currentUser.KreditorId || t.KreditorId == null);

                _logger.LogInformation("CLIENT {UserId} accessing templates for kreditor {KreditorId}",
                    currentUser.Id, currentUser.KreditorId);
            }
            else if (currentUser.Role == UserRole.AGENT)
            {
                // AGENT sees templates for assigned kreditoren + global templates
                var assignedKreditorIds = await _context.UserKreditorAssignments
                    .Where(uka => uka.UserId == currentUser.Id)
                    .Select(uka => uka.KreditorId)
                    .ToListAsync();

                query = query.Where(t =>
                    (t.KreditorId.HasValue && assignedKreditorIds.Contains(t.KreditorId.Value)) ||
                    t.KreditorId == null);

                _logger.LogInformation("AGENT {UserId} accessing templates for {KreditorCount} assigned kreditoren",
                    currentUser.Id, assignedKreditorIds.Count);
            }
            else if (currentUser.Role == UserRole.ADMIN)
            {
                // ADMIN sees all templates
                _logger.LogInformation("ADMIN {UserId} accessing all templates", currentUser.Id);
            }
            else
            {
                // DEBTOR role should not access templates
                _logger.LogWarning("User {UserId} with role {Role} attempted to access templates",
                    currentUser.Id, currentUser.Role);
                return Result<List<TemplateDto>>.Failure("Access denied");
            }

            var templates = await query
                .OrderBy(t => t.Name)
                .ToListAsync();

            var templateDtos = templates.Select(MapToDto).ToList();

            _logger.LogInformation("Retrieved {Count} templates for user {UserId}",
                templateDtos.Count, currentUser.Id);

            return Result<List<TemplateDto>>.Success(templateDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving templates for user {UserId}", currentUser.Id);
            return Result<List<TemplateDto>>.Failure("An error occurred while retrieving templates");
        }
    }

    public async Task<Result<TemplateDto>> GetByIdAsync(Guid id)
    {
        try
        {
            var template = await _context.Templates.FindAsync(id);

            if (template == null)
            {
                return Result<TemplateDto>.Failure("Template not found");
            }

            var templateDto = MapToDto(template);

            _logger.LogInformation("Retrieved template {TemplateId}", id);

            return Result<TemplateDto>.Success(templateDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving template {TemplateId}", id);
            return Result<TemplateDto>.Failure("An error occurred while retrieving the template");
        }
    }

    public async Task<Result<TemplateDto>> CreateAsync(CreateTemplateRequest request, User currentUser)
    {
        try
        {
            // Authorization: Only ADMIN and AGENT can create templates
            if (currentUser.Role != UserRole.ADMIN && currentUser.Role != UserRole.AGENT)
            {
                return Result<TemplateDto>.Failure("Only administrators and agents can create templates");
            }

            var template = new Shared.Models.Entities.Template
            {
                Name = request.Name,
                Type = request.Type,
                Category = request.Category,
                Subject = request.Subject,
                Content = request.Content,
                LastModified = DateTime.UtcNow
            };

            _context.Templates.Add(template);
            await _context.SaveChangesAsync();

            var templateDto = MapToDto(template);

            _logger.LogInformation("Template {TemplateId} created by user {UserId}", template.Id, currentUser.Id);

            return Result<TemplateDto>.Success(templateDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating template by user {UserId}", currentUser.Id);
            return Result<TemplateDto>.Failure("An error occurred while creating the template");
        }
    }

    public async Task<Result<TemplateDto>> UpdateAsync(Guid id, UpdateTemplateRequest request, User currentUser)
    {
        try
        {
            // Authorization: Only ADMIN and AGENT can update templates
            if (currentUser.Role != UserRole.ADMIN && currentUser.Role != UserRole.AGENT)
            {
                return Result<TemplateDto>.Failure("Only administrators and agents can update templates");
            }

            var template = await _context.Templates.FindAsync(id);

            if (template == null)
            {
                return Result<TemplateDto>.Failure("Template not found");
            }

            template.Name = request.Name;
            template.Type = request.Type;
            template.Category = request.Category;
            template.Subject = request.Subject;
            template.Content = request.Content;
            template.LastModified = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var templateDto = MapToDto(template);

            _logger.LogInformation("Template {TemplateId} updated by user {UserId}", id, currentUser.Id);

            return Result<TemplateDto>.Success(templateDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating template {TemplateId} by user {UserId}", id, currentUser.Id);
            return Result<TemplateDto>.Failure("An error occurred while updating the template");
        }
    }

    public async Task<Result> DeleteAsync(Guid id, User currentUser)
    {
        try
        {
            // Authorization: Only ADMIN can delete templates
            if (currentUser.Role != UserRole.ADMIN)
            {
                return Result.Failure("Only administrators can delete templates");
            }

            var template = await _context.Templates.FindAsync(id);

            if (template == null)
            {
                return Result.Failure("Template not found");
            }

            _context.Templates.Remove(template);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Template {TemplateId} deleted by user {UserId}", id, currentUser.Id);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting template {TemplateId} by user {UserId}", id, currentUser.Id);
            return Result.Failure("An error occurred while deleting the template");
        }
    }

    public async Task<Result<RenderTemplateResponse>> RenderAsync(
        Guid id,
        RenderTemplateRequest request,
        User currentUser)
    {
        try
        {
            var template = await _context.Templates.FindAsync(id);

            if (template == null)
            {
                return Result<RenderTemplateResponse>.Failure("Template not found");
            }

            // Gather data for variable replacement
            Dictionary<string, string> variables = new();

            // Load case data if provided
            if (request.CaseId.HasValue)
            {
                var caseEntity = await _context.Cases
                    .Include(c => c.Debtor)
                    .Include(c => c.Kreditor)
                    .Include(c => c.Agent)
                    .FirstOrDefaultAsync(c => c.Id == request.CaseId.Value);

                if (caseEntity == null)
                {
                    return Result<RenderTemplateResponse>.Failure("Case not found");
                }

                // Add case variables
                AddCaseVariables(variables, caseEntity);
                AddDebtorVariables(variables, caseEntity.Debtor);
                AddKreditorVariables(variables, caseEntity.Kreditor);
            }
            // Load debtor data if provided (and no case)
            else if (request.DebtorId.HasValue)
            {
                var debtor = await _context.Debtors
                    .Include(d => d.Kreditor)
                    .FirstOrDefaultAsync(d => d.Id == request.DebtorId.Value);

                if (debtor == null)
                {
                    return Result<RenderTemplateResponse>.Failure("Debtor not found");
                }

                AddDebtorVariables(variables, debtor);
                AddKreditorVariables(variables, debtor.Kreditor);
            }

            // Render content
            var renderedContent = ReplaceVariables(template.Content, variables);
            var renderedSubject = template.Subject != null
                ? ReplaceVariables(template.Subject, variables)
                : null;

            var response = new RenderTemplateResponse
            {
                RenderedSubject = renderedSubject,
                RenderedContent = renderedContent
            };

            _logger.LogInformation("Template {TemplateId} rendered by user {UserId}", id, currentUser.Id);

            return Result<RenderTemplateResponse>.Success(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rendering template {TemplateId} by user {UserId}", id, currentUser.Id);
            return Result<RenderTemplateResponse>.Failure("An error occurred while rendering the template");
        }
    }

    // Helper methods

    private string ReplaceVariables(string content, Dictionary<string, string> variables)
    {
        return VariablePattern().Replace(content, match =>
        {
            var variableName = match.Groups[1].Value.Trim();
            return variables.TryGetValue(variableName, out var value) ? value : match.Value;
        });
    }

    private void AddCaseVariables(Dictionary<string, string> variables, Case caseEntity)
    {
        variables["case.invoiceNumber"] = caseEntity.InvoiceNumber;
        variables["case.invoiceDate"] = caseEntity.InvoiceDate.ToString("dd.MM.yyyy");
        variables["case.dueDate"] = caseEntity.DueDate.ToString("dd.MM.yyyy");
        variables["case.principalAmount"] = caseEntity.PrincipalAmount.ToString("F2");
        variables["case.costs"] = caseEntity.Costs.ToString("F2");
        variables["case.interest"] = caseEntity.Interest.ToString("F2");
        variables["case.totalAmount"] = caseEntity.TotalAmount.ToString("F2");
        variables["case.currency"] = caseEntity.Currency;
        variables["case.status"] = caseEntity.Status.ToString();
        variables["case.competentCourt"] = caseEntity.CompetentCourt;
        variables["case.courtFileNumber"] = caseEntity.CourtFileNumber ?? "N/A";
        variables["case.nextActionDate"] = caseEntity.NextActionDate?.ToString("dd.MM.yyyy") ?? "N/A";

        // New claim detail fields
        variables["case.dateOfOrigin"] = caseEntity.DateOfOrigin?.ToString("dd.MM.yyyy") ?? "N/A";
        variables["case.claimDescription"] = caseEntity.ClaimDescription ?? "N/A";
        variables["case.interestStartDate"] = caseEntity.InterestStartDate?.ToString("dd.MM.yyyy") ?? "N/A";
        variables["case.interestRate"] = caseEntity.InterestRate?.ToString("F2") ?? "N/A";
        variables["case.isVariableInterest"] = caseEntity.IsVariableInterest.ToString();
        variables["case.interestEndDate"] = caseEntity.InterestEndDate?.ToString("dd.MM.yyyy") ?? "N/A";
        variables["case.additionalCosts"] = caseEntity.AdditionalCosts.ToString("F2");
        variables["case.procedureCosts"] = caseEntity.ProcedureCosts.ToString("F2");
        variables["case.interestOnCosts"] = caseEntity.InterestOnCosts.ToString();
        variables["case.statuteOfLimitationsDate"] = caseEntity.StatuteOfLimitationsDate?.ToString("dd.MM.yyyy") ?? "N/A";
        variables["case.paymentAllocationNotes"] = caseEntity.PaymentAllocationNotes ?? "N/A";
    }

    private void AddDebtorVariables(Dictionary<string, string> variables, Debtor debtor)
    {
        if (debtor.EntityType != EntityType.NATURAL_PERSON)
        {
            variables["debtor.name"] = debtor.CompanyName ?? "N/A";
            variables["debtor.companyName"] = debtor.CompanyName ?? "N/A";
            variables["debtor.salutation"] = "Sehr geehrte Damen und Herren";
        }
        else
        {
            variables["debtor.firstName"] = debtor.FirstName ?? "N/A";
            variables["debtor.lastName"] = debtor.LastName ?? "N/A";
            variables["debtor.name"] = $"{debtor.FirstName} {debtor.LastName}";
            // Determine German salutation (Anrede)
            variables["debtor.salutation"] = $"Sehr geehrte/r Frau/Herr {debtor.LastName}";
        }

        variables["debtor.email"] = debtor.Email ?? "N/A";
        variables["debtor.phone"] = debtor.PhoneLandline ?? debtor.PhoneMobile ?? "N/A";
        variables["debtor.phoneLandline"] = debtor.PhoneLandline ?? "N/A";
        variables["debtor.phoneMobile"] = debtor.PhoneMobile ?? "N/A";
        variables["debtor.street"] = debtor.Street ?? "N/A";
        variables["debtor.houseNumber"] = debtor.HouseNumber ?? "N/A";
        variables["debtor.zipCode"] = debtor.ZipCode ?? "N/A";
        variables["debtor.city"] = debtor.City ?? "N/A";
        variables["debtor.cityDistrict"] = debtor.CityDistrict ?? "N/A";
        variables["debtor.country"] = debtor.Country;
        variables["debtor.address"] = $"{debtor.Street} {debtor.HouseNumber}, {debtor.ZipCode} {debtor.City}";
        variables["debtor.totalDebt"] = debtor.TotalDebt.ToString("F2");
        variables["debtor.openCases"] = debtor.OpenCases.ToString();
        variables["debtor.entityType"] = debtor.EntityType.ToString();
        variables["debtor.isCompany"] = (debtor.EntityType != EntityType.NATURAL_PERSON).ToString();

        // Extended fields
        variables["debtor.birthName"] = debtor.BirthName ?? "N/A";
        variables["debtor.gender"] = debtor.Gender?.ToString() ?? "N/A";
        variables["debtor.birthPlace"] = debtor.BirthPlace ?? "N/A";
        variables["debtor.birthCountry"] = debtor.BirthCountry ?? "N/A";
        variables["debtor.dateOfBirth"] = debtor.DateOfBirth?.ToString("dd.MM.yyyy") ?? "N/A";
        variables["debtor.floor"] = debtor.Floor ?? "N/A";
        variables["debtor.doorPosition"] = debtor.DoorPosition?.ToString() ?? "N/A";
        variables["debtor.additionalAddressInfo"] = debtor.AdditionalAddressInfo ?? "N/A";
        variables["debtor.poBox"] = debtor.POBox ?? "N/A";
        variables["debtor.poBoxZipCode"] = debtor.POBoxZipCode ?? "N/A";
        variables["debtor.representedBy"] = debtor.RepresentedBy ?? "N/A";
        variables["debtor.isDeceased"] = debtor.IsDeceased.ToString();
        variables["debtor.placeOfDeath"] = debtor.PlaceOfDeath ?? "N/A";
        variables["debtor.fax"] = debtor.Fax ?? "N/A";
        variables["debtor.eboAddress"] = debtor.EboAddress ?? "N/A";
        variables["debtor.bankIBAN"] = debtor.BankIBAN ?? "N/A";
        variables["debtor.bankBIC"] = debtor.BankBIC ?? "N/A";
        variables["debtor.bankName"] = debtor.BankName ?? "N/A";
        variables["debtor.registerCourt"] = debtor.RegisterCourt ?? "N/A";
        variables["debtor.registerNumber"] = debtor.RegisterNumber ?? "N/A";
        variables["debtor.vatId"] = debtor.VatId ?? "N/A";
        variables["debtor.partners"] = debtor.Partners ?? "N/A";
        variables["debtor.fileReference"] = debtor.FileReference ?? "N/A";
    }

    public async Task<Result<RenderTemplateResponse>> RenderPaymentTemplateAsync(
        Guid id,
        RenderTemplateRequest request,
        User currentUser)
    {
        try
        {
            // Authorization: Only ADMIN can render payment templates with full IBAN
            if (currentUser.Role != UserRole.ADMIN)
            {
                _logger.LogWarning("User {UserId} ({Role}) attempted to render payment template with full IBAN",
                    currentUser.Id, currentUser.Role);
                return Result<RenderTemplateResponse>.Failure("Only administrators can render payment templates with full IBAN");
            }

            var template = await _context.Templates.FindAsync(id);

            if (template == null)
            {
                return Result<RenderTemplateResponse>.Failure("Template not found");
            }

            // Gather data for variable replacement
            Dictionary<string, string> variables = new();

            // Load case data if provided
            if (request.CaseId.HasValue)
            {
                var caseEntity = await _context.Cases
                    .Include(c => c.Debtor)
                    .Include(c => c.Kreditor)
                    .Include(c => c.Agent)
                    .FirstOrDefaultAsync(c => c.Id == request.CaseId.Value);

                if (caseEntity == null)
                {
                    return Result<RenderTemplateResponse>.Failure("Case not found");
                }

                AddCaseVariables(variables, caseEntity);
                AddDebtorVariables(variables, caseEntity.Debtor);
                AddKreditorVariablesWithFullIBAN(variables, caseEntity.Kreditor, currentUser);
            }
            // Load debtor data if provided (and no case)
            else if (request.DebtorId.HasValue)
            {
                var debtor = await _context.Debtors
                    .Include(d => d.Kreditor)
                    .FirstOrDefaultAsync(d => d.Id == request.DebtorId.Value);

                if (debtor == null)
                {
                    return Result<RenderTemplateResponse>.Failure("Debtor not found");
                }

                AddDebtorVariables(variables, debtor);
                AddKreditorVariablesWithFullIBAN(variables, debtor.Kreditor, currentUser);
            }

            // Render content
            var renderedContent = ReplaceVariables(template.Content, variables);
            var renderedSubject = template.Subject != null
                ? ReplaceVariables(template.Subject, variables)
                : null;

            var response = new RenderTemplateResponse
            {
                RenderedSubject = renderedSubject,
                RenderedContent = renderedContent
            };

            _logger.LogInformation("Payment template {TemplateId} rendered with full IBAN by user {UserId}", id, currentUser.Id);

            return Result<RenderTemplateResponse>.Success(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rendering payment template {TemplateId} by user {UserId}", id, currentUser.Id);
            return Result<RenderTemplateResponse>.Failure("An error occurred while rendering the payment template");
        }
    }

    private void AddKreditorVariables(Dictionary<string, string> variables, Shared.Models.Entities.Kreditor kreditor)
    {
        variables["kreditor.name"] = kreditor.Name;
        variables["kreditor.registrationNumber"] = kreditor.RegistrationNumber;
        variables["kreditor.contactEmail"] = kreditor.ContactEmail;
        // SECURITY: Mask IBAN in template rendering (only payment templates need full IBAN)
        // For payment documents, use RenderPaymentTemplateAsync instead
        variables["kreditor.bankAccountIBAN"] = SensitiveDataHelper.MaskIBAN(kreditor.BankAccountIBAN);
    }

    private void AddKreditorVariablesWithFullIBAN(Dictionary<string, string> variables, Shared.Models.Entities.Kreditor kreditor, User currentUser)
    {
        variables["kreditor.name"] = kreditor.Name;
        variables["kreditor.registrationNumber"] = kreditor.RegistrationNumber;
        variables["kreditor.contactEmail"] = kreditor.ContactEmail;
        // SECURITY: Full IBAN for payment templates (with audit logging)
        variables["kreditor.bankAccountIBAN"] = kreditor.BankAccountIBAN;

        _logger.LogInformation("Full IBAN accessed for Kreditor {KreditorId} by User {UserId} ({Role}) in payment template",
            kreditor.Id, currentUser.Id, currentUser.Role);
    }

    private TemplateDto MapToDto(Shared.Models.Entities.Template template)
    {
        return new TemplateDto
        {
            Id = template.Id,
            Name = template.Name,
            Type = template.Type,
            Category = template.Category,
            Subject = template.Subject,
            Content = template.Content,
            LastModified = template.LastModified,
            CreatedAt = template.CreatedAt
        };
    }
}
