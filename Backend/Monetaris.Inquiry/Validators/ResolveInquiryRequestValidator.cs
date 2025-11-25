using FluentValidation;
using Monetaris.Inquiry.Models;

namespace Monetaris.Inquiry.Validators;

/// <summary>
/// Validator for ResolveInquiryRequest
/// </summary>
public class ResolveInquiryRequestValidator : AbstractValidator<ResolveInquiryRequest>
{
    public ResolveInquiryRequestValidator()
    {
        RuleFor(x => x.Answer)
            .NotEmpty().WithMessage("Answer is required")
            .MinimumLength(10).WithMessage("Answer must be at least 10 characters")
            .MaximumLength(2000).WithMessage("Answer must not exceed 2000 characters");
    }
}
