using FluentValidation;
using Monetaris.User.Models;

namespace Monetaris.User.Validators;

/// <summary>
/// Validator for UpdateProfileRequest
/// </summary>
public class UpdateProfileRequestValidator : AbstractValidator<UpdateProfileRequest>
{
    public UpdateProfileRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name ist erforderlich")
            .MaximumLength(200).WithMessage("Name darf maximal 200 Zeichen lang sein");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("E-Mail ist erforderlich")
            .EmailAddress().WithMessage("Ungültige E-Mail-Adresse");
    }
}
