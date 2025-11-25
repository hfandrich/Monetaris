namespace Monetaris.Shared.Models.Entities;

/// <summary>
/// Many-to-many relationship: Agents can handle multiple tenants
/// </summary>
public class UserTenantAssignment
{
    /// <summary>
    /// User (Agent) ID
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Tenant ID
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// When the assignment was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    /// <summary>
    /// The user (agent)
    /// </summary>
    public User User { get; set; } = null!;

    /// <summary>
    /// The tenant
    /// </summary>
    public Tenant Tenant { get; set; } = null!;
}
