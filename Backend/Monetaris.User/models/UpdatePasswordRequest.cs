namespace Monetaris.User.Models;

/// <summary>
/// Request model for updating user password
/// </summary>
public class UpdatePasswordRequest
{
    /// <summary>
    /// User's current password for verification
    /// </summary>
    public string CurrentPassword { get; set; } = string.Empty;

    /// <summary>
    /// New password to set
    /// </summary>
    public string NewPassword { get; set; } = string.Empty;
}
