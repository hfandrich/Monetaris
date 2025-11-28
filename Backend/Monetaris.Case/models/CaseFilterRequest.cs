using Monetaris.Shared.Enums;

namespace Monetaris.Case.Models;

/// <summary>
/// Filter and pagination options for case queries
/// </summary>
public class CaseFilterRequest
{
    public Guid? KreditorId { get; set; }
    public Guid? DebtorId { get; set; }
    public Guid? AgentId { get; set; }
    public CaseStatus? Status { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
