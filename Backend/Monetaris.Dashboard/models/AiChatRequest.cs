namespace Monetaris.Dashboard.Models;

/// <summary>
/// Request model for AI chat endpoint
/// </summary>
public class AiChatRequest
{
    /// <summary>
    /// Chat messages history
    /// </summary>
    public List<AiChatMessage> Messages { get; set; } = new();

    /// <summary>
    /// Optional tools/functions available to the AI
    /// </summary>
    public List<AiChatTool>? Tools { get; set; }
}

/// <summary>
/// Individual chat message
/// </summary>
public class AiChatMessage
{
    /// <summary>
    /// Role: user, model, system
    /// </summary>
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// Text content of the message
    /// </summary>
    public string Text { get; set; } = string.Empty;
}

/// <summary>
/// AI tool/function definition
/// </summary>
public class AiChatTool
{
    /// <summary>
    /// Function declaration
    /// </summary>
    public AiFunctionDeclaration? FunctionDeclaration { get; set; }
}

/// <summary>
/// Function declaration with parameters
/// </summary>
public class AiFunctionDeclaration
{
    /// <summary>
    /// Function name
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Function description
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// JSON schema for parameters
    /// </summary>
    public object? Parameters { get; set; }
}
