using FluentValidation;
using Monetaris.Debtor.Models;

namespace Monetaris.Debtor.Validators;

/// <summary>
/// Validator for CreateDebtorRequest
/// </summary>
public class CreateDebtorRequestValidator : AbstractValidator<CreateDebtorRequest>
{
    public CreateDebtorRequestValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        // Company validation
        When(x => x.IsCompany, () =>
        {
            RuleFor(x => x.CompanyName)
                .NotEmpty().WithMessage("Company name is required for companies")
                .MaximumLength(200).WithMessage("Company name must not exceed 200 characters");
        });

        // Person validation
        When(x => !x.IsCompany, () =>
        {
            RuleFor(x => x.FirstName)
                .NotEmpty().WithMessage("First name is required for individuals")
                .MaximumLength(100).WithMessage("First name must not exceed 100 characters");

            RuleFor(x => x.LastName)
                .NotEmpty().WithMessage("Last name is required for individuals")
                .MaximumLength(100).WithMessage("Last name must not exceed 100 characters");
        });

        // Optional email validation
        When(x => !string.IsNullOrEmpty(x.Email), () =>
        {
            RuleFor(x => x.Email)
                .EmailAddress().WithMessage("Invalid email format")
                .MaximumLength(255).WithMessage("Email must not exceed 255 characters");
        });

        RuleFor(x => x.Country)
            .NotEmpty().WithMessage("Country is required")
            .MaximumLength(100).WithMessage("Country must not exceed 100 characters");
    }
}
