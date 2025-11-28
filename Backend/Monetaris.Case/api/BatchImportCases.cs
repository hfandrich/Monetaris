using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Monetaris.Case.Models;
using Monetaris.Case.Services;
using Monetaris.Shared.Enums;
using Monetaris.Shared.Interfaces;
using Monetaris.Shared.Models.Entities;

namespace Monetaris.Case.Api;

/// <summary>
/// Endpoint for batch importing cases from CSV files
/// </summary>
[ApiController]
[Route("api/cases")]
public class BatchImportCases : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<BatchImportCases> _logger;
    private readonly IWorkflowEngine _workflowEngine;

    public BatchImportCases(
        IApplicationDbContext context,
        ILogger<BatchImportCases> logger,
        IWorkflowEngine workflowEngine)
    {
        _context = context;
        _logger = logger;
        _workflowEngine = workflowEngine;
    }

    /// <summary>
    /// Batch import cases from CSV data
    /// </summary>
    /// <param name="request">Batch import request with kreditor ID and items</param>
    /// <returns>Import summary with created cases and errors</returns>
    /// <response code="200">Import completed (may have partial errors)</response>
    /// <response code="400">Validation error</response>
    /// <response code="401">Unauthorized</response>
    /// <response code="403">Access denied to kreditor</response>
    [HttpPost("batch")]
    [Authorize(Roles = "ADMIN,AGENT,CLIENT")]
    [ProducesResponseType(typeof(BatchImportResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> BatchImport([FromBody] BatchImportRequest request)
    {
        var currentUser = await GetCurrentUserAsync();

        if (currentUser == null)
        {
            return Unauthorized();
        }

        // Verify kreditor exists
        var kreditor = await _context.Kreditoren.FindAsync(request.KreditorId);
        if (kreditor == null)
        {
            return BadRequest(new ProblemDetails
            {
                Detail = "Kreditor not found"
            });
        }

        // Authorization check
        if (!await HasAccessToKreditor(request.KreditorId, currentUser))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails
            {
                Detail = "Access denied to this kreditor"
            });
        }

        var response = new BatchImportResponse
        {
            TotalProcessed = request.Items.Count
        };

        foreach (var item in request.Items)
        {
            try
            {
                // Validate required fields
                if (string.IsNullOrWhiteSpace(item.InvoiceNumber))
                {
                    response.Skipped++;
                    response.Errors.Add($"Skipped: Missing invoice number");
                    continue;
                }

                if (string.IsNullOrWhiteSpace(item.DebtorName))
                {
                    response.Skipped++;
                    response.Errors.Add($"Skipped invoice {item.InvoiceNumber}: Missing debtor name");
                    continue;
                }

                if (item.Amount <= 0)
                {
                    response.Skipped++;
                    response.Errors.Add($"Skipped invoice {item.InvoiceNumber}: Invalid amount");
                    continue;
                }

                // Check for duplicate invoice number
                var existingCase = await _context.Cases
                    .FirstOrDefaultAsync(c => c.KreditorId == request.KreditorId
                        && c.InvoiceNumber == item.InvoiceNumber);

                if (existingCase != null)
                {
                    response.Skipped++;
                    response.Errors.Add($"Skipped invoice {item.InvoiceNumber}: Already exists");
                    continue;
                }

                // Find or create debtor
                var debtor = await FindOrCreateDebtor(item, request.KreditorId, currentUser);

                // Create case
                var newCase = new Shared.Models.Entities.Case
                {
                    KreditorId = request.KreditorId,
                    DebtorId = debtor.Id,
                    InvoiceNumber = item.InvoiceNumber,
                    PrincipalAmount = item.Amount,
                    Costs = 0,
                    Interest = 0,
                    Currency = "EUR",
                    InvoiceDate = item.InvoiceDate ?? DateTime.UtcNow.Date,
                    DueDate = item.DueDate,
                    Status = CaseStatus.NEW,
                    CompetentCourt = "Amtsgericht Coburg - Zentrales Mahngericht",
                    NextActionDate = _workflowEngine.CalculateNextActionDate(CaseStatus.NEW)
                };

                _context.Cases.Add(newCase);

                // Create audit log
                var historyEntry = new CaseHistory
                {
                    CaseId = newCase.Id,
                    Action = "CREATED",
                    Details = $"Case created via batch import by {currentUser.Name}",
                    Actor = currentUser.Name
                };
                _context.CaseHistories.Add(historyEntry);

                // Update debtor statistics
                debtor.TotalDebt += newCase.TotalAmount;
                debtor.OpenCases += 1;

                await _context.SaveChangesAsync();

                response.Created++;
                response.CreatedCaseIds.Add(newCase.Id);

                _logger.LogInformation(
                    "Created case {CaseId} for invoice {InvoiceNumber} via batch import by user {UserId}",
                    newCase.Id, item.InvoiceNumber, currentUser.Id);
            }
            catch (Exception ex)
            {
                response.Skipped++;
                response.Errors.Add($"Error importing invoice {item.InvoiceNumber}: {ex.Message}");
                _logger.LogError(ex, "Error importing invoice {InvoiceNumber}", item.InvoiceNumber);
            }
        }

        _logger.LogInformation(
            "Batch import completed: {Created} created, {Skipped} skipped out of {Total} items by user {UserId}",
            response.Created, response.Skipped, response.TotalProcessed, currentUser.Id);

        return Ok(response);
    }

    /// <summary>
    /// Find existing debtor by email or create a new one
    /// </summary>
    private async Task<Debtor> FindOrCreateDebtor(
        BatchCaseItem item,
        Guid kreditorId,
        User currentUser)
    {
        // Try to find existing debtor by email
        Debtor? existingDebtor = null;

        if (!string.IsNullOrWhiteSpace(item.DebtorEmail))
        {
            existingDebtor = await _context.Debtors
                .FirstOrDefaultAsync(d => d.KreditorId == kreditorId
                    && d.Email == item.DebtorEmail);
        }

        if (existingDebtor != null)
        {
            return existingDebtor;
        }

        // Parse debtor name (assume format: "FirstName LastName" or "CompanyName")
        var nameParts = item.DebtorName.Trim().Split(' ', 2);
        var firstName = nameParts.Length > 0 ? nameParts[0] : item.DebtorName;
        var lastName = nameParts.Length > 1 ? nameParts[1] : string.Empty;

        // Determine entity type (company if no last name or contains typical company suffixes)
        var isCompany = string.IsNullOrWhiteSpace(lastName) ||
                       item.DebtorName.Contains("GmbH", StringComparison.OrdinalIgnoreCase) ||
                       item.DebtorName.Contains("AG", StringComparison.OrdinalIgnoreCase) ||
                       item.DebtorName.Contains("KG", StringComparison.OrdinalIgnoreCase) ||
                       item.DebtorName.Contains("OHG", StringComparison.OrdinalIgnoreCase);

        // Create new debtor
        var newDebtor = new Debtor
        {
            KreditorId = kreditorId,
            EntityType = isCompany ? EntityType.LEGAL_ENTITY : EntityType.NATURAL_PERSON,
            FirstName = isCompany ? string.Empty : firstName,
            LastName = isCompany ? string.Empty : lastName,
            CompanyName = isCompany ? item.DebtorName : null,
            Email = item.DebtorEmail ?? string.Empty,
            PhoneMobile = item.DebtorPhone ?? string.Empty,
            Street = item.DebtorAddress ?? string.Empty,
            City = item.DebtorCity ?? string.Empty,
            ZipCode = item.DebtorPostalCode ?? string.Empty,
            Country = "Deutschland",
            TotalDebt = 0,
            OpenCases = 0
        };

        _context.Debtors.Add(newDebtor);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Created new debtor {DebtorId} ({Name}) via batch import",
            newDebtor.Id, item.DebtorName);

        return newDebtor;
    }

    /// <summary>
    /// Check if user has access to the specified kreditor
    /// </summary>
    private async Task<bool> HasAccessToKreditor(Guid kreditorId, User currentUser)
    {
        if (currentUser.Role == UserRole.ADMIN)
        {
            return true;
        }

        if (currentUser.Role == UserRole.CLIENT)
        {
            return currentUser.KreditorId == kreditorId;
        }

        if (currentUser.Role == UserRole.AGENT)
        {
            return await _context.UserKreditorAssignments
                .AnyAsync(uka => uka.UserId == currentUser.Id && uka.KreditorId == kreditorId);
        }

        return false;
    }

    /// <summary>
    /// Get current user from claims
    /// </summary>
    private async Task<User?> GetCurrentUserAsync()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
        {
            return null;
        }

        return await _context.Users.FindAsync(userId);
    }
}
