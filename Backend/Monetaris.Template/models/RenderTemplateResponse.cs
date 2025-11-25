namespace Monetaris.Template.Models;

/// <summary>
/// Response model containing rendered template content
/// </summary>
public class RenderTemplateResponse
{
    public string? RenderedSubject { get; set; }
    public string RenderedContent { get; set; } = string.Empty;
}
