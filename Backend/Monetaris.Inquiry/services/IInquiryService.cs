using Monetaris.Inquiry.Models;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;

namespace Monetaris.Inquiry.Services;

/// <summary>
/// Service interface for Inquiry operations
/// </summary>
public interface IInquiryService
{
    /// <summary>
    /// Get all inquiries accessible to the current user
    /// </summary>
    Task<Result<List<InquiryDto>>> GetAllAsync(User currentUser);

    /// <summary>
    /// Create a new inquiry
    /// </summary>
    Task<Result<InquiryDto>> CreateAsync(CreateInquiryRequest request, User currentUser);

    /// <summary>
    /// Resolve an inquiry
    /// </summary>
    Task<Result<InquiryDto>> ResolveAsync(Guid id, ResolveInquiryRequest request, User currentUser);
}
