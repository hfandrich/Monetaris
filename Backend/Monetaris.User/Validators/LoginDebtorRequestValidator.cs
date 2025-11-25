using FluentValidation;
using Monetaris.User.Models;

namespace Monetaris.User.Validators;

/// <summary>
/// Validator for LoginDebtorRequest (magic link login)
/// </summary>
public class LoginDebtorRequestValidator : AbstractValidator<LoginDebtorRequest>
{
    public LoginDebtorRequestValidator()
    {
        RuleFor(x => x.InvoiceNumber)
            .NotEmpty().WithMessage("Invoice number is required");

        RuleFor(x => x.ZipCode)
            .NotEmpty().WithMessage("Zip code is required")
            .Matches(@"^\d{5}$").WithMessage("Zip code must be 5 digits");
    }
}
