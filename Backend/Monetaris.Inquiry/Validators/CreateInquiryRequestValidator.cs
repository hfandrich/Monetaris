using FluentValidation;
using Monetaris.Inquiry.Models;

namespace Monetaris.Inquiry.Validators;

/// <summary>
/// Validator for CreateInquiryRequest
/// </summary>
public class CreateInquiryRequestValidator : AbstractValidator<CreateInquiryRequest>
{
    public CreateInquiryRequestValidator()
    {
        RuleFor(x => x.CaseId)
            .NotEmpty().WithMessage("Case ID is required");

        RuleFor(x => x.Question)
            .NotEmpty().WithMessage("Question is required")
            .MinimumLength(10).WithMessage("Question must be at least 10 characters")
            .MaximumLength(2000).WithMessage("Question must not exceed 2000 characters");
    }
}
