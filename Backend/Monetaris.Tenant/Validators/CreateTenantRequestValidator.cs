using FluentValidation;
using Monetaris.Tenant.DTOs;

namespace Monetaris.Tenant.Validators;

/// <summary>
/// Validator for CreateTenantRequest
/// </summary>
public class CreateTenantRequestValidator : AbstractValidator<CreateTenantRequest>
{
    public CreateTenantRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters");

        RuleFor(x => x.RegistrationNumber)
            .NotEmpty().WithMessage("Registration number is required")
            .MaximumLength(50).WithMessage("Registration number must not exceed 50 characters");

        RuleFor(x => x.ContactEmail)
            .NotEmpty().WithMessage("Contact email is required")
            .EmailAddress().WithMessage("Invalid email format")
            .MaximumLength(255).WithMessage("Email must not exceed 255 characters");

        RuleFor(x => x.BankAccountIBAN)
            .NotEmpty().WithMessage("Bank account IBAN is required")
            .Matches(@"^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$")
            .WithMessage("Invalid IBAN format");
    }
}
