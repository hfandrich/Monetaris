using FluentValidation;
using Monetaris.User.Models;

namespace Monetaris.User.Validators;

/// <summary>
/// Validator for ForgotPasswordRequest
/// </summary>
public class ForgotPasswordRequestValidator : AbstractValidator<ForgotPasswordRequest>
{
    public ForgotPasswordRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email ist erforderlich")
            .EmailAddress().WithMessage("Ungültiges E-Mail-Format")
            .MaximumLength(255).WithMessage("E-Mail darf maximal 255 Zeichen lang sein");
    }
}
