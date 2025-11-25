using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Monetaris.Kreditor.Api;
using Monetaris.Kreditor.Services;
using Monetaris.Kreditor.Models;
using Monetaris.Shared.Models;
using Monetaris.Shared.Models.Entities;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Enums;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace Monetaris.Kreditor.Tests;

/// <summary>
/// Unit tests for GetAllKreditoren endpoint
/// </summary>
public class GetAllKreditorenTests
{
    private readonly Mock<IKreditorService> _mockService;
    private readonly Mock<IApplicationDbContext> _mockContext;
    private readonly Mock<ILogger<GetAllKreditoren>> _mockLogger;
    private readonly GetAllKreditoren _endpoint;
    private readonly Mock<DbSet<User>> _mockUserDbSet;

    public GetAllKreditorenTests()
    {
        _mockService = new Mock<IKreditorService>();
        _mockContext = new Mock<IApplicationDbContext>();
        _mockLogger = new Mock<ILogger<GetAllKreditoren>>();
        _mockUserDbSet = new Mock<DbSet<User>>();

        _endpoint = new GetAllKreditoren(_mockService.Object, _mockContext.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task Handle_ReturnsOkResult_WhenSuccessful()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "admin@test.com",
            Role = UserRole.ADMIN
        };

        var kreditoren = new List<KreditorDto>
        {
            new() { Id = Guid.NewGuid(), Name = "Test Kreditor 1", RegistrationNumber = "REG001" },
            new() { Id = Guid.NewGuid(), Name = "Test Kreditor 2", RegistrationNumber = "REG002" }
        };

        var result = Result<List<KreditorDto>>.Success(kreditoren);

        SetupHttpContext(userId);
        SetupUserDbSet(user);
        _mockService.Setup(s => s.GetAllAsync(It.IsAny<User>())).ReturnsAsync(result);

        // Act
        var actionResult = await _endpoint.Handle();

        // Assert
        actionResult.Should().BeOfType<OkObjectResult>();
        var okResult = actionResult as OkObjectResult;
        okResult!.Value.Should().BeEquivalentTo(kreditoren);

        _mockService.Verify(s => s.GetAllAsync(It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ReturnsBadRequest_WhenServiceFails()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "admin@test.com",
            Role = UserRole.ADMIN
        };

        var result = Result<List<KreditorDto>>.Failure("Database error");

        SetupHttpContext(userId);
        SetupUserDbSet(user);
        _mockService.Setup(s => s.GetAllAsync(It.IsAny<User>())).ReturnsAsync(result);

        // Act
        var actionResult = await _endpoint.Handle();

        // Assert
        actionResult.Should().BeOfType<BadRequestObjectResult>();
        var badRequestResult = actionResult as BadRequestObjectResult;
        badRequestResult!.Value.Should().NotBeNull();
    }

    [Fact]
    public async Task Handle_ReturnsUnauthorized_WhenUserNotFound()
    {
        // Arrange
        var userId = Guid.NewGuid();

        SetupHttpContext(userId);
        SetupUserDbSet(null);

        // Act
        var actionResult = await _endpoint.Handle();

        // Assert
        actionResult.Should().BeOfType<UnauthorizedResult>();
        _mockService.Verify(s => s.GetAllAsync(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ReturnsUnauthorized_WhenNoUserIdClaim()
    {
        // Arrange
        var httpContext = new DefaultHttpContext();
        httpContext.User = new ClaimsPrincipal(new ClaimsIdentity());
        _endpoint.ControllerContext = new ControllerContext { HttpContext = httpContext };

        // Act
        var actionResult = await _endpoint.Handle();

        // Assert
        actionResult.Should().BeOfType<UnauthorizedResult>();
        _mockService.Verify(s => s.GetAllAsync(It.IsAny<User>()), Times.Never);
    }

    private void SetupHttpContext(Guid userId)
    {
        var claims = new List<Claim> { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) };
        var identity = new ClaimsIdentity(claims, "Test");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        var httpContext = new DefaultHttpContext { User = claimsPrincipal };
        _endpoint.ControllerContext = new ControllerContext { HttpContext = httpContext };
    }

    private void SetupUserDbSet(User? user)
    {
        _mockContext.Setup(c => c.Users.FindAsync(It.IsAny<Guid>()))
            .ReturnsAsync(user);
    }
}
