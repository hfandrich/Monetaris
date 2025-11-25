namespace Monetaris.Shared.Enums;

/// <summary>
/// Status of a debtor's address
/// </summary>
public enum AddressStatus
{
    /// <summary>
    /// Address validity unknown
    /// </summary>
    UNKNOWN,

    /// <summary>
    /// Address research pending
    /// </summary>
    RESEARCH_PENDING,

    /// <summary>
    /// Address confirmed as valid
    /// </summary>
    CONFIRMED,

    /// <summary>
    /// Debtor has moved
    /// </summary>
    MOVED,

    /// <summary>
    /// Debtor is deceased
    /// </summary>
    DECEASED
}
