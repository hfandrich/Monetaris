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
    /// Primary kreditor ID (for CLIENT role)
    /// </summary>
    public Guid? KreditorId { get; set; }

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
    /// Primary kreditor (for CLIENT users)
    /// </summary>
    public Kreditor? Kreditor { get; set; }

    /// <summary>
    /// Kreditor assignments (for AGENT users who can handle multiple kreditoren)
    /// </summary>
    public ICollection<UserKreditorAssignment> KreditorAssignments { get; set; } = new List<UserKreditorAssignment>();

    /// <summary>
    /// Refresh tokens for JWT authentication
    /// </summary>
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
