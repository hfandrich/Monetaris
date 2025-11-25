namespace Monetaris.Shared.Exceptions;

/// <summary>
/// Exception thrown when an unauthorized action is attempted
/// </summary>
public class UnauthorizedException : Exception
{
    public UnauthorizedException(string message) : base(message)
    {
    }

    public UnauthorizedException() : base("Unauthorized access.")
    {
    }
}
