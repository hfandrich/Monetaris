namespace Monetaris.Case.Models;

/// <summary>
/// Request model for batch importing cases from CSV
/// </summary>
public class BatchImportRequest
{
    public Guid KreditorId { get; set; }
    public List<BatchCaseItem> Items { get; set; } = new();
}

/// <summary>
/// Individual case item in batch import
/// </summary>
public class BatchCaseItem
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public string DebtorName { get; set; } = string.Empty;
    public string? DebtorEmail { get; set; }
    public string? DebtorPhone { get; set; }
    public string? DebtorAddress { get; set; }
    public string? DebtorCity { get; set; }
    public string? DebtorPostalCode { get; set; }
    public decimal Amount { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? InvoiceDate { get; set; }
}

/// <summary>
/// Response model for batch import operation
/// </summary>
public class BatchImportResponse
{
    public int TotalProcessed { get; set; }
    public int Created { get; set; }
    public int Skipped { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<Guid> CreatedCaseIds { get; set; } = new();
}
