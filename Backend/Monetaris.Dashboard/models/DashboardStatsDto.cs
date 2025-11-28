namespace Monetaris.Dashboard.Models;

/// <summary>
/// Dashboard statistics data transfer object
/// </summary>
public class DashboardStatsDto
{
    public decimal TotalVolume { get; set; }
    public int ActiveCases { get; set; }
    public int LegalCases { get; set; }
    public double SuccessRate { get; set; }
    public decimal ProjectedRecovery { get; set; }
    public int TotalDebtors { get; set; }
    public int TotalKreditoren { get; set; }
}
