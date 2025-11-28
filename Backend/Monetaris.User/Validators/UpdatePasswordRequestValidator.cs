using FluentValidation;
using Monetaris.User.Models;

namespace Monetaris.User.Validators;

/// <summary>
/// Validator for UpdatePasswordRequest
/// </summary>
public class UpdatePasswordRequestValidator : AbstractValidator<UpdatePasswordRequest>
{
    public UpdatePasswordRequestValidator()
    {
        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("Aktuelles Passwort ist erforderlich");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("Neues Passwort ist erforderlich")
            .MinimumLength(8).WithMessage("Passwort muss mindestens 8 Zeichen lang sein");
    }
}
