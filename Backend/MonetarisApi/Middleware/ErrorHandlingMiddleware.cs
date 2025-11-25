using Monetaris.Shared.Exceptions;

namespace MonetarisApi.Middleware;

/// <summary>
/// Global error handling middleware for consistent API error responses
/// </summary>
public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found: {Message}", ex.Message);
            context.Response.StatusCode = 404;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new { error = ex.Message });
        }
        catch (Monetaris.Shared.Exceptions.ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error: {Message}", ex.Message);
            context.Response.StatusCode = 400;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                error = "Validation failed",
                errors = ex.Errors
            });
        }
        catch (FluentValidation.ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation error: {Message}", ex.Message);
            context.Response.StatusCode = 400;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                error = "Validation failed",
                errors = ex.Errors.Select(e => new
                {
                    property = e.PropertyName,
                    message = e.ErrorMessage
                })
            });
        }
        catch (UnauthorizedException ex)
        {
            _logger.LogWarning(ex, "Unauthorized: {Message}", ex.Message);
            context.Response.StatusCode = 401;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new { error = ex.Message });
        }
        catch (ForbiddenException ex)
        {
            _logger.LogWarning(ex, "Forbidden: {Message}", ex.Message);
            context.Response.StatusCode = 403;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred");
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new { error = "An internal server error occurred." });
        }
    }
}
