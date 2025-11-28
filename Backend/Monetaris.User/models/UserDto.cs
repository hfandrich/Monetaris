using Monetaris.Shared.Enums;

namespace Monetaris.User.Models;

/// <summary>
/// User data transfer object (excludes sensitive data like password hash)
/// </summary>
public class UserDto
{
    /// <summary>
    /// User's unique identifier
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// User's full name
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// User's email address
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// User role
    /// </summary>
    public UserRole Role { get; set; }

    /// <summary>
    /// Primary kreditor ID (for CLIENT role)
    /// </summary>
    public Guid? KreditorId { get; set; }

    /// <summary>
    /// List of assigned kreditor IDs (for AGENT role)
    /// </summary>
    public List<Guid>? AssignedKreditorIds { get; set; }

    /// <summary>
    /// Avatar initials for UI display
    /// </summary>
    public string? AvatarInitials { get; set; }
}
