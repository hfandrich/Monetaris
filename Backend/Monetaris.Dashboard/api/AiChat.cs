using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Monetaris.Dashboard.Models;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Monetaris.Dashboard.Api;

/// <summary>
/// Proxy endpoint for Google Gemini AI chat requests
/// Securely handles API key on backend, preventing frontend exposure
/// </summary>
[ApiController]
[Route("api/ai")]
[Authorize]
public class AiChat : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AiChat> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;

    // Rate limiting: 10 requests per minute per user
    private static readonly Dictionary<string, Queue<DateTime>> _rateLimitCache = new();
    private static readonly SemaphoreSlim _rateLimitLock = new(1, 1);
    private const int MaxRequestsPerMinute = 10;

    public AiChat(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<AiChat> logger,
        IHttpContextAccessor httpContextAccessor)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
    }

    /// <summary>
    /// Send a chat message to Google Gemini AI
    /// </summary>
    /// <param name="request">Chat request with messages and optional tools</param>
    /// <returns>AI response with text and optional tool calls</returns>
    /// <response code="200">AI response generated successfully</response>
    /// <response code="400">Invalid request</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="429">Rate limit exceeded</response>
    /// <response code="503">External AI service unavailable</response>
    [HttpPost("chat")]
    [ProducesResponseType(typeof(AiChatResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status429TooManyRequests)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> Handle([FromBody] AiChatRequest request)
    {
        var userId = User.Identity?.Name ?? "anonymous";
        _logger.LogInformation("AI chat request received from user {UserId}", userId);

        // Validate request
        if (request.Messages == null || request.Messages.Count == 0)
        {
            _logger.LogWarning("Empty messages in AI chat request from user {UserId}", userId);
            return BadRequest(new { error = "Messages array cannot be empty" });
        }

        // Check rate limit
        if (!await CheckRateLimitAsync(userId))
        {
            _logger.LogWarning("Rate limit exceeded for user {UserId}", userId);
            return StatusCode(StatusCodes.Status429TooManyRequests,
                new { error = "Rate limit exceeded. Maximum 10 requests per minute." });
        }

        // Get API key from environment/configuration
        var apiKey = _configuration["GeminiApiKey"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");

        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogError("GEMINI_API_KEY not configured");
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { error = "AI service is not configured" });
        }

        try
        {
            // Forward request to Gemini API
            var response = await ForwardToGeminiAsync(request, apiKey);

            _logger.LogInformation("AI chat response generated successfully for user {UserId}", userId);
            return Ok(response);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Failed to connect to Gemini API for user {UserId}", userId);
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { error = "AI service temporarily unavailable" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing AI chat request for user {UserId}", userId);
            return StatusCode(StatusCodes.Status500InternalServerError,
                new { error = "An error occurred processing your request" });
        }
    }

    /// <summary>
    /// Check rate limit for user (10 requests per minute)
    /// </summary>
    private async Task<bool> CheckRateLimitAsync(string userId)
    {
        await _rateLimitLock.WaitAsync();
        try
        {
            var now = DateTime.UtcNow;
            var oneMinuteAgo = now.AddMinutes(-1);

            if (!_rateLimitCache.ContainsKey(userId))
            {
                _rateLimitCache[userId] = new Queue<DateTime>();
            }

            var userQueue = _rateLimitCache[userId];

            // Remove old requests outside the 1-minute window
            while (userQueue.Count > 0 && userQueue.Peek() < oneMinuteAgo)
            {
                userQueue.Dequeue();
            }

            // Check if limit exceeded
            if (userQueue.Count >= MaxRequestsPerMinute)
            {
                return false;
            }

            // Add current request
            userQueue.Enqueue(now);
            return true;
        }
        finally
        {
            _rateLimitLock.Release();
        }
    }

    /// <summary>
    /// Forward request to Google Gemini API
    /// </summary>
    private async Task<AiChatResponse> ForwardToGeminiAsync(AiChatRequest request, string apiKey)
    {
        var client = _httpClientFactory.CreateClient();

        // Construct Gemini API URL
        var model = "gemini-1.5-flash-latest";
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

        // Transform request to Gemini format
        var geminiRequest = new
        {
            contents = request.Messages.Select(m => new
            {
                role = m.Role,
                parts = new[] { new { text = m.Text } }
            }).ToArray(),
            tools = request.Tools?.Select(t => new
            {
                functionDeclarations = new[]
                {
                    new
                    {
                        name = t.FunctionDeclaration?.Name,
                        description = t.FunctionDeclaration?.Description,
                        parameters = t.FunctionDeclaration?.Parameters
                    }
                }
            }).ToArray()
        };

        var json = JsonSerializer.Serialize(geminiRequest, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        });

        var httpContent = new StringContent(json, Encoding.UTF8, "application/json");

        // Make request to Gemini
        var httpResponse = await client.PostAsync(url, httpContent);
        httpResponse.EnsureSuccessStatusCode();

        var responseJson = await httpResponse.Content.ReadAsStringAsync();
        var geminiResponse = JsonSerializer.Deserialize<JsonElement>(responseJson);

        // Extract response text and tool calls
        var response = new AiChatResponse();

        if (geminiResponse.TryGetProperty("candidates", out var candidates) &&
            candidates.GetArrayLength() > 0)
        {
            var firstCandidate = candidates[0];

            if (firstCandidate.TryGetProperty("content", out var content) &&
                content.TryGetProperty("parts", out var parts) &&
                parts.GetArrayLength() > 0)
            {
                var firstPart = parts[0];

                // Extract text
                if (firstPart.TryGetProperty("text", out var text))
                {
                    response.Text = text.GetString() ?? string.Empty;
                }

                // Extract function calls
                if (firstPart.TryGetProperty("functionCall", out var functionCall))
                {
                    response.ToolCalls = new List<AiToolCall>
                    {
                        new AiToolCall
                        {
                            Name = functionCall.GetProperty("name").GetString() ?? string.Empty,
                            Arguments = functionCall.GetProperty("args")
                        }
                    };
                }
            }
        }

        return response;
    }
}
