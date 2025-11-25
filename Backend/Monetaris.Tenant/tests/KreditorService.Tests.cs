using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.Extensions.Logging;
using Monetaris.Kreditor.Services;
using Monetaris.Kreditor.Models;
using Monetaris.Shared.Models.Entities;
using Monetaris.Shared.Enums;
using Monetaris.Shared.Interfaces;
using TenantEntity = Monetaris.Shared.Models.Entities.Tenant;

namespace Monetaris.Kreditor.Tests;

/// <summary>
/// Unit tests for KreditorService
/// Uses mocked IApplicationDbContext for isolated unit testing
/// </summary>
public class KreditorServiceTests
{
    private readonly Mock<IApplicationDbContext> _mockContext;
    private readonly Mock<ILogger<KreditorService>> _mockLogger;
    private readonly KreditorService _service;
    private readonly Guid _testTenantId;
    private readonly Guid _testTenant2Id;
    private readonly Guid _adminUserId;
    private readonly Guid _agentUserId;
    private readonly Guid _clientUserId;

    public KreditorServiceTests()
    {
        _mockContext = new Mock<IApplicationDbContext>();
        _mockLogger = new Mock<ILogger<KreditorService>>();
        _service = new KreditorService(_mockContext.Object, _mockLogger.Object);

        // Initialize test IDs
        _testTenantId = Guid.NewGuid();
        _testTenant2Id = Guid.NewGuid();
        _adminUserId = Guid.NewGuid();
        _agentUserId = Guid.NewGuid();
        _clientUserId = Guid.NewGuid();
    }

    #region GetAllAsync Tests

    [Fact]
    public async Task GetAllAsync_ReturnsAllTenants_ForAdminUser()
    {
        // Arrange
        var adminUser = new User
        {
            Id = _adminUserId,
            Email = "admin@test.com",
            Role = UserRole.ADMIN
        };

        var tenants = CreateTestTenants();
        SetupMockDbSet(_mockContext, tenants);

        // Act
        var result = await _service.GetAllAsync(adminUser);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Should().HaveCount(2);
        result.Data.Should().Contain(k => k.Name == "Test Kreditor 1");
        result.Data.Should().Contain(k => k.Name == "Test Kreditor 2");
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAssignedTenants_ForAgentUser()
    {
        // Arrange
        var agentUser = new User
        {
            Id = _agentUserId,
            Email = "agent@test.com",
            Role = UserRole.AGENT
        };

        var tenants = CreateTestTenants();
        var assignments = new List<UserTenantAssignment>
        {
            new() { UserId = _agentUserId, TenantId = _testTenantId }
        };

        SetupMockDbSet(_mockContext, tenants);
        SetupMockDbSet(_mockContext, assignments);

        // Act
        var result = await _service.GetAllAsync(agentUser);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Should().HaveCount(1);
        result.Data[0].Name.Should().Be("Test Kreditor 1");
    }

    [Fact]
    public async Task GetAllAsync_ReturnsOwnTenant_ForClientUser()
    {
        // Arrange
        var clientUser = new User
        {
            Id = _clientUserId,
            Email = "client@test.com",
            Role = UserRole.CLIENT,
            TenantId = _testTenantId
        };

        var tenants = CreateTestTenants();
        SetupMockDbSet(_mockContext, tenants);

        // Act
        var result = await _service.GetAllAsync(clientUser);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Should().HaveCount(1);
        result.Data[0].Name.Should().Be("Test Kreditor 1");
    }

    [Fact]
    public async Task GetAllAsync_ReturnsFailure_WhenClientHasNoTenant()
    {
        // Arrange
        var clientWithoutTenant = new User
        {
            Id = Guid.NewGuid(),
            Email = "orphan@test.com",
            Role = UserRole.CLIENT,
            TenantId = null
        };

        // Act
        var result = await _service.GetAllAsync(clientWithoutTenant);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Contain("Client user has no assigned tenant");
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_ReturnsTenant_WhenExists()
    {
        // Arrange
        var adminUser = new User
        {
            Id = _adminUserId,
            Email = "admin@test.com",
            Role = UserRole.ADMIN
        };

        var tenants = CreateTestTenants();
        SetupMockDbSet(_mockContext, tenants);

        // Act
        var result = await _service.GetByIdAsync(_testTenantId, adminUser);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().Be(_testTenantId);
        result.Data.Name.Should().Be("Test Kreditor 1");
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsFailure_WhenNotFound()
    {
        // Arrange
        var adminUser = new User
        {
            Id = _adminUserId,
            Email = "admin@test.com",
            Role = UserRole.ADMIN
        };

        var tenants = CreateTestTenants();
        SetupMockDbSet(_mockContext, tenants);

        var nonExistentId = Guid.NewGuid();

        // Act
        var result = await _service.GetByIdAsync(nonExistentId, adminUser);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Be("Tenant not found");
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsFailure_WhenClientAccessesDifferentTenant()
    {
        // Arrange
        var clientUser = new User
        {
            Id = _clientUserId,
            Email = "client@test.com",
            Role = UserRole.CLIENT,
            TenantId = _testTenantId
        };

        var tenants = CreateTestTenants();
        SetupMockDbSet(_mockContext, tenants);

        // Act
        var result = await _service.GetByIdAsync(_testTenant2Id, clientUser);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Be("Access denied");
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsFailure_WhenAgentAccessesUnassignedTenant()
    {
        // Arrange
        var agentUser = new User
        {
            Id = _agentUserId,
            Email = "agent@test.com",
            Role = UserRole.AGENT
        };

        var tenants = CreateTestTenants();
        var assignments = new List<UserTenantAssignment>
        {
            new() { UserId = _agentUserId, TenantId = _testTenantId }
        };

        SetupMockDbSet(_mockContext, tenants);
        SetupMockDbSet(_mockContext, assignments);

        // Act
        var result = await _service.GetByIdAsync(_testTenant2Id, agentUser);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Be("Access denied");
    }

    [Fact]
    public async Task GetByIdAsync_AllowsAdminToAccessAnyTenant()
    {
        // Arrange
        var adminUser = new User
        {
            Id = _adminUserId,
            Email = "admin@test.com",
            Role = UserRole.ADMIN
        };

        var tenants = CreateTestTenants();
        SetupMockDbSet(_mockContext, tenants);

        // Act
        var result = await _service.GetByIdAsync(_testTenant2Id, adminUser);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data!.Id.Should().Be(_testTenant2Id);
    }

    #endregion

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_CreatesTenant_WhenValid()
    {
        // Arrange
        var adminUser = new User
        {
            Id = _adminUserId,
            Email = "admin@test.com",
            Role = UserRole.ADMIN
        };

        var request = new CreateKreditorRequest
        {
            Name = "New Kreditor",
            RegistrationNumber = "NEW123",
            ContactEmail = "new@kreditor.com",
            BankAccountIBAN = "DE89370400440532013002"
        };

        var existingTenants = CreateTestTenants();
        SetupMockDbSet(_mockContext, existingTenants);

        var addedTenant = (TenantEntity?)null;
        _mockContext.Setup(c => c.Tenants.Add(It.IsAny<TenantEntity>()))
            .Callback<TenantEntity>(t => addedTenant = t);
        _mockContext.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _service.CreateAsync(request, adminUser);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Name.Should().Be("New Kreditor");
        result.Data.RegistrationNumber.Should().Be("NEW123");
        addedTenant.Should().NotBeNull();
        _mockContext.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_ReturnsFailure_WhenNonAdminUser()
    {
        // Arrange
        var agentUser = new User
        {
            Id = _agentUserId,
            Email = "agent@test.com",
            Role = UserRole.AGENT
        };

        var request = new CreateKreditorRequest
        {
            Name = "New Kreditor",
            RegistrationNumber = "NEW123",
            ContactEmail = "new@kreditor.com",
            BankAccountIBAN = "DE89370400440532013002"
        };

        // Act
        var result = await _service.CreateAsync(request, agentUser);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Contain("Only administrators can create Kreditoren");
    }

    [Fact]
    public async Task CreateAsync_ReturnsFailure_WhenDuplicateRegistrationNumber()
    {
        // Arrange
        var adminUser = new User
        {
            Id = _adminUserId,
            Email = "admin@test.com",
            Role = UserRole.ADMIN
        };

        var request = new CreateKreditorRequest
        {
            Name = "Duplicate Kreditor",
            RegistrationNumber = "REG001", // Already exists
            ContactEmail = "duplicate@kreditor.com",
            BankAccountIBAN = "DE89370400440532013002"
        };

        var existingTenants = CreateTestTenants();
        SetupMockDbSet(_mockContext, existingTenants);

        // Act
        var result = await _service.CreateAsync(request, adminUser);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Contain("A Kreditor with this registration number already exists");
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_UpdatesTenant_WhenExists()
    {
        // Arrange
        var adminUser = new User
        {
            Id = _adminUserId,
            Email = "admin@test.com",
            Role = UserRole.ADMIN
        };

        var request = new UpdateKreditorRequest
        {
            Name = "Updated Kreditor",
            RegistrationNumber = "REG001",
            ContactEmail = "updated@kreditor.com",
            BankAccountIBAN = "DE89370400440532013999"
        };

        var tenants = CreateTestTenants();
        SetupMockDbSet(_mockContext, tenants);
        _mockContext.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _service.UpdateAsync(_testTenantId, request, adminUser);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data!.Name.Should().Be("Updated Kreditor");
        result.Data.ContactEmail.Should().Be("updated@kreditor.com");
        result.Data.BankAccountIBAN.Should().Be("DE89370400440532013999");
        _mockContext.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFailure_WhenNotFound()
    {
        // Arrange
        var adminUser = new User
        {
            Id = _adminUserId,
            Email = "admin@test.com",
            Role = UserRole.ADMIN
        };

        var nonExistentId = Guid.NewGuid();
        var request = new UpdateKreditorRequest
        {
            Name = "Updated Kreditor",
            RegistrationNumber = "REG999",
            ContactEmail = "updated@kreditor.com",
            BankAccountIBAN = "DE89370400440532013999"
        };

        var tenants = CreateTestTenants();
        SetupMockDbSet(_mockContext, tenants);

        // Act
        var result = await _service.UpdateAsync(nonExistentId, request, adminUser);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Be("Tenant not found");
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFailure_WhenNonAdminUser()
    {
        // Arrange
        var agentUser = new User
        {
            Id = _agentUserId,
            Email = "agent@test.com",
            Role = UserRole.AGENT
        };

        var request = new UpdateKreditorRequest
        {
            Name = "Updated Kreditor",
            RegistrationNumber = "REG001",
            ContactEmail = "updated@kreditor.com",
            BankAccountIBAN = "DE89370400440532013999"
        };

        // Act
        var result = await _service.UpdateAsync(_testTenantId, request, agentUser);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Contain("Only administrators can update Kreditoren");
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFailure_WhenDuplicateRegistrationNumber()
    {
        // Arrange
        var adminUser = new User
        {
            Id = _adminUserId,
            Email = "admin@test.com",
            Role = UserRole.ADMIN
        };

        var request = new UpdateKreditorRequest
        {
            Name = "Updated Kreditor",
            RegistrationNumber = "REG002", // Belongs to another tenant
            ContactEmail = "updated@kreditor.com",
            BankAccountIBAN = "DE89370400440532013999"
        };

        var tenants = CreateTestTenants();
        SetupMockDbSet(_mockContext, tenants);

        // Act
        var result = await _service.UpdateAsync(_testTenantId, request, adminUser);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Contain("A Kreditor with this registration number already exists");
    }

    [Fact]
    public async Task UpdateAsync_AllowsSameRegistrationNumber_ForSameTenant()
    {
        // Arrange
        var adminUser = new User
        {
            Id = _adminUserId,
            Email = "admin@test.com",
            Role = UserRole.ADMIN
        };

        var request = new UpdateKreditorRequest
        {
            Name = "Updated Name Only",
            RegistrationNumber = "REG001", // Same as current
            ContactEmail = "updated@kreditor.com",
            BankAccountIBAN = "DE89370400440532013999"
        };

        var tenants = CreateTestTenants();
        SetupMockDbSet(_mockContext, tenants);
        _mockContext.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _service.UpdateAsync(_testTenantId, request, adminUser);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data!.Name.Should().Be("Updated Name Only");
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_DeletesTenant_WhenNoDependencies()
    {
        // Arrange
        var adminUser = new User
        {
            Id = _adminUserId,
            Email = "admin@test.com",
            Role = UserRole.ADMIN
        };

        var tenants = CreateTestTenants();
        SetupMockDbSet(_mockContext, tenants);
        _mockContext.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act - Delete tenant 2 which has no debtors/cases
        var result = await _service.DeleteAsync(_testTenant2Id, adminUser);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _mockContext.Verify(c => c.Tenants.Remove(It.IsAny<TenantEntity>()), Times.Once);
        _mockContext.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFailure_WhenTenantHasDebtors()
    {
        // Arrange
        var adminUser = new User
        {
            Id = _adminUserId,
            Email = "admin@test.com",
            Role = UserRole.ADMIN
        };

        var tenants = CreateTestTenantsWithDependencies();
        SetupMockDbSet(_mockContext, tenants);

        // Act - Try to delete tenant 1 which has debtors
        var result = await _service.DeleteAsync(_testTenantId, adminUser);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Contain("Cannot delete Kreditor with existing debtors or cases");
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFailure_WhenNotFound()
    {
        // Arrange
        var adminUser = new User
        {
            Id = _adminUserId,
            Email = "admin@test.com",
            Role = UserRole.ADMIN
        };

        var tenants = CreateTestTenants();
        SetupMockDbSet(_mockContext, tenants);

        var nonExistentId = Guid.NewGuid();

        // Act
        var result = await _service.DeleteAsync(nonExistentId, adminUser);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Be("Tenant not found");
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFailure_WhenNonAdminUser()
    {
        // Arrange
        var agentUser = new User
        {
            Id = _agentUserId,
            Email = "agent@test.com",
            Role = UserRole.AGENT
        };

        // Act
        var result = await _service.DeleteAsync(_testTenant2Id, agentUser);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Contain("Only administrators can delete Kreditoren");
    }

    #endregion

    #region Helper Methods

    private List<TenantEntity> CreateTestTenants()
    {
        return new List<TenantEntity>
        {
            new()
            {
                Id = _testTenantId,
                Name = "Test Kreditor 1",
                RegistrationNumber = "REG001",
                ContactEmail = "test1@kreditor.com",
                BankAccountIBAN = "DE89370400440532013000",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Debtors = new List<Debtor>(),
                Cases = new List<Case>()
            },
            new()
            {
                Id = _testTenant2Id,
                Name = "Test Kreditor 2",
                RegistrationNumber = "REG002",
                ContactEmail = "test2@kreditor.com",
                BankAccountIBAN = "DE89370400440532013001",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Debtors = new List<Debtor>(),
                Cases = new List<Case>()
            }
        };
    }

    private List<TenantEntity> CreateTestTenantsWithDependencies()
    {
        var debtor = new Debtor
        {
            Id = Guid.NewGuid(),
            TenantId = _testTenantId,
            FirstName = "John",
            LastName = "Doe"
        };

        return new List<TenantEntity>
        {
            new()
            {
                Id = _testTenantId,
                Name = "Test Kreditor 1",
                RegistrationNumber = "REG001",
                ContactEmail = "test1@kreditor.com",
                BankAccountIBAN = "DE89370400440532013000",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Debtors = new List<Debtor> { debtor },
                Cases = new List<Case>()
            },
            new()
            {
                Id = _testTenant2Id,
                Name = "Test Kreditor 2",
                RegistrationNumber = "REG002",
                ContactEmail = "test2@kreditor.com",
                BankAccountIBAN = "DE89370400440532013001",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Debtors = new List<Debtor>(),
                Cases = new List<Case>()
            }
        };
    }

    private void SetupMockDbSet<T>(Mock<IApplicationDbContext> mockContext, List<T> data) where T : class
    {
        var mockSet = new Mock<DbSet<T>>();
        var queryable = data.AsQueryable();

        mockSet.As<IQueryable<T>>().Setup(m => m.Provider).Returns(new TestAsyncQueryProvider<T>(queryable.Provider));
        mockSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(queryable.Expression);
        mockSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
        mockSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(queryable.GetEnumerator());
        mockSet.As<IAsyncEnumerable<T>>().Setup(m => m.GetAsyncEnumerator(It.IsAny<CancellationToken>()))
            .Returns(new TestAsyncEnumerator<T>(queryable.GetEnumerator()));

        if (typeof(T) == typeof(TenantEntity))
        {
            mockContext.Setup(c => c.Tenants).Returns((mockSet.Object as DbSet<TenantEntity>)!);
        }
        else if (typeof(T) == typeof(UserTenantAssignment))
        {
            mockContext.Setup(c => c.UserTenantAssignments).Returns((mockSet.Object as DbSet<UserTenantAssignment>)!);
        }
    }

    #endregion
}

#region Test Async Helpers

internal class TestAsyncQueryProvider<TEntity> : IAsyncQueryProvider
{
    private readonly IQueryProvider _inner;

    internal TestAsyncQueryProvider(IQueryProvider inner)
    {
        _inner = inner;
    }

    public IQueryable CreateQuery(System.Linq.Expressions.Expression expression)
    {
        return new TestAsyncEnumerable<TEntity>(expression);
    }

    public IQueryable<TElement> CreateQuery<TElement>(System.Linq.Expressions.Expression expression)
    {
        return new TestAsyncEnumerable<TElement>(expression);
    }

    public object Execute(System.Linq.Expressions.Expression expression)
    {
        return _inner.Execute(expression)!;
    }

    public TResult Execute<TResult>(System.Linq.Expressions.Expression expression)
    {
        return _inner.Execute<TResult>(expression);
    }

    public IAsyncEnumerable<TResult> ExecuteAsync<TResult>(System.Linq.Expressions.Expression expression)
    {
        return new TestAsyncEnumerable<TResult>(expression);
    }

    public TResult ExecuteAsync<TResult>(System.Linq.Expressions.Expression expression, CancellationToken cancellationToken)
    {
        return Execute<TResult>(expression);
    }
}

internal class TestAsyncEnumerable<T> : EnumerableQuery<T>, IAsyncEnumerable<T>, IQueryable<T>
{
    public TestAsyncEnumerable(System.Linq.Expressions.Expression expression)
        : base(expression)
    {
    }

    public IAsyncEnumerator<T> GetAsyncEnumerator(CancellationToken cancellationToken = default)
    {
        return new TestAsyncEnumerator<T>(this.AsEnumerable().GetEnumerator());
    }

    IQueryProvider IQueryable.Provider => new TestAsyncQueryProvider<T>(this);
}

internal class TestAsyncEnumerator<T> : IAsyncEnumerator<T>
{
    private readonly IEnumerator<T> _inner;

    public TestAsyncEnumerator(IEnumerator<T> inner)
    {
        _inner = inner;
    }

    public ValueTask<bool> MoveNextAsync()
    {
        return new ValueTask<bool>(_inner.MoveNext());
    }

    public T Current => _inner.Current;

    public ValueTask DisposeAsync()
    {
        _inner.Dispose();
        return new ValueTask();
    }
}

#endregion
