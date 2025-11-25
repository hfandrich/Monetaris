namespace Monetaris.Shared.Enums;

/// <summary>
/// User roles in the system
/// </summary>
public enum UserRole
{
    /// <summary>
    /// System Administrator with full access
    /// </summary>
    ADMIN,

    /// <summary>
    /// Sachbearbeiter (Inkasso-Spezialist) - Case handler
    /// </summary>
    AGENT,

    /// <summary>
    /// Mandant (Gläubiger) - Client/Creditor
    /// </summary>
    CLIENT,

    /// <summary>
    /// Schuldner (Endkunde) - Debtor
    /// </summary>
    DEBTOR
}
