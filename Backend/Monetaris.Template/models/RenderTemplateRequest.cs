namespace Monetaris.Template.Models;

/// <summary>
/// Request model for rendering a template with variable replacement
/// </summary>
public class RenderTemplateRequest
{
    public Guid? CaseId { get; set; }
    public Guid? DebtorId { get; set; }
}
