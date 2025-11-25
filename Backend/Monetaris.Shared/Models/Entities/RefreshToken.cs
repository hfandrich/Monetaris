namespace Monetaris.Shared.Models.Entities;

/// <summary>
/// JWT refresh token for authentication
/// </summary>
public class RefreshToken : BaseEntity
{
    /// <summary>
    /// User ID this token belongs to
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// The actual token string
    /// </summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// When the token expires
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// When the token was revoked (if applicable)
    /// </summary>
    public DateTime? RevokedAt { get; set; }

    // Navigation Properties
    /// <summary>
    /// The user this token belongs to
    /// </summary>
    public User User { get; set; } = null!;
}
