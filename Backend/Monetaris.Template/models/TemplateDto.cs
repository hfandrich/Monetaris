using Monetaris.Shared.Enums;

namespace Monetaris.Template.Models;

/// <summary>
/// Template data transfer object
/// </summary>
public class TemplateDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public TemplateType Type { get; set; }
    public TemplateCategory Category { get; set; }
    public string? Subject { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime LastModified { get; set; }
    public DateTime CreatedAt { get; set; }
}
