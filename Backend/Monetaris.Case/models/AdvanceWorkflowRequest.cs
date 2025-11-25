using Monetaris.Shared.Enums;

namespace Monetaris.Case.Models;

/// <summary>
/// Request model for advancing case workflow status
/// </summary>
public class AdvanceWorkflowRequest
{
    public CaseStatus NewStatus { get; set; }
    public string? Note { get; set; }
}
