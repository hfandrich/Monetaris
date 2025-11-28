namespace Monetaris.User.Models;

/// <summary>
/// Response model for password reset request
/// Always returns success for security (don't reveal if email exists)
/// </summary>
public class ForgotPasswordResponse
{
    /// <summary>
    /// Success message to display to user
    /// </summary>
    public string Message { get; set; } = "If an account with that email exists, a password reset link has been sent.";

    /// <summary>
    /// Indicates if the response is successful
    /// </summary>
    public bool Success { get; set; } = true;
}
