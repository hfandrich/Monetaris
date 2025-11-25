using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Monetaris.Shared.Enums;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;
using Monetaris.Template.Models;
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

    public async Task<Result<List<TemplateDto>>> GetAllAsync()
    {
        try
        {
            var templates = await _context.Templates
                .OrderBy(t => t.Name)
                .ToListAsync();

            var templateDtos = templates.Select(MapToDto).ToList();

            _logger.LogInformation("Retrieved {Count} templates", templateDtos.Count);

            return Result<List<TemplateDto>>.Success(templateDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving templates");
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
                    .Include(c => c.Tenant)
                    .Include(c => c.Agent)
                    .FirstOrDefaultAsync(c => c.Id == request.CaseId.Value);

                if (caseEntity == null)
                {
                    return Result<RenderTemplateResponse>.Failure("Case not found");
                }

                // Add case variables
                AddCaseVariables(variables, caseEntity);
                AddDebtorVariables(variables, caseEntity.Debtor);
                AddTenantVariables(variables, caseEntity.Tenant);
            }
            // Load debtor data if provided (and no case)
            else if (request.DebtorId.HasValue)
            {
                var debtor = await _context.Debtors
                    .Include(d => d.Tenant)
                    .FirstOrDefaultAsync(d => d.Id == request.DebtorId.Value);

                if (debtor == null)
                {
                    return Result<RenderTemplateResponse>.Failure("Debtor not found");
                }

                AddDebtorVariables(variables, debtor);
                AddTenantVariables(variables, debtor.Tenant);
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
    }

    private void AddDebtorVariables(Dictionary<string, string> variables, Debtor debtor)
    {
        if (debtor.IsCompany)
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
        variables["debtor.phone"] = debtor.Phone ?? "N/A";
        variables["debtor.street"] = debtor.Street ?? "N/A";
        variables["debtor.zipCode"] = debtor.ZipCode ?? "N/A";
        variables["debtor.city"] = debtor.City ?? "N/A";
        variables["debtor.country"] = debtor.Country;
        variables["debtor.address"] = $"{debtor.Street}, {debtor.ZipCode} {debtor.City}";
        variables["debtor.totalDebt"] = debtor.TotalDebt.ToString("F2");
        variables["debtor.openCases"] = debtor.OpenCases.ToString();
    }

    private void AddTenantVariables(Dictionary<string, string> variables, Shared.Models.Entities.Tenant tenant)
    {
        variables["tenant.name"] = tenant.Name;
        variables["tenant.registrationNumber"] = tenant.RegistrationNumber;
        variables["tenant.contactEmail"] = tenant.ContactEmail;
        variables["tenant.bankAccountIBAN"] = tenant.BankAccountIBAN;
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
