namespace Monetaris.Shared.Helpers;

/// <summary>
/// Helper class for masking sensitive data in DTOs and logs
/// </summary>
public static class SensitiveDataHelper
{
    /// <summary>
    /// Masks IBAN by showing only country code and last 5 characters
    /// </summary>
    /// <param name="iban">The IBAN to mask</param>
    /// <returns>Masked IBAN (e.g., "DE** **** **** **34 56")</returns>
    public static string MaskIBAN(string? iban)
    {
        if (string.IsNullOrWhiteSpace(iban))
        {
            return string.Empty;
        }

        // Remove spaces and format
        var cleanIban = iban.Replace(" ", "").Trim();

        // IBAN must be at least 15 characters (shortest valid IBAN)
        if (cleanIban.Length < 15)
        {
            return "****";
        }

        // Show country code (first 2 chars) + last 5 digits
        var countryCode = cleanIban.Substring(0, 2);
        var lastFive = cleanIban.Substring(cleanIban.Length - 5);

        return $"{countryCode}** **** **** **{lastFive}";
    }

    /// <summary>
    /// Masks email address by showing only first 2 characters and domain
    /// </summary>
    /// <param name="email">The email to mask</param>
    /// <returns>Masked email (e.g., "jo***@example.com")</returns>
    public static string MaskEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return string.Empty;
        }

        var parts = email.Split('@');
        if (parts.Length != 2)
        {
            return "****@****";
        }

        var localPart = parts[0];
        var domain = parts[1];

        var maskedLocal = localPart.Length > 2
            ? localPart.Substring(0, 2) + "***"
            : "***";

        return $"{maskedLocal}@{domain}";
    }

    /// <summary>
    /// Checks if the full IBAN should be visible to the user
    /// Only ADMIN users can see full IBANs
    /// </summary>
    /// <param name="userRole">The user's role</param>
    /// <returns>True if the user can see full IBAN</returns>
    public static bool CanViewFullIBAN(Enums.UserRole userRole)
    {
        return userRole == Enums.UserRole.ADMIN;
    }
}
