using Monetaris.Shared.Enums;

namespace Monetaris.Shared.Models.Entities;

/// <summary>
/// Communication template for emails, letters, and SMS
/// </summary>
public class Template : BaseEntity
{
    /// <summary>
    /// Kreditor ID (null for global/system templates)
    /// </summary>
    public Guid? KreditorId { get; set; }

    /// <summary>
    /// Template name
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Type of template (EMAIL, LETTER, SMS)
    /// </summary>
    public TemplateType Type { get; set; }

    /// <summary>
    /// Category (REMINDER, LEGAL, PAYMENT, GENERAL)
    /// </summary>
    public TemplateCategory Category { get; set; }

    /// <summary>
    /// Subject line (for emails)
    /// </summary>
    public string? Subject { get; set; }

    /// <summary>
    /// Template content with placeholders
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// When the template was last modified
    /// </summary>
    public DateTime LastModified { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    /// <summary>
    /// The kreditor this template belongs to (null for global templates)
    /// </summary>
    public Kreditor? Kreditor { get; set; }
}
