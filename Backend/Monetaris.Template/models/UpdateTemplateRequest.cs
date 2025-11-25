using Monetaris.Shared.Enums;

namespace Monetaris.Template.Models;

/// <summary>
/// Request model for updating an existing template
/// </summary>
public class UpdateTemplateRequest
{
    public string Name { get; set; } = string.Empty;
    public TemplateType Type { get; set; }
    public TemplateCategory Category { get; set; }
    public string? Subject { get; set; }
    public string Content { get; set; } = string.Empty;
}
