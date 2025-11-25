namespace Monetaris.Inquiry.Models;

/// <summary>
/// Request model for creating a new inquiry
/// </summary>
public class CreateInquiryRequest
{
    public Guid CaseId { get; set; }
    public string Question { get; set; } = string.Empty;
}
