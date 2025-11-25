using FluentValidation;
using Monetaris.Template.Models;

namespace Monetaris.Template.Validators;

/// <summary>
/// Validator for CreateTemplateRequest
/// </summary>
public class CreateTemplateRequestValidator : AbstractValidator<CreateTemplateRequest>
{
    public CreateTemplateRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters");

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Content is required")
            .MinimumLength(10).WithMessage("Content must be at least 10 characters");
    }
}
