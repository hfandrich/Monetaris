namespace Monetaris.User.Models;

/// <summary>
/// Request model for password reset initiation
/// </summary>
public class ForgotPasswordRequest
{
    /// <summary>
    /// User's email address
    /// </summary>
    public string Email { get; set; } = string.Empty;
}
