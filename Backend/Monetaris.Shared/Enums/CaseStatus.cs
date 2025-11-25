namespace Monetaris.Shared.Enums;

/// <summary>
/// Legal workflow status model (ZPO-compliant)
/// </summary>
public enum CaseStatus
{
    // 1. Vorgerichtlich (Pre-Court Phase)
    /// <summary>
    /// Draft case, not yet started
    /// </summary>
    DRAFT,

    /// <summary>
    /// New case received
    /// </summary>
    NEW,

    /// <summary>
    /// First reminder sent
    /// </summary>
    REMINDER_1,

    /// <summary>
    /// Second reminder sent (final warning)
    /// </summary>
    REMINDER_2,

    /// <summary>
    /// Address research in progress (EMA request active)
    /// </summary>
    ADDRESS_RESEARCH,

    // 2. Gerichtliches Mahnverfahren (Court Dunning Procedure)
    /// <summary>
    /// Ready for court dunning order (Mahnbescheid)
    /// </summary>
    PREPARE_MB,

    /// <summary>
    /// Dunning order requested at court
    /// </summary>
    MB_REQUESTED,

    /// <summary>
    /// Dunning order issued and delivered
    /// </summary>
    MB_ISSUED,

    /// <summary>
    /// Objection filed (disputed procedure)
    /// </summary>
    MB_OBJECTION,

    // 3. Vollstreckungsbescheid (Enforcement Order)
    /// <summary>
    /// 2-week deadline expired, ready for enforcement order
    /// </summary>
    PREPARE_VB,

    /// <summary>
    /// Enforcement order requested
    /// </summary>
    VB_REQUESTED,

    /// <summary>
    /// Enforcement order issued (title obtained)
    /// </summary>
    VB_ISSUED,

    /// <summary>
    /// Legally binding title obtained
    /// </summary>
    TITLE_OBTAINED,

    // 4. Zwangsvollstreckung (Enforcement)
    /// <summary>
    /// Preparing bailiff mandate
    /// </summary>
    ENFORCEMENT_PREP,

    /// <summary>
    /// Bailiff (Gerichtsvollzieher) mandated
    /// </summary>
    GV_MANDATED,

    /// <summary>
    /// Statement of assets provided (Vermögensauskunft)
    /// </summary>
    EV_TAKEN,

    // 5. Abschluss (Closure)
    /// <summary>
    /// Paid in full
    /// </summary>
    PAID,

    /// <summary>
    /// Settlement reached
    /// </summary>
    SETTLED,

    /// <summary>
    /// Insolvency proceedings
    /// </summary>
    INSOLVENCY,

    /// <summary>
    /// Uncollectible (case closed)
    /// </summary>
    UNCOLLECTIBLE
}
