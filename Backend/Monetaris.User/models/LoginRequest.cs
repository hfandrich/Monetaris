namespace Monetaris.User.Models;

/// <summary>
/// Request model for standard email/password login
/// </summary>
public class LoginRequest
{
    /// <summary>
    /// User's email address
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// User's password
    /// </summary>
    public string Password { get; set; } = string.Empty;
}
