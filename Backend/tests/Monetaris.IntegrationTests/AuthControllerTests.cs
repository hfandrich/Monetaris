using System.Net;
using System.Net.Http.Json;
using Monetaris.IntegrationTests.Infrastructure;
using Monetaris.User.Models;

namespace Monetaris.IntegrationTests;

/// <summary>
/// Integration tests for the Auth Controller
/// Tests authentication endpoints with seeded database
/// </summary>
public class AuthControllerTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthControllerTests(TestWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Login_WithValidAdminCredentials_ReturnsToken()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "admin@monetaris.com",
            Password = "admin123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", request);

        // Assert
        response.EnsureSuccessStatusCode();
        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(authResponse);
        Assert.NotEmpty(authResponse.AccessToken);
        Assert.NotEmpty(authResponse.RefreshToken);
        Assert.NotNull(authResponse.User);
        Assert.Equal("admin@monetaris.com", authResponse.User.Email);
    }

    [Fact]
    public async Task Login_WithValidAgentCredentials_ReturnsToken()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "max@monetaris.com",
            Password = "max123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", request);

        // Assert
        response.EnsureSuccessStatusCode();
        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(authResponse);
        Assert.NotEmpty(authResponse.AccessToken);
        Assert.Equal("max@monetaris.com", authResponse.User.Email);
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ReturnsUnauthorized()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "admin@monetaris.com",
            Password = "wrongpassword"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", request);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithNonExistentEmail_ReturnsUnauthorized()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "nonexistent@example.com",
            Password = "password123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", request);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithEmptyCredentials_ReturnsBadRequest()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "",
            Password = ""
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithClientCredentials_ReturnsToken()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "client@techsolutions.de",
            Password = "client123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", request);

        // Assert
        response.EnsureSuccessStatusCode();
        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(authResponse);
        Assert.NotEmpty(authResponse.AccessToken);
        Assert.Equal("client@techsolutions.de", authResponse.User.Email);
    }
}
