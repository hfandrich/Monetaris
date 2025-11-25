namespace Monetaris.User.Models;

/// <summary>
/// Request model for refreshing access token
/// </summary>
public class RefreshTokenRequest
{
    /// <summary>
    /// The refresh token to exchange for a new access token
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;
}
