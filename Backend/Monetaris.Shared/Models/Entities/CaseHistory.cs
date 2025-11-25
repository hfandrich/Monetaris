namespace Monetaris.Shared.Models.Entities;

/// <summary>
/// Audit log entry for case history tracking
/// </summary>
public class CaseHistory : BaseEntity
{
    /// <summary>
    /// Case this history entry belongs to
    /// </summary>
    public Guid CaseId { get; set; }

    /// <summary>
    /// Type of action performed
    /// </summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>
    /// Detailed description of the change
    /// </summary>
    public string Details { get; set; } = string.Empty;

    /// <summary>
    /// Who performed the action (user name or system)
    /// </summary>
    public string Actor { get; set; } = string.Empty;

    // Navigation Properties
    /// <summary>
    /// The case this history entry belongs to
    /// </summary>
    public Case Case { get; set; } = null!;
}
