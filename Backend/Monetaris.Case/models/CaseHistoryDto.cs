namespace Monetaris.Case.Models;

/// <summary>
/// Case history/audit log entry DTO
/// </summary>
public class CaseHistoryDto
{
    public Guid Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public string Actor { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
