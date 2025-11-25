using Monetaris.Shared.Enums;

namespace Monetaris.Case.Services;

/// <summary>
/// Interface for ZPO-compliant workflow engine
/// </summary>
public interface IWorkflowEngine
{
    /// <summary>
    /// Check if a status transition is valid according to ZPO rules
    /// </summary>
    bool CanTransition(CaseStatus from, CaseStatus to);

    /// <summary>
    /// Calculate the next action date based on new status
    /// </summary>
    DateTime? CalculateNextActionDate(CaseStatus newStatus);

    /// <summary>
    /// Get allowed next statuses from current status
    /// </summary>
    List<CaseStatus> GetAllowedTransitions(CaseStatus currentStatus);
}
