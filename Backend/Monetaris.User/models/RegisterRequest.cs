using Monetaris.Shared.Enums;

namespace Monetaris.User.Models;

/// <summary>
/// Request model for user registration
/// </summary>
public class RegisterRequest
{
    /// <summary>
    /// User's full name
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// User's email address (must be unique)
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// User's password
    /// </summary>
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// User role (ADMIN, AGENT, CLIENT, DEBTOR)
    /// </summary>
    public UserRole Role { get; set; }

    /// <summary>
    /// Primary tenant ID (required for CLIENT role)
    /// </summary>
    public Guid? TenantId { get; set; }
}
