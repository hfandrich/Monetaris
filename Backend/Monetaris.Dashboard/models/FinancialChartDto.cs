namespace Monetaris.Dashboard.Models;

/// <summary>
/// Financial chart data for monthly revenue visualization
/// </summary>
public class FinancialChartDto
{
    public List<MonthlyDataPoint> MonthlyRevenue { get; set; } = new();
}

/// <summary>
/// Single data point for monthly financial data
/// </summary>
public class MonthlyDataPoint
{
    public string Month { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int CasesResolved { get; set; }
}
