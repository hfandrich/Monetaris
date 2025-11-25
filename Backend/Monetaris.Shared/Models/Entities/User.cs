using Monetaris.Shared.Enums;

namespace Monetaris.Shared.Models.Entities;

/// <summary>
/// User entity with role-based access control
/// </summary>
public class User : BaseEntity
{
    /// <summary>
    /// Full name of the user
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Email address (unique)
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Hashed password
    /// </summary>
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>
    /// User role (ADMIN, AGENT, CLIENT, DEBTOR)
    /// </summary>
    public UserRole Role { get; set; }

    /// <summary>
    /// Primary tenant ID (for CLIENT role)
    /// </summary>
    public Guid? TenantId { get; set; }

    /// <summary>
    /// Avatar initials for display
    /// </summary>
    public string? AvatarInitials { get; set; }

    /// <summary>
    /// Whether the user account is active
    /// </summary>
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    /// <summary>
    /// Primary tenant (for CLIENT users)
    /// </summary>
    public Tenant? Tenant { get; set; }

    /// <summary>
    /// Tenant assignments (for AGENT users who can handle multiple tenants)
    /// </summary>
    public ICollection<UserTenantAssignment> TenantAssignments { get; set; } = new List<UserTenantAssignment>();

    /// <summary>
    /// Refresh tokens for JWT authentication
    /// </summary>
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
