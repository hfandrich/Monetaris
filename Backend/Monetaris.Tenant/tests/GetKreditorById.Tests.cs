using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
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
/// Unit tests for GetKreditorById endpoint
/// </summary>
public class GetKreditorByIdTests
{
    private readonly Mock<IKreditorService> _mockService;
    private readonly Mock<IApplicationDbContext> _mockContext;
    private readonly Mock<ILogger<GetKreditorById>> _mockLogger;
    private readonly GetKreditorById _endpoint;

    public GetKreditorByIdTests()
    {
        _mockService = new Mock<IKreditorService>();
        _mockContext = new Mock<IApplicationDbContext>();
        _mockLogger = new Mock<ILogger<GetKreditorById>>();

        _endpoint = new GetKreditorById(_mockService.Object, _mockContext.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task Handle_ReturnsOkResult_WhenKreditorFound()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var kreditorId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "admin@test.com",
            Role = UserRole.ADMIN
        };

        var kreditor = new KreditorDto
        {
            Id = kreditorId,
            Name = "Test Kreditor",
            RegistrationNumber = "REG001",
            ContactEmail = "test@kreditor.com"
        };

        var result = Result<KreditorDto>.Success(kreditor);

        SetupHttpContext(userId);
        SetupUserDbSet(user);
        _mockService.Setup(s => s.GetByIdAsync(kreditorId, It.IsAny<User>())).ReturnsAsync(result);

        // Act
        var actionResult = await _endpoint.Handle(kreditorId);

        // Assert
        actionResult.Should().BeOfType<OkObjectResult>();
        var okResult = actionResult as OkObjectResult;
        okResult!.Value.Should().BeEquivalentTo(kreditor);

        _mockService.Verify(s => s.GetByIdAsync(kreditorId, It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ReturnsNotFound_WhenKreditorNotFound()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var kreditorId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "admin@test.com",
            Role = UserRole.ADMIN
        };

        var result = Result<KreditorDto>.Failure("Tenant not found");

        SetupHttpContext(userId);
        SetupUserDbSet(user);
        _mockService.Setup(s => s.GetByIdAsync(kreditorId, It.IsAny<User>())).ReturnsAsync(result);

        // Act
        var actionResult = await _endpoint.Handle(kreditorId);

        // Assert
        actionResult.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task Handle_ReturnsForbidden_WhenAccessDenied()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var kreditorId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "client@test.com",
            Role = UserRole.CLIENT,
            TenantId = Guid.NewGuid() // Different tenant
        };

        var result = Result<KreditorDto>.Failure("Access denied");

        SetupHttpContext(userId);
        SetupUserDbSet(user);
        _mockService.Setup(s => s.GetByIdAsync(kreditorId, It.IsAny<User>())).ReturnsAsync(result);

        // Act
        var actionResult = await _endpoint.Handle(kreditorId);

        // Assert
        actionResult.Should().BeOfType<ForbidResult>();
    }

    [Fact]
    public async Task Handle_ReturnsBadRequest_WhenServiceFails()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var kreditorId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "admin@test.com",
            Role = UserRole.ADMIN
        };

        var result = Result<KreditorDto>.Failure("Database error");

        SetupHttpContext(userId);
        SetupUserDbSet(user);
        _mockService.Setup(s => s.GetByIdAsync(kreditorId, It.IsAny<User>())).ReturnsAsync(result);

        // Act
        var actionResult = await _endpoint.Handle(kreditorId);

        // Assert
        actionResult.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task Handle_ReturnsUnauthorized_WhenUserNotFound()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var kreditorId = Guid.NewGuid();

        SetupHttpContext(userId);
        SetupUserDbSet(null);

        // Act
        var actionResult = await _endpoint.Handle(kreditorId);

        // Assert
        actionResult.Should().BeOfType<UnauthorizedResult>();
        _mockService.Verify(s => s.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<User>()), Times.Never);
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
