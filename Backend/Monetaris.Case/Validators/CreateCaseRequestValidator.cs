using FluentValidation;
using Monetaris.Case.Models;

namespace Monetaris.Case.Validators;

/// <summary>
/// Validator for CreateCaseRequest
/// </summary>
public class CreateCaseRequestValidator : AbstractValidator<CreateCaseRequest>
{
    public CreateCaseRequestValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.DebtorId)
            .NotEmpty().WithMessage("Debtor ID is required");

        RuleFor(x => x.InvoiceNumber)
            .NotEmpty().WithMessage("Invoice number is required")
            .MaximumLength(100).WithMessage("Invoice number must not exceed 100 characters");

        RuleFor(x => x.PrincipalAmount)
            .GreaterThan(0).WithMessage("Principal amount must be greater than zero");

        RuleFor(x => x.Costs)
            .GreaterThanOrEqualTo(0).WithMessage("Costs must be zero or positive");

        RuleFor(x => x.Interest)
            .GreaterThanOrEqualTo(0).WithMessage("Interest must be zero or positive");

        RuleFor(x => x.InvoiceDate)
            .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("Invoice date cannot be in the future");

        RuleFor(x => x.DueDate)
            .GreaterThanOrEqualTo(x => x.InvoiceDate).WithMessage("Due date must be after or equal to invoice date");
    }
}
