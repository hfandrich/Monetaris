using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;
using Monetaris.Template.Models;

namespace Monetaris.Template.Services;

/// <summary>
/// Service interface for Template operations
/// </summary>
public interface ITemplateService
{
    /// <summary>
    /// Get all templates (filtered by user role and tenant access)
    /// </summary>
    Task<Result<List<TemplateDto>>> GetAllAsync(User currentUser);

    /// <summary>
    /// Get a template by ID
    /// </summary>
    Task<Result<TemplateDto>> GetByIdAsync(Guid id);

    /// <summary>
    /// Create a new template (ADMIN/AGENT only)
    /// </summary>
    Task<Result<TemplateDto>> CreateAsync(CreateTemplateRequest request, User currentUser);

    /// <summary>
    /// Update an existing template (ADMIN/AGENT only)
    /// </summary>
    Task<Result<TemplateDto>> UpdateAsync(Guid id, UpdateTemplateRequest request, User currentUser);

    /// <summary>
    /// Delete a template (ADMIN only)
    /// </summary>
    Task<Result> DeleteAsync(Guid id, User currentUser);

    /// <summary>
    /// Render a template with variable replacement
    /// </summary>
    Task<Result<RenderTemplateResponse>> RenderAsync(Guid id, RenderTemplateRequest request, User currentUser);

    /// <summary>
    /// Render a payment template with full IBAN (ADMIN only, with audit logging)
    /// </summary>
    Task<Result<RenderTemplateResponse>> RenderPaymentTemplateAsync(Guid id, RenderTemplateRequest request, User currentUser);
}
