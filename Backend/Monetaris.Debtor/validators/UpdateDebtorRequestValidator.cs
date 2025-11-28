using FluentValidation;
using Monetaris.Debtor.Models;
using Monetaris.Shared.Enums;

namespace Monetaris.Debtor.Validators;

/// <summary>
/// Validator for UpdateDebtorRequest
/// </summary>
public class UpdateDebtorRequestValidator : AbstractValidator<UpdateDebtorRequest>
{
    public UpdateDebtorRequestValidator()
    {
        // Company/Legal Entity validation
        When(x => x.EntityType == EntityType.LEGAL_ENTITY || x.EntityType == EntityType.PARTNERSHIP, () =>
        {
            RuleFor(x => x.CompanyName)
                .NotEmpty().WithMessage("Company name is required for legal entities and partnerships")
                .MaximumLength(200).WithMessage("Company name must not exceed 200 characters");
        });

        // Natural Person validation
        When(x => x.EntityType == EntityType.NATURAL_PERSON, () =>
        {
            RuleFor(x => x.FirstName)
                .NotEmpty().When(x => string.IsNullOrEmpty(x.LastName))
                .WithMessage("First name or last name is required for natural persons")
                .MaximumLength(100).WithMessage("First name must not exceed 100 characters");

            RuleFor(x => x.LastName)
                .NotEmpty().When(x => string.IsNullOrEmpty(x.FirstName))
                .WithMessage("Last name or first name is required for natural persons")
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
