namespace Monetaris.Dashboard.Models;

/// <summary>
/// Global search result item
/// </summary>
public class SearchResultDto
{
    public string Type { get; set; } = string.Empty; // "case", "debtor", "tenant"
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public string? AdditionalInfo { get; set; }
}
