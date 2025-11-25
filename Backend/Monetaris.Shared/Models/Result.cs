namespace Monetaris.Shared.Models;

/// <summary>
/// Result pattern implementation for clean API responses
/// </summary>
/// <typeparam name="T">The type of data returned on success</typeparam>
public class Result<T>
{
    public bool IsSuccess { get; private set; }
    public T? Data { get; private set; }
    public string? ErrorMessage { get; private set; }
    public List<string>? Errors { get; private set; }

    private Result(bool isSuccess, T? data, string? errorMessage, List<string>? errors)
    {
        IsSuccess = isSuccess;
        Data = data;
        ErrorMessage = errorMessage;
        Errors = errors;
    }

    /// <summary>
    /// Creates a successful result with data
    /// </summary>
    public static Result<T> Success(T data)
    {
        return new Result<T>(true, data, null, null);
    }

    /// <summary>
    /// Creates a failed result with a single error message
    /// </summary>
    public static Result<T> Failure(string errorMessage)
    {
        return new Result<T>(false, default, errorMessage, null);
    }

    /// <summary>
    /// Creates a failed result with multiple error messages
    /// </summary>
    public static Result<T> Failure(List<string> errors)
    {
        return new Result<T>(false, default, null, errors);
    }
}

/// <summary>
/// Result pattern for operations that don't return data
/// </summary>
public class Result
{
    public bool IsSuccess { get; private set; }
    public string? ErrorMessage { get; private set; }
    public List<string>? Errors { get; private set; }

    private Result(bool isSuccess, string? errorMessage, List<string>? errors)
    {
        IsSuccess = isSuccess;
        ErrorMessage = errorMessage;
        Errors = errors;
    }

    /// <summary>
    /// Creates a successful result
    /// </summary>
    public static Result Success()
    {
        return new Result(true, null, null);
    }

    /// <summary>
    /// Creates a failed result with a single error message
    /// </summary>
    public static Result Failure(string errorMessage)
    {
        return new Result(false, errorMessage, null);
    }

    /// <summary>
    /// Creates a failed result with multiple error messages
    /// </summary>
    public static Result Failure(List<string> errors)
    {
        return new Result(false, null, errors);
    }
}
