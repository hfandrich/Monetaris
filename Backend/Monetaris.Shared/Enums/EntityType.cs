namespace Monetaris.Shared.Enums;

/// <summary>
/// Type of legal entity per German law (Natürliche/Juristische Person)
/// </summary>
public enum EntityType
{
    /// <summary>
    /// Natürliche Person (Natural Person)
    /// </summary>
    NATURAL_PERSON,

    /// <summary>
    /// Juristische Person (Legal Entity like GmbH, AG)
    /// </summary>
    LEGAL_ENTITY,

    /// <summary>
    /// Personengesellschaft (Partnership like OHG, KG, GbR)
    /// </summary>
    PARTNERSHIP
}
