using FluentValidation;
using Monetaris.Shared.Enums;
using Monetaris.User.Models;

namespace Monetaris.User.Validators;

/// <summary>
/// Validator for RegisterRequest
/// </summary>
public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(100).WithMessage("Name cannot exceed 100 characters");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters")
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter")
            .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter")
            .Matches(@"[0-9]").WithMessage("Password must contain at least one digit");

        RuleFor(x => x.Role)
            .IsInEnum().WithMessage("Invalid role");

        RuleFor(x => x.KreditorId)
            .NotEmpty().WithMessage("Kreditor ID is required for CLIENT role")
            .When(x => x.Role == UserRole.CLIENT);
    }
}
