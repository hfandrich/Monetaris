using FluentValidation;
using Monetaris.Case.Models;

namespace Monetaris.Case.Validators;

/// <summary>
/// Validator for UpdateCaseRequest
/// </summary>
public class UpdateCaseRequestValidator : AbstractValidator<UpdateCaseRequest>
{
    public UpdateCaseRequestValidator()
    {
        RuleFor(x => x.PrincipalAmount)
            .GreaterThan(0).WithMessage("Principal amount must be greater than zero");

        RuleFor(x => x.Costs)
            .GreaterThanOrEqualTo(0).WithMessage("Costs must be zero or positive");

        RuleFor(x => x.Interest)
            .GreaterThanOrEqualTo(0).WithMessage("Interest must be zero or positive");

        RuleFor(x => x.CompetentCourt)
            .NotEmpty().WithMessage("Competent court is required");
    }
}
