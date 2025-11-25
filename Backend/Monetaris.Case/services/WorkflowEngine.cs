using Monetaris.Shared.Enums;

namespace Monetaris.Case.Services;

/// <summary>
/// ZPO-compliant workflow engine for case status transitions
/// </summary>
public class WorkflowEngine : IWorkflowEngine
{
    // Define valid transitions according to German ZPO procedures
    private static readonly Dictionary<CaseStatus, List<CaseStatus>> ValidTransitions = new()
    {
        // Pre-Court Phase
        [CaseStatus.DRAFT] = new() { CaseStatus.NEW },
        [CaseStatus.NEW] = new() { CaseStatus.REMINDER_1, CaseStatus.ADDRESS_RESEARCH, CaseStatus.PAID, CaseStatus.SETTLED },
        [CaseStatus.REMINDER_1] = new() { CaseStatus.REMINDER_2, CaseStatus.ADDRESS_RESEARCH, CaseStatus.PAID, CaseStatus.SETTLED },
        [CaseStatus.REMINDER_2] = new() { CaseStatus.PREPARE_MB, CaseStatus.ADDRESS_RESEARCH, CaseStatus.PAID, CaseStatus.SETTLED },
        [CaseStatus.ADDRESS_RESEARCH] = new() { CaseStatus.REMINDER_1, CaseStatus.REMINDER_2, CaseStatus.PREPARE_MB, CaseStatus.UNCOLLECTIBLE },

        // Court Dunning Procedure
        [CaseStatus.PREPARE_MB] = new() { CaseStatus.MB_REQUESTED, CaseStatus.PAID, CaseStatus.SETTLED },
        [CaseStatus.MB_REQUESTED] = new() { CaseStatus.MB_ISSUED, CaseStatus.PAID, CaseStatus.SETTLED },
        [CaseStatus.MB_ISSUED] = new() { CaseStatus.MB_OBJECTION, CaseStatus.PREPARE_VB, CaseStatus.PAID, CaseStatus.SETTLED },
        [CaseStatus.MB_OBJECTION] = new() { CaseStatus.PREPARE_VB, CaseStatus.PAID, CaseStatus.SETTLED, CaseStatus.UNCOLLECTIBLE },

        // Enforcement Order
        [CaseStatus.PREPARE_VB] = new() { CaseStatus.VB_REQUESTED, CaseStatus.PAID, CaseStatus.SETTLED },
        [CaseStatus.VB_REQUESTED] = new() { CaseStatus.VB_ISSUED, CaseStatus.PAID, CaseStatus.SETTLED },
        [CaseStatus.VB_ISSUED] = new() { CaseStatus.TITLE_OBTAINED, CaseStatus.PAID, CaseStatus.SETTLED },
        [CaseStatus.TITLE_OBTAINED] = new() { CaseStatus.ENFORCEMENT_PREP, CaseStatus.PAID, CaseStatus.SETTLED },

        // Enforcement
        [CaseStatus.ENFORCEMENT_PREP] = new() { CaseStatus.GV_MANDATED, CaseStatus.PAID, CaseStatus.SETTLED, CaseStatus.INSOLVENCY },
        [CaseStatus.GV_MANDATED] = new() { CaseStatus.EV_TAKEN, CaseStatus.PAID, CaseStatus.SETTLED, CaseStatus.INSOLVENCY, CaseStatus.UNCOLLECTIBLE },
        [CaseStatus.EV_TAKEN] = new() { CaseStatus.PAID, CaseStatus.SETTLED, CaseStatus.INSOLVENCY, CaseStatus.UNCOLLECTIBLE },

        // Closure States (terminal - no further transitions)
        [CaseStatus.PAID] = new(),
        [CaseStatus.SETTLED] = new(),
        [CaseStatus.INSOLVENCY] = new(),
        [CaseStatus.UNCOLLECTIBLE] = new()
    };

    public bool CanTransition(CaseStatus from, CaseStatus to)
    {
        // Allow transitioning to the same status (no-op)
        if (from == to)
        {
            return true;
        }

        // Check if transition is in valid transitions dictionary
        if (ValidTransitions.TryGetValue(from, out var allowedTransitions))
        {
            return allowedTransitions.Contains(to);
        }

        return false;
    }

    public DateTime? CalculateNextActionDate(CaseStatus newStatus)
    {
        var now = DateTime.UtcNow;

        return newStatus switch
        {
            // Pre-Court: Standard reminder deadlines
            CaseStatus.NEW => now.AddDays(7), // 7 days to send first reminder
            CaseStatus.REMINDER_1 => now.AddDays(14), // 14 days before second reminder
            CaseStatus.REMINDER_2 => now.AddDays(14), // 14 days before escalation to court

            // Court Dunning: Legal deadlines per ZPO
            CaseStatus.PREPARE_MB => now.AddDays(3), // Prepare and submit within 3 days
            CaseStatus.MB_REQUESTED => now.AddDays(21), // Court typically takes 2-3 weeks
            CaseStatus.MB_ISSUED => now.AddDays(14), // 2-week objection period (§ 339 ZPO)

            // Enforcement Order
            CaseStatus.PREPARE_VB => now.AddDays(3), // Prepare enforcement order request
            CaseStatus.VB_REQUESTED => now.AddDays(14), // Court processing time
            CaseStatus.VB_ISSUED => now.AddDays(7), // Title becomes enforceable after waiting period
            CaseStatus.TITLE_OBTAINED => now.AddDays(7), // Prepare enforcement steps

            // Enforcement
            CaseStatus.ENFORCEMENT_PREP => now.AddDays(7), // Prepare bailiff mandate
            CaseStatus.GV_MANDATED => now.AddDays(30), // Bailiff action timeline
            CaseStatus.EV_TAKEN => now.AddDays(60), // Review enforcement progress

            // Address Research
            CaseStatus.ADDRESS_RESEARCH => now.AddDays(30), // EMA (Melderegister) request time

            // Closure states have no next action
            CaseStatus.PAID => null,
            CaseStatus.SETTLED => null,
            CaseStatus.INSOLVENCY => null,
            CaseStatus.UNCOLLECTIBLE => null,

            // Default: 7 days for any undefined status
            _ => now.AddDays(7)
        };
    }

    public List<CaseStatus> GetAllowedTransitions(CaseStatus currentStatus)
    {
        if (ValidTransitions.TryGetValue(currentStatus, out var allowedTransitions))
        {
            return allowedTransitions.ToList();
        }

        return new List<CaseStatus>();
    }
}
