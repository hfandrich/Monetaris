using Microsoft.EntityFrameworkCore;
using Monetaris.Shared.Enums;
using Monetaris.Shared.Models.Entities;

namespace MonetarisApi.Data;

/// <summary>
/// Database seeder to populate initial data from Frontend mock data
/// </summary>
public class DatabaseSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DatabaseSeeder> _logger;

    public DatabaseSeeder(ApplicationDbContext context, ILogger<DatabaseSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Seeds the database with initial data if not already seeded
    /// </summary>
    public async Task SeedAsync()
    {
        // Check if already seeded
        if (await _context.Tenants.AnyAsync())
        {
            _logger.LogInformation("Database already seeded, skipping...");
            return;
        }

        _logger.LogInformation("Starting database seeding...");

        // Seed Tenants (from SEED_TENANTS)
        var tenants = new List<Tenant>
        {
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000001"), Name = "TechSolutions GmbH", RegistrationNumber = "HRB-12345", ContactEmail = "finance@techsolutions.de", BankAccountIBAN = "DE45 1000 0000 1234 5678 90" },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000002"), Name = "MediCare Praxisverbund", RegistrationNumber = "HRB-98765", ContactEmail = "abrechnung@medicare.de", BankAccountIBAN = "DE89 5000 0000 9876 5432 10" },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000003"), Name = "GreenEnergy e.G.", RegistrationNumber = "GnR-5521", ContactEmail = "buchhaltung@greenenergy.de", BankAccountIBAN = "DE12 3456 7890 1234 5678 99" },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000004"), Name = "Immobilien Haie KG", RegistrationNumber = "HRA-8821", ContactEmail = "miete@immo-haie.de", BankAccountIBAN = "DE33 9876 5432 1098 7654 32" },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000005"), Name = "WebShop24", RegistrationNumber = "HRB-3321", ContactEmail = "payment@webshop24.com", BankAccountIBAN = "DE77 1111 2222 3333 4444 55" }
        };
        await _context.Tenants.AddRangeAsync(tenants);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {Count} tenants", tenants.Count);

        // Seed Users (from SEED_USERS)
        var users = new List<User>
        {
            // Admin users
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000010"), Name = "System Administrator", Email = "admin@monetaris.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"), Role = UserRole.ADMIN, AvatarInitials = "SA" },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000011"), Name = "Sarah Connor (Admin)", Email = "sarah@monetaris.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("sarah123"), Role = UserRole.ADMIN, AvatarInitials = "SC" },

            // Agent users
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000012"), Name = "Max Mustermann (Agent)", Email = "max@monetaris.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("max123"), Role = UserRole.AGENT, AvatarInitials = "MM" },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000013"), Name = "James Bond (Agent)", Email = "007@monetaris.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("bond123"), Role = UserRole.AGENT, AvatarInitials = "JB" },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000014"), Name = "Lara Croft (Agent)", Email = "lara@monetaris.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("lara123"), Role = UserRole.AGENT, AvatarInitials = "LC" },

            // Client user
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000015"), Name = "Sabine Client (TechSolutions)", Email = "client@techsolutions.de", PasswordHash = BCrypt.Net.BCrypt.HashPassword("client123"), Role = UserRole.CLIENT, TenantId = Guid.Parse("00000000-0000-0000-0000-000000000001"), AvatarInitials = "SC" },

            // Debtor user
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000016"), Name = "Max Muster (Schuldner)", Email = "max@muster.de", PasswordHash = BCrypt.Net.BCrypt.HashPassword("debtor123"), Role = UserRole.DEBTOR, AvatarInitials = "MM" }
        };
        await _context.Users.AddRangeAsync(users);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {Count} users", users.Count);

        // Seed UserTenantAssignments (Agents can handle multiple tenants)
        var assignments = new List<UserTenantAssignment>
        {
            // Max Mustermann handles all tenants
            new() { UserId = Guid.Parse("00000000-0000-0000-0000-000000000012"), TenantId = Guid.Parse("00000000-0000-0000-0000-000000000001") },
            new() { UserId = Guid.Parse("00000000-0000-0000-0000-000000000012"), TenantId = Guid.Parse("00000000-0000-0000-0000-000000000002") },
            new() { UserId = Guid.Parse("00000000-0000-0000-0000-000000000012"), TenantId = Guid.Parse("00000000-0000-0000-0000-000000000003") },
            new() { UserId = Guid.Parse("00000000-0000-0000-0000-000000000012"), TenantId = Guid.Parse("00000000-0000-0000-0000-000000000004") },
            new() { UserId = Guid.Parse("00000000-0000-0000-0000-000000000012"), TenantId = Guid.Parse("00000000-0000-0000-0000-000000000005") },

            // James Bond handles tenants 3-5
            new() { UserId = Guid.Parse("00000000-0000-0000-0000-000000000013"), TenantId = Guid.Parse("00000000-0000-0000-0000-000000000003") },
            new() { UserId = Guid.Parse("00000000-0000-0000-0000-000000000013"), TenantId = Guid.Parse("00000000-0000-0000-0000-000000000004") },
            new() { UserId = Guid.Parse("00000000-0000-0000-0000-000000000013"), TenantId = Guid.Parse("00000000-0000-0000-0000-000000000005") },

            // Lara Croft handles tenants 1, 3, 5
            new() { UserId = Guid.Parse("00000000-0000-0000-0000-000000000014"), TenantId = Guid.Parse("00000000-0000-0000-0000-000000000001") },
            new() { UserId = Guid.Parse("00000000-0000-0000-0000-000000000014"), TenantId = Guid.Parse("00000000-0000-0000-0000-000000000003") },
            new() { UserId = Guid.Parse("00000000-0000-0000-0000-000000000014"), TenantId = Guid.Parse("00000000-0000-0000-0000-000000000005") }
        };
        await _context.UserTenantAssignments.AddRangeAsync(assignments);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {Count} user-tenant assignments", assignments.Count);

        // Seed a sample Debtor (Portal Test Account)
        var debtor1 = new Debtor
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.Parse("00000000-0000-0000-0000-000000000001"),
            AgentId = Guid.Parse("00000000-0000-0000-0000-000000000012"),
            IsCompany = false,
            FirstName = "Max",
            LastName = "Muster",
            Email = "max@muster.de",
            Phone = "0171 1234567",
            Street = "Musterweg 1",
            ZipCode = "10115",
            City = "Berlin",
            Country = "Deutschland",
            AddressStatus = AddressStatus.CONFIRMED,
            RiskScore = RiskScore.C,
            TotalDebt = 0,
            OpenCases = 0,
            Notes = "Portal Test Account"
        };
        await _context.Debtors.AddAsync(debtor1);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded sample debtor: {Name}", debtor1.FirstName + " " + debtor1.LastName);

        // Create a sample case
        var case1 = new Case
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.Parse("00000000-0000-0000-0000-000000000001"),
            DebtorId = debtor1.Id,
            AgentId = Guid.Parse("00000000-0000-0000-0000-000000000012"),
            PrincipalAmount = 500.00m,
            Costs = 25.00m,
            Interest = 12.50m,
            Currency = "EUR",
            InvoiceNumber = "RE-PORTAL-TEST",
            InvoiceDate = DateTime.UtcNow.AddDays(-60),
            DueDate = DateTime.UtcNow.AddDays(-30),
            Status = CaseStatus.NEW,
            CompetentCourt = "Amtsgericht Coburg - Zentrales Mahngericht"
        };
        await _context.Cases.AddAsync(case1);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded sample case: {InvoiceNumber}", case1.InvoiceNumber);

        // Update debtor stats
        debtor1.TotalDebt = case1.PrincipalAmount + case1.Costs + case1.Interest;
        debtor1.OpenCases = 1;
        await _context.SaveChangesAsync();

        // Seed Templates (from SEED_TEMPLATES)
        var templates = new List<Template>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Name = "1. Mahnung (Freundlich)",
                Type = TemplateType.EMAIL,
                Category = TemplateCategory.REMINDER,
                Subject = "Zahlungserinnerung: Rechnung {{case.invoiceNumber}}",
                Content = @"<p>Sehr geehrte(r) {{debtor.firstName}} {{debtor.lastName}},</p>
<p>sicher haben Sie es im Alltagsstress einfach übersehen: Die Rechnung <strong>{{case.invoiceNumber}}</strong> vom {{case.invoiceDate}} ist noch offen.</p>
<p>Bitte überweisen Sie den Betrag von <strong>{{case.totalAmount}}</strong> bis zum <strong>{{case.dueDate}}</strong> auf das unten genannte Konto.</p>
<p>Sollten Sie die Zahlung bereits geleistet haben, betrachten Sie dieses Schreiben bitte als gegenstandslos.</p>
<br>
<p>Mit freundlichen Grüßen,</p>
<p>{{tenant.name}}</p>"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "2. Mahnung (Bestimmt)",
                Type = TemplateType.LETTER,
                Category = TemplateCategory.REMINDER,
                Content = @"<h2>2. Mahnung</h2>
<p><strong>Aktenzeichen: {{case.id}}</strong></p>
<p>Sehr geehrte Damen und Herren,</p>
<p>leider konnten wir trotz unserer Erinnerung noch keinen Zahlungseingang für die Rechnung <strong>{{case.invoiceNumber}}</strong> feststellen.</p>
<p>Wir bitten Sie nunmehr nachdrücklich, den fälligen Gesamtbetrag von <strong>{{case.totalAmount}}</strong> (inkl. Mahngebühren) umgehend zu begleichen.</p>
<p>Fälligkeitsdatum: <strong>{{case.dueDate}}</strong></p>
<br>
<p>Hochachtungsvoll,</p>
<p>{{tenant.name}} Buchhaltung</p>"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Letzte Mahnung (Ultimativ)",
                Type = TemplateType.LETTER,
                Category = TemplateCategory.REMINDER,
                Content = @"<h2 style=""color:red"">LETZTE MAHNUNG</h2>
<p><strong>Vermeidung gerichtlicher Maßnahmen</strong></p>
<p>Sehr geehrte(r) {{debtor.lastName}},</p>
<p>da Sie auf unsere bisherigen Mahnungen nicht reagiert haben, fordern wir Sie hiermit letztmalig auf, die Forderung zu begleichen.</p>
<p>Offener Betrag: <strong>{{case.totalAmount}}</strong></p>
<p>Zahlen Sie bis spätestens <strong>{{case.dueDate}}</strong>. Andernfalls werden wir die Forderung an unsere Rechtsanwälte zur gerichtlichen Betreibung übergeben. Die hierdurch entstehenden erheblichen Mehrkosten gehen zu Ihren Lasten.</p>
<br>
<p>Mit freundlichen Grüßen,</p>
<p>{{tenant.name}} - Rechtsabteilung</p>"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Ratenzahlungsvereinbarung",
                Type = TemplateType.LETTER,
                Category = TemplateCategory.GENERAL,
                Content = @"<h2>Ratenzahlungsvereinbarung</h2>
<p>zwischen {{tenant.name}} (Gläubiger) und {{debtor.firstName}} {{debtor.lastName}} (Schuldner).</p>
<p>Der Schuldner erkennt die Forderung in Höhe von {{case.totalAmount}} vollumfänglich an.</p>
<p>Zur Tilgung wird eine monatliche Rate von 50,00 EUR vereinbart, zahlbar zum 1. eines jeden Monats.</p>
<p>Bei Verzug mit einer Rate wird der gesamte Restbetrag sofort fällig.</p>
<br><br>
<p>_______________________<br>Unterschrift Schuldner</p>"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Rechtliches Mahnverfahren (Info)",
                Type = TemplateType.EMAIL,
                Category = TemplateCategory.LEGAL,
                Subject = "Einleitung gerichtliches Mahnverfahren - Akte {{case.id}}",
                Content = @"<p>Sehr geehrte Damen und Herren,</p>
<p>wir informieren Sie hiermit, dass wir für die Akte <strong>{{case.invoiceNumber}}</strong> heute den Antrag auf Erlass eines Mahnbescheids beim zuständigen Mahngericht eingereicht haben.</p>
<p>Hauptforderung: {{case.principalAmount}}</p>
<p>Verfahrenskosten: {{case.costs}}</p>
<br>
<p>Mit freundlichen Grüßen,</p>
<p>Monetaris Legal Team</p>"
            }
        };
        await _context.Templates.AddRangeAsync(templates);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {Count} templates", templates.Count);

        _logger.LogInformation("Database seeding completed successfully!");
    }
}
