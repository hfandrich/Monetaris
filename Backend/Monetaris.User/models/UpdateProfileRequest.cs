namespace Monetaris.User.Models;

/// <summary>
/// Request model for updating user profile
/// </summary>
public class UpdateProfileRequest
{
    /// <summary>
    /// User's full name
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// User's email address
    /// </summary>
    public string Email { get; set; } = string.Empty;
}
