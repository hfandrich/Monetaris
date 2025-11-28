namespace Monetaris.Dashboard.Models;

/// <summary>
/// Response model for AI chat endpoint
/// </summary>
public class AiChatResponse
{
    /// <summary>
    /// Response text from AI
    /// </summary>
    public string Text { get; set; } = string.Empty;

    /// <summary>
    /// Tool/function calls requested by AI (if any)
    /// </summary>
    public List<AiToolCall>? ToolCalls { get; set; }
}

/// <summary>
/// Tool/function call from AI
/// </summary>
public class AiToolCall
{
    /// <summary>
    /// Function name
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Function arguments as JSON
    /// </summary>
    public object? Arguments { get; set; }
}
