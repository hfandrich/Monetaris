namespace Monetaris.User.Models;

/// <summary>
/// Response model for successful authentication
/// Contains JWT tokens and user information
/// </summary>
public class AuthResponse
{
    /// <summary>
    /// JWT access token for API authentication
    /// </summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>
    /// Refresh token for obtaining new access tokens
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;

    /// <summary>
    /// Token expiration time in seconds
    /// </summary>
    public int ExpiresIn { get; set; }

    /// <summary>
    /// Authenticated user details
    /// </summary>
    public UserDto User { get; set; } = null!;
}
