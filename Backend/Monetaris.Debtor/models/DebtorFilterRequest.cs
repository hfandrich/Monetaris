using Monetaris.Shared.Enums;

namespace Monetaris.Debtor.Models;

/// <summary>
/// Filter and pagination options for debtor queries
/// </summary>
public class DebtorFilterRequest
{
    public Guid? TenantId { get; set; }
    public Guid? AgentId { get; set; }
    public RiskScore? RiskScore { get; set; }
    public string? SearchQuery { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
