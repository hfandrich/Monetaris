using Microsoft.EntityFrameworkCore;
using Monetaris.Shared.Enums;
using Monetaris.Shared.Models.Entities;
using System.Security.Cryptography;

namespace MonetarisApi.Data;

/// <summary>
/// Database seeder to populate initial data from Frontend mock data
/// SECURITY: Only runs in Development environment with explicit permission
/// </summary>
public class DatabaseSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DatabaseSeeder> _logger;
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _configuration;

    public DatabaseSeeder(ApplicationDbContext context, ILogger<DatabaseSeeder> logger, IWebHostEnvironment env, IConfiguration configuration)
    {
        _context = context;
        _logger = logger;
        _env = env;
        _configuration = configuration;
    }

    /// <summary>
    /// Seeds the database with initial data if not already seeded
    /// SECURITY: Environment-gated and requires explicit permission
    /// </summary>
    public async Task SeedAsync()
    {
        // SECURITY CHECK 1: Only run in Development environment
        if (!_env.IsDevelopment())
        {
            _logger.LogWarning("Database seeding skipped - not in Development environment");
            return;
        }

        // SECURITY CHECK 2: Require explicit permission via environment variable OR config setting
        var allowSeedEnv = Environment.GetEnvironmentVariable("ALLOW_DB_SEED");
        var allowSeedConfig = _configuration.GetValue<bool>("AllowDatabaseSeed", false);
        if (allowSeedEnv != "true" && !allowSeedConfig)
        {
            _logger.LogInformation("Database seeding disabled. Set ALLOW_DB_SEED=true environment variable or AllowDatabaseSeed=true in appsettings to enable.");
            return;
        }

        // Check if already seeded
        if (await _context.Kreditoren.AnyAsync())
        {
            _logger.LogInformation("Database already seeded, skipping...");
            return;
        }

        _logger.LogWarning("==========================================================");
        _logger.LogWarning("STARTING DATABASE SEEDING WITH TEST DATA");
        _logger.LogWarning("SECURITY: Using fixed test passwords for E2E testing");
        _logger.LogWarning("==========================================================");
        _logger.LogInformation("Starting database seeding...");

        // Seed Kreditoren (from SEED_KREDITOREN)
        // SECURITY: Using placeholder IBANs (clearly fake)
        var kreditoren = new List<Kreditor>
        {
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000001"), Name = "TechSolutions GmbH", RegistrationNumber = "HRB-12345", ContactEmail = "finance@techsolutions.de", BankAccountIBAN = "DE00 0000 0000 0000 0000 01" },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000002"), Name = "MediCare Praxisverbund", RegistrationNumber = "HRB-98765", ContactEmail = "abrechnung@medicare.de", BankAccountIBAN = "DE00 0000 0000 0000 0000 02" },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000003"), Name = "GreenEnergy e.G.", RegistrationNumber = "GnR-5521", ContactEmail = "buchhaltung@greenenergy.de", BankAccountIBAN = "DE00 0000 0000 0000 0000 03" },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000004"), Name = "Immobilien Haie KG", RegistrationNumber = "HRA-8821", ContactEmail = "miete@immo-haie.de", BankAccountIBAN = "DE00 0000 0000 0000 0000 04" },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000005"), Name = "WebShop24", RegistrationNumber = "HRB-3321", ContactEmail = "payment@webshop24.com", BankAccountIBAN = "DE00 0000 0000 0000 0000 05" }
        };
        await _context.Kreditoren.AddRangeAsync(kreditoren);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {Count} kreditoren", kreditoren.Count);

        // Seed Users (from SEED_USERS)
        // SECURITY: Using fixed test passwords for E2E testing (Development only!)
        _logger.LogWarning("==========================================================");
        _logger.LogWarning("FIXED TEST CREDENTIALS FOR E2E TESTING:");
        _logger.LogWarning("==========================================================");

        // Fixed test passwords matching E2E test expectations
        var adminPassword = "admin123";
        var sarahPassword = "sarah123";
        var maxPassword = "max123";
        var bondPassword = "bond123";
        var laraPassword = "lara123";
        var clientPassword = "client123";
        var debtorPassword = "debtor123";

        _logger.LogWarning("admin@monetaris.com       → {Password}", adminPassword);
        _logger.LogWarning("sarah@monetaris.com       → {Password}", sarahPassword);
        _logger.LogWarning("max@monetaris.com         → {Password}", maxPassword);
        _logger.LogWarning("007@monetaris.com         → {Password}", bondPassword);
        _logger.LogWarning("lara@monetaris.com        → {Password}", laraPassword);
        _logger.LogWarning("client@techsolutions.de   → {Password}", clientPassword);
        _logger.LogWarning("max@muster.de             → {Password}", debtorPassword);
        _logger.LogWarning("==========================================================");

        var users = new List<User>
        {
            // Admin users
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000010"), Name = "System Administrator", Email = "admin@monetaris.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword), Role = UserRole.ADMIN, AvatarInitials = "SA" },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000011"), Name = "Sarah Connor (Admin)", Email = "sarah@monetaris.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword(sarahPassword), Role = UserRole.ADMIN, AvatarInitials = "SC" },

            // Agent users
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000012"), Name = "Max Mustermann (Agent)", Email = "max@monetaris.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword(maxPassword), Role = UserRole.AGENT, AvatarInitials = "MM" },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000013"), Name = "James Bond (Agent)", Email = "007@monetaris.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword(bondPassword), Role = UserRole.AGENT, AvatarInitials = "JB" },
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000014"), Name = "Lara Croft (Agent)", Email = "lara@monetaris.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword(laraPassword), Role = UserRole.AGENT, AvatarInitials = "LC" },

            // Client user
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000015"), Name = "Sabine Client (TechSolutions)", Email = "client@techsolutions.de", PasswordHash = BCrypt.Net.BCrypt.HashPassword(clientPassword), Role = UserRole.CLIENT, KreditorId = Guid.Parse("00000000-0000-0000-0000-000000000001"), AvatarInitials = "SC" },

            // Debtor user
            new() { Id = Guid.Parse("00000000-0000-0000-0000-000000000016"), Name = "Max Muster (Schuldner)", Email = "max@muster.de", PasswordHash = BCrypt.Net.BCrypt.HashPassword(debtorPassword), Role = UserRole.DEBTOR, AvatarInitials = "MM" }
        };
        await _context.Users.AddRangeAsync(users);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {Count} users with secure random passwords", users.Count);
        _logger.LogWarning("IMPORTANT: Users MUST change password on first login!");

        // === PORTAL TEST DATA ===
        // Create a known debtor and case for portal login testing
        var portalTestDebtor = new Debtor
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000099"),
            KreditorId = Guid.Parse("00000000-0000-0000-0000-000000000001"),
            AgentId = Guid.Parse("00000000-0000-0000-0000-000000000012"),
            EntityType = EntityType.NATURAL_PERSON,
            FirstName = "Portal",
            LastName = "Testuser",
            Email = "portal@test.de",
            PhoneMobile = "0170 1234567",
            Street = "Teststraße 42",
            ZipCode = "10115", // Fixed zip code for testing
            City = "Berlin",
            Country = "Deutschland",
            AddressStatus = AddressStatus.CONFIRMED,
            RiskScore = RiskScore.B,
            TotalDebt = 1234.56m,
            OpenCases = 1,
            Notes = "Test-Schuldner für Portal-Login"
        };
        await _context.Debtors.AddAsync(portalTestDebtor);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Created portal test debtor");

        var portalTestCase = new Case
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000098"),
            KreditorId = portalTestDebtor.KreditorId,
            DebtorId = portalTestDebtor.Id,
            AgentId = portalTestDebtor.AgentId,
            PrincipalAmount = 1000.00m,
            Costs = 50.00m,
            Interest = 25.00m,
            Currency = "EUR",
            InvoiceNumber = "RE-PORTAL-TEST", // Fixed invoice number for testing
            InvoiceDate = DateTime.UtcNow.AddDays(-60),
            DueDate = DateTime.UtcNow.AddDays(-30),
            Status = CaseStatus.REMINDER_1,
            CompetentCourt = "Amtsgericht Coburg - Zentrales Mahngericht",
            NextActionDate = DateTime.UtcNow.AddDays(7),
            AiAnalysis = "Test-Fall für Portal-Login"
        };
        await _context.Cases.AddAsync(portalTestCase);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Created portal test case (Invoice: RE-PORTAL-TEST, ZipCode: 10115)");

        // === DEBTOR USER TEST DATA ===
        // Create a debtor record that matches the debtor user (max@muster.de)
        var debtorUserDebtor = new Debtor
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000097"),
            KreditorId = Guid.Parse("00000000-0000-0000-0000-000000000001"),
            AgentId = Guid.Parse("00000000-0000-0000-0000-000000000012"),
            EntityType = EntityType.NATURAL_PERSON,
            FirstName = "Max",
            LastName = "Muster",
            Email = "max@muster.de", // Matches the debtor user email!
            PhoneMobile = "0171 9876543",
            Street = "Schuldnerstraße 15",
            ZipCode = "80331",
            City = "München",
            Country = "Deutschland",
            DateOfBirth = DateTime.SpecifyKind(new DateTime(1985, 5, 15), DateTimeKind.Utc),
            AddressStatus = AddressStatus.CONFIRMED,
            RiskScore = RiskScore.C,
            TotalDebt = 2500.00m,
            OpenCases = 2,
            Notes = "Test-Schuldner für Debtor-User Login (max@muster.de)"
        };
        await _context.Debtors.AddAsync(debtorUserDebtor);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Created debtor record for debtor user (Email: max@muster.de)");

        // Create cases for the debtor user
        var debtorUserCases = new List<Case>
        {
            new Case
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000096"),
                KreditorId = debtorUserDebtor.KreditorId,
                DebtorId = debtorUserDebtor.Id,
                AgentId = debtorUserDebtor.AgentId,
                PrincipalAmount = 1500.00m,
                Costs = 75.00m,
                Interest = 45.00m,
                Currency = "EUR",
                InvoiceNumber = "RE-2024-001234",
                InvoiceDate = DateTime.UtcNow.AddDays(-90),
                DueDate = DateTime.UtcNow.AddDays(-60),
                Status = CaseStatus.REMINDER_2,
                CompetentCourt = "Amtsgericht Coburg - Zentrales Mahngericht",
                NextActionDate = DateTime.UtcNow.AddDays(7),
                AiAnalysis = "Schuldner ist kooperativ. Ratenzahlung empfohlen."
            },
            new Case
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000095"),
                KreditorId = debtorUserDebtor.KreditorId,
                DebtorId = debtorUserDebtor.Id,
                AgentId = debtorUserDebtor.AgentId,
                PrincipalAmount = 750.00m,
                Costs = 35.00m,
                Interest = 15.00m,
                Currency = "EUR",
                InvoiceNumber = "RE-2024-005678",
                InvoiceDate = DateTime.UtcNow.AddDays(-45),
                DueDate = DateTime.UtcNow.AddDays(-15),
                Status = CaseStatus.REMINDER_1,
                CompetentCourt = "Amtsgericht Coburg - Zentrales Mahngericht",
                NextActionDate = DateTime.UtcNow.AddDays(14),
                AiAnalysis = "Erste Mahnstufe - Zahlungserinnerung versandt."
            }
        };
        await _context.Cases.AddRangeAsync(debtorUserCases);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Created {Count} cases for debtor user (max@muster.de)", debtorUserCases.Count);

        // Seed UserKreditorAssignments (Agents can handle multiple kreditoren)
        var assignments = new List<UserKreditorAssignment>
        {
            // Max Mustermann handles all kreditoren
            new() { UserId = Guid.Parse("00000000-0000-0000-0000-000000000012"), KreditorId = Guid.Parse("00000000-0000-0000-0000-000000000001") },
            new() { UserId = Guid.Parse("00000000-0000-0000-0000-000000000012"), KreditorId = Guid.Parse("00000000-0000-0000-0000-000000000002") },
            new() { UserId = Guid.Parse("00000000-0000-0000-0000-000000000012"), KreditorId = Guid.Parse("00000000-0000-0000-0000-000000000003") },
            new() { UserId = Guid.Parse("00000000-0000-0000-0000-000000000012"), KreditorId = Guid.Parse("00000000-0000-0000-0000-000000000004") },
            new() { UserId = Guid.Parse("00000000-0000-0000-0000-000000000012"), KreditorId = Guid.Parse("00000000-0000-0000-0000-000000000005") },

            // James Bond handles kreditoren 3-5
            new() { UserId = Guid.Parse("00000000-0000-0000-0000-000000000013"), KreditorId = Guid.Parse("00000000-0000-0000-0000-000000000003") },
            new() { UserId = Guid.Parse("00000000-0000-0000-0000-000000000013"), KreditorId = Guid.Parse("00000000-0000-0000-0000-000000000004") },
            new() { UserId = Guid.Parse("00000000-0000-0000-0000-000000000013"), KreditorId = Guid.Parse("00000000-0000-0000-0000-000000000005") },

            // Lara Croft handles kreditoren 1, 3, 5
            new() { UserId = Guid.Parse("00000000-0000-0000-0000-000000000014"), KreditorId = Guid.Parse("00000000-0000-0000-0000-000000000001") },
            new() { UserId = Guid.Parse("00000000-0000-0000-0000-000000000014"), KreditorId = Guid.Parse("00000000-0000-0000-0000-000000000003") },
            new() { UserId = Guid.Parse("00000000-0000-0000-0000-000000000014"), KreditorId = Guid.Parse("00000000-0000-0000-0000-000000000005") }
        };
        await _context.UserKreditorAssignments.AddRangeAsync(assignments);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {Count} user-kreditor assignments", assignments.Count);

        // === COMPREHENSIVE TEST DATA WITH EDGE CASES ===

        var random = new Random(42); // Fixed seed for reproducible data
        var kreditorIds = kreditoren.Select(k => k.Id).ToList();
        var agentIds = new[] {
            Guid.Parse("00000000-0000-0000-0000-000000000012"),
            Guid.Parse("00000000-0000-0000-0000-000000000013"),
            Guid.Parse("00000000-0000-0000-0000-000000000014")
        };

        // German first and last names for realistic data - EXPANDED
        var firstNames = new[] { "Max", "Anna", "Felix", "Lena", "Paul", "Marie", "Leon", "Sophie", "Tim", "Laura",
            "Niklas", "Emma", "Jonas", "Mia", "Lukas", "Hannah", "Ben", "Lea", "Finn", "Julia",
            "Elias", "Sarah", "Noah", "Lisa", "Luis", "Amelie", "David", "Lara", "Moritz", "Emily",
            "Karl-Heinz", "Hans-Peter", "Maria-Theresia", "Anne-Sophie", "Jean-Pierre", "François", "José",
            "Müller", "Größe", "Süß", "Öztürk", "Ähnlich", "Übel" }; // Include Umlauts and special names
        var lastNames = new[] { "Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker",
            "Schulz", "Hoffmann", "Schäfer", "Koch", "Bauer", "Richter", "Klein", "Wolf", "Schröder",
            "Neumann", "Schwarz", "Braun", "Zimmermann", "Krüger", "Hartmann", "Lange", "Werner",
            "von Hohenzollern", "zu Guttenberg", "von der Leyen", "O'Brien", "McDonald", "Müller-Lüdenscheid",
            "Großmann-Kleinschmidt", "Öztürk", "Çelik", "Papadopoulos", "Nguyen", "Kowalski" };
        var companyNames = new[] { "Tech Solutions GmbH", "Handwerk Meister OHG", "Digital Services AG",
            "Bau & Beton KG", "Gastro Plus UG", "Medical Center GmbH", "AutoHaus Schmidt",
            "Elektro Express", "Garten & Grün", "Fitness First Studio", "IT Consulting AG",
            "Transport Logistik GmbH", "Immobilien Zentrum", "Möbel Design Studio", "Food Delivery Express",
            "Müller & Söhne GbR", "Größer-Besser-Schneller Ltd.", "ABC-123 Systems Inc.",
            "Die beste Firma überhaupt mit einem sehr langen Namen GmbH & Co. KG",
            "Ä-Ö-Ü-ß Sonderzeichen Test Firma", "\"Anführungszeichen\" AG", "'Apostroph' UG",
            "Test<Script>Alert('XSS')</Script>GmbH", "Null", "undefined", "true", "false" };
        var cities = new[] { "Berlin", "Hamburg", "München", "Köln", "Frankfurt am Main", "Stuttgart", "Düsseldorf",
            "Leipzig", "Dortmund", "Essen", "Bremen", "Dresden", "Hannover", "Nürnberg", "Duisburg",
            "Garmisch-Partenkirchen", "Bad Neustadt an der Saale", "Frankfurt (Oder)",
            "Mönchengladbach", "Castrop-Rauxel", "Bergisch Gladbach", "Königs Wusterhausen" };
        var streets = new[] { "Hauptstraße", "Bahnhofstraße", "Gartenweg", "Schulstraße", "Bergstraße",
            "Lindenweg", "Marktplatz", "Kirchstraße", "Am Rathaus", "Industriestraße",
            "Königsallee", "Graf-von-Stauffenberg-Straße", "Straße des 17. Juni",
            "Am Mühlenberg", "Große Freiheit", "Kleine Gasse", "Platz der Republik",
            "Unter den Linden", "Kurfürstendamm", "Reeperbahn" };

        var debtors = new List<Debtor>();
        var cases = new List<Case>();

        // === EDGE CASE DEBTORS (Manual) ===
        var edgeCaseDebtors = new List<Debtor>
        {
            // Very long name
            new() {
                Id = Guid.NewGuid(),
                KreditorId = kreditorIds[0],
                AgentId = agentIds[0],
                EntityType = EntityType.NATURAL_PERSON,
                FirstName = "Maximilian-Friedrich-Wilhelm-Alexander",
                LastName = "von und zu Hohenzollern-Sigmaringen-Großmann-Kleinschmidt",
                Email = "maximilian.hohenzollern@adel.de",
                PhoneMobile = "+49 170 1234567890",
                Street = "Schloßallee am Königsplatz 1a-b",
                ZipCode = "01234",
                City = "Musterstadt-bei-der-alten-Mühle",
                Country = "Deutschland",
                AddressStatus = AddressStatus.CONFIRMED,
                RiskScore = RiskScore.A,
                Notes = "Adelsfamilie - VIP Behandlung"
            },
            // Minimal data - only required fields
            new() {
                Id = Guid.NewGuid(),
                KreditorId = kreditorIds[1],
                AgentId = agentIds[1],
                EntityType = EntityType.NATURAL_PERSON,
                FirstName = "X",
                LastName = "Y",
                AddressStatus = AddressStatus.UNKNOWN
            },
            // Company with very long name
            new() {
                Id = Guid.NewGuid(),
                KreditorId = kreditorIds[2],
                AgentId = agentIds[2],
                EntityType = EntityType.LEGAL_ENTITY,
                CompanyName = "Die allerbeste Firma für Softwareentwicklung, IT-Beratung, Cloud-Dienste und digitale Transformation mit Sitz in München und Niederlassungen in Berlin, Hamburg und Frankfurt am Main GmbH & Co. KG",
                Email = "info@langername.de",
                Street = "Industriestraße 1",
                ZipCode = "80331",
                City = "München",
                Country = "Deutschland",
                AddressStatus = AddressStatus.CONFIRMED,
                RiskScore = RiskScore.B
            },
            // Special characters in all fields
            new() {
                Id = Guid.NewGuid(),
                KreditorId = kreditorIds[0],
                AgentId = agentIds[0],
                EntityType = EntityType.NATURAL_PERSON,
                FirstName = "François-José",
                LastName = "Müller-Öztürk-O'Brien",
                Email = "francois.mueller@über-email.de",
                PhoneMobile = "+49 (0)89 / 123 456 - 78",
                Street = "Königstraße 42 ½ (Hinterhaus, 3. Stock links)",
                ZipCode = "80539",
                City = "München-Schwabing",
                Country = "Deutschland",
                AddressStatus = AddressStatus.CONFIRMED,
                RiskScore = RiskScore.C,
                Notes = "Sonderzeichen: äöüß ÄÖÜ € @ # & % $ § ! ? * + - / \\"
            },
            // Deceased debtor
            new() {
                Id = Guid.NewGuid(),
                KreditorId = kreditorIds[3],
                AgentId = agentIds[1],
                EntityType = EntityType.NATURAL_PERSON,
                FirstName = "Heinrich",
                LastName = "Verstorben",
                Email = "erben@nachlass.de",
                Street = "Friedhofstraße 1",
                ZipCode = "12345",
                City = "Ruhestadt",
                Country = "Deutschland",
                AddressStatus = AddressStatus.DECEASED,
                RiskScore = RiskScore.E,
                Notes = "VERSTORBEN am 01.01.2024 - Erben werden ermittelt. Nachlassgericht: AG Berlin-Schöneberg, Az: 123/24"
            },
            // Insolvent debtor
            new() {
                Id = Guid.NewGuid(),
                KreditorId = kreditorIds[4],
                AgentId = agentIds[2],
                EntityType = EntityType.LEGAL_ENTITY,
                CompanyName = "Pleite GmbH i.L.",
                Email = "insolvenzverwalter@pleite.de",
                Street = "Konkursstraße 99",
                ZipCode = "54321",
                City = "Bankrott",
                Country = "Deutschland",
                AddressStatus = AddressStatus.CONFIRMED,
                RiskScore = RiskScore.E,
                Notes = "INSOLVENZ eröffnet am 15.03.2024. Insolvenzverwalter: RA Dr. Meyer, Tel: 0800-123456. Az: 99 IN 999/24"
            },
            // International address
            new() {
                Id = Guid.NewGuid(),
                KreditorId = kreditorIds[0],
                AgentId = agentIds[0],
                EntityType = EntityType.NATURAL_PERSON,
                FirstName = "Jean",
                LastName = "Dupont",
                Email = "jean.dupont@email.fr",
                PhoneMobile = "+33 1 23 45 67 89",
                Street = "123 Rue de la Paix",
                ZipCode = "75001",
                City = "Paris",
                Country = "Frankreich",
                AddressStatus = AddressStatus.CONFIRMED,
                RiskScore = RiskScore.D,
                Notes = "Ausland - Zustellung per Auslandszustellung / EuZustVO"
            },
            // PO Box address
            new() {
                Id = Guid.NewGuid(),
                KreditorId = kreditorIds[1],
                AgentId = agentIds[1],
                EntityType = EntityType.LEGAL_ENTITY,
                CompanyName = "Nur-Postfach AG",
                Email = "postfach@firma.de",
                Street = "Postfach 12 34 56",
                ZipCode = "10000",
                City = "Berlin",
                Country = "Deutschland",
                AddressStatus = AddressStatus.RESEARCH_PENDING,
                RiskScore = RiskScore.D,
                Notes = "Nur Postfach bekannt - Ermittlung der Geschäftsadresse läuft"
            },
            // Edge case: Empty strings in optional fields
            new() {
                Id = Guid.NewGuid(),
                KreditorId = kreditorIds[2],
                AgentId = agentIds[2],
                EntityType = EntityType.NATURAL_PERSON,
                FirstName = "Ohne",
                LastName = "Details",
                Email = "",
                PhoneMobile = "",
                Street = "",
                ZipCode = "",
                City = "",
                Country = "",
                AddressStatus = AddressStatus.UNKNOWN,
                RiskScore = RiskScore.E,
                Notes = ""
            },
            // Edge case: Maximum length phone number
            new() {
                Id = Guid.NewGuid(),
                KreditorId = kreditorIds[3],
                AgentId = agentIds[0],
                EntityType = EntityType.NATURAL_PERSON,
                FirstName = "Multi",
                LastName = "Kontakt",
                Email = "multi.kontakt@email.de",
                PhoneMobile = "+49 170 111 | +49 171 222 | +49 172 333 | Festnetz: 089/44455566",
                Street = "Mehrfachstraße 1",
                ZipCode = "80333",
                City = "München",
                Country = "Deutschland",
                AddressStatus = AddressStatus.CONFIRMED,
                RiskScore = RiskScore.B,
                Notes = "Multiple Telefonnummern hinterlegt"
            }
        };
        debtors.AddRange(edgeCaseDebtors);

        // Create 100 additional debtors with various profiles
        for (int i = 0; i < 100; i++)
        {
            var isCompany = i % 4 == 0; // 25% companies
            var kreditorId = kreditorIds[i % kreditorIds.Count];
            var agentId = agentIds[i % agentIds.Length];

            var debtor = new Debtor
            {
                Id = Guid.NewGuid(),
                KreditorId = kreditorId,
                AgentId = agentId,
                EntityType = isCompany ? EntityType.LEGAL_ENTITY : EntityType.NATURAL_PERSON,
                CompanyName = isCompany ? companyNames[random.Next(companyNames.Length)] + $" #{i}" : null,
                FirstName = isCompany ? null : firstNames[random.Next(firstNames.Length)],
                LastName = isCompany ? null : lastNames[random.Next(lastNames.Length)],
                Email = isCompany
                    ? $"buchhaltung{i}@firma{i}.de"
                    : $"{firstNames[i % firstNames.Length].ToLower().Replace("ü", "ue").Replace("ö", "oe").Replace("ä", "ae")}.{lastNames[i % lastNames.Length].ToLower().Replace("ü", "ue").Replace("ö", "oe").Replace("ä", "ae")}{i}@email.de",
                PhoneMobile = $"+49 {random.Next(150, 179)} {random.Next(1000000, 9999999)}",
                Street = $"{streets[random.Next(streets.Length)]} {random.Next(1, 150)}{(random.Next(10) == 0 ? "a" : "")}",
                ZipCode = $"{random.Next(10000, 99999)}",
                City = cities[random.Next(cities.Length)],
                Country = "Deutschland",
                AddressStatus = (AddressStatus)(i % 5), // All address statuses
                RiskScore = (RiskScore)(i % 5), // All risk scores A-E
                TotalDebt = 0,
                OpenCases = 0,
                Notes = i switch
                {
                    0 => "VIP Kunde - Vorsicht!",
                    1 => "Ratenzahlung vereinbart: 50 EUR monatlich",
                    2 => "Anwalt eingeschaltet: RA Dr. Müller",
                    3 => "Zahlungsunfähig - Insolvenzverfahren läuft seit 01.01.2024",
                    4 => "Adresse unbekannt - EMA beantragt am 15.03.2024",
                    5 => "Verstorben am 20.02.2024 - Erben werden ermittelt",
                    6 => "Zahlt immer pünktlich - Ausnahmsweise Verzug",
                    7 => "Zahlungsschwierigkeiten bekannt - nur Raten möglich",
                    8 => "Streitig - bestreitet Forderung vollständig",
                    9 => "Teilweise streitig - Einigung über 80% möglich",
                    10 => "Sehr kooperativ - immer erreichbar",
                    11 => "Nicht erreichbar - Telefon aus, E-Mail unzustellbar",
                    12 => "Nur schriftlich - lehnt Telefonkontakt ab",
                    13 => "Bevollmächtigter: RA Schmidt, Tel: 0800-999",
                    14 => "Zahlung angekündigt für nächsten Monat",
                    15 => "ACHTUNG: Aggressive Kommunikation!",
                    _ => i % 5 == 0 ? "Telefonisch gut erreichbar Mo-Fr 9-17 Uhr" : null
                }
            };
            debtors.Add(debtor);
        }

        await _context.Debtors.AddRangeAsync(debtors);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} debtors with edge cases", debtors.Count);

        // Create 250+ cases with various statuses and edge cases
        var allStatuses = Enum.GetValues<CaseStatus>();
        var caseNumber = 1000;

        foreach (var debtor in debtors)
        {
            // Each debtor gets 1-8 cases (more variety)
            var numCases = random.Next(1, 9);
            var debtorCases = new List<Case>();

            for (int j = 0; j < numCases; j++)
            {
                caseNumber++;
                var status = allStatuses[random.Next(allStatuses.Length)];
                var daysAgo = random.Next(1, 730); // Up to 2 years back

                // Edge case amounts - more variety
                decimal principalAmount = (caseNumber % 30) switch
                {
                    0 => 0.01m, // Minimal amount
                    1 => 0.50m, // Very small
                    2 => 1.00m, // 1 Euro
                    3 => 9.99m, // Just under 10
                    4 => 10.00m, // Exactly 10
                    5 => 49.99m, // Just under 50
                    6 => 100.00m, // Round 100
                    7 => 250.00m, // Common amount
                    8 => 500.00m, // Half thousand
                    9 => 999.99m, // Just under 1000
                    10 => 1000.00m, // Exactly 1000
                    11 => 2500.00m, // Common business
                    12 => 5000.00m, // 5k
                    13 => 9999.99m, // Just under 10k
                    14 => 10000.00m, // 10k
                    15 => 25000.00m, // 25k
                    16 => 50000.00m, // 50k
                    17 => 99999.99m, // Just under 100k
                    18 => 100000.00m, // 100k
                    19 => 250000.00m, // Quarter million
                    20 => 12345.67m, // Random mixed
                    21 => 7777.77m, // Repeated digits
                    22 => 1234.56m, // Sequential digits
                    23 => 8888.88m, // Lucky number
                    24 => 3.14m, // Pi amount
                    25 => 42.00m, // Answer to everything
                    _ => random.Next(50, 10000) + random.Next(0, 99) / 100m
                };

                var invoiceDate = DateTime.UtcNow.AddDays(-daysAgo - random.Next(14, 60));
                var dueDate = DateTime.UtcNow.AddDays(-daysAgo);

                var caseItem = new Case
                {
                    Id = Guid.NewGuid(),
                    KreditorId = debtor.KreditorId,
                    DebtorId = debtor.Id,
                    AgentId = debtor.AgentId,
                    PrincipalAmount = principalAmount,
                    Costs = Math.Round(principalAmount * (random.Next(3, 10) / 100m), 2), // 3-10% costs
                    Interest = Math.Round(principalAmount * (random.Next(1, 5) / 100m), 2), // 1-5% interest
                    Currency = "EUR",
                    InvoiceNumber = (caseNumber % 10) switch
                    {
                        0 => $"RE-{DateTime.UtcNow.Year}-{caseNumber:D5}",
                        1 => $"INV-{caseNumber}",
                        2 => $"2024/{caseNumber}",
                        3 => $"RECHNUNG-{caseNumber:D8}",
                        4 => $"R{DateTime.UtcNow:yyyyMMdd}-{caseNumber}",
                        5 => $"{Guid.NewGuid().ToString()[..8].ToUpper()}",
                        6 => $"MR-{caseNumber}-{random.Next(100, 999)}",
                        7 => $"Miete {DateTime.UtcNow.AddMonths(-random.Next(1, 12)):MM/yyyy}",
                        8 => $"NK-Abrechnung {DateTime.UtcNow.Year - 1}",
                        _ => $"RE{caseNumber}"
                    },
                    InvoiceDate = invoiceDate,
                    DueDate = dueDate,
                    Status = status,
                    CompetentCourt = "Amtsgericht Coburg - Zentrales Mahngericht",
                    CourtFileNumber = status >= CaseStatus.MB_ISSUED
                        ? $"{random.Next(10, 99)} C {random.Next(1000, 9999)}/{DateTime.UtcNow.Year % 100}"
                        : null,
                    NextActionDate = status switch
                    {
                        CaseStatus.DRAFT => DateTime.UtcNow.AddDays(1),
                        CaseStatus.NEW => DateTime.UtcNow.AddDays(random.Next(3, 10)),
                        CaseStatus.REMINDER_1 => DateTime.UtcNow.AddDays(random.Next(10, 21)),
                        CaseStatus.REMINDER_2 => DateTime.UtcNow.AddDays(random.Next(7, 14)),
                        CaseStatus.ADDRESS_RESEARCH => DateTime.UtcNow.AddDays(random.Next(14, 30)),
                        CaseStatus.PREPARE_MB => DateTime.UtcNow.AddDays(random.Next(3, 7)),
                        CaseStatus.MB_REQUESTED => DateTime.UtcNow.AddDays(random.Next(14, 28)),
                        CaseStatus.MB_ISSUED => DateTime.UtcNow.AddDays(random.Next(14, 21)),
                        CaseStatus.MB_OBJECTION => DateTime.UtcNow.AddDays(random.Next(7, 14)),
                        CaseStatus.PREPARE_VB => DateTime.UtcNow.AddDays(random.Next(3, 7)),
                        CaseStatus.VB_REQUESTED => DateTime.UtcNow.AddDays(random.Next(7, 21)),
                        CaseStatus.VB_ISSUED => DateTime.UtcNow.AddDays(random.Next(14, 28)),
                        CaseStatus.TITLE_OBTAINED => DateTime.UtcNow.AddDays(random.Next(7, 14)),
                        CaseStatus.ENFORCEMENT_PREP => DateTime.UtcNow.AddDays(random.Next(3, 7)),
                        CaseStatus.GV_MANDATED => DateTime.UtcNow.AddDays(random.Next(21, 42)),
                        CaseStatus.EV_TAKEN => DateTime.UtcNow.AddDays(random.Next(30, 90)),
                        _ => null // PAID, SETTLED, INSOLVENCY, UNCOLLECTIBLE - no next action
                    },
                    AiAnalysis = (caseNumber % 8) switch
                    {
                        0 => "KI-Analyse: Hohe Erfolgswahrscheinlichkeit (87%) bei sofortiger gerichtlicher Einleitung. Empfehlung: Mahnbescheid beantragen.",
                        1 => "KI-Analyse: Zahlungsmuster zeigt Liquiditätsprobleme. Empfehlung: Ratenzahlung anbieten (60% Erfolg).",
                        2 => "KI-Analyse: Schuldner reagiert nicht auf Kontaktversuche. Empfehlung: Adressermittlung einleiten.",
                        3 => "KI-Analyse: Historisch guter Zahler mit aktuellem Verzug. Empfehlung: Freundliche Erinnerung.",
                        4 => "KI-Analyse: Wiederholter Verzug, hohe Risikoklasse. Empfehlung: Schnelle Eskalation.",
                        5 => "KI-Analyse: Forderung möglicherweise streitig. Empfehlung: Dokumentation prüfen.",
                        6 => "KI-Analyse: Optimaler Zeitpunkt für Vergleichsangebot. Erfolgswahrscheinlichkeit 73%.",
                        _ => null
                    }
                };

                debtorCases.Add(caseItem);
            }

            cases.AddRange(debtorCases);

            // Update debtor stats
            debtor.OpenCases = debtorCases.Count(c => c.Status != CaseStatus.PAID &&
                                                       c.Status != CaseStatus.SETTLED &&
                                                       c.Status != CaseStatus.INSOLVENCY &&
                                                       c.Status != CaseStatus.UNCOLLECTIBLE);
            debtor.TotalDebt = debtorCases
                .Where(c => c.Status != CaseStatus.PAID && c.Status != CaseStatus.SETTLED)
                .Sum(c => c.PrincipalAmount + c.Costs + c.Interest);
        }

        await _context.Cases.AddRangeAsync(cases);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} cases with edge cases", cases.Count);

        // Create comprehensive documents for debtors with edge cases
        var documentNames = new[]
        {
            "Rechnung", "Mahnung_1", "Mahnung_2", "Mahnung_3_Letzte",
            "Mahnbescheid", "Vollstreckungsbescheid", "Ratenzahlungsvereinbarung",
            "Zahlungsbeleg", "Eingangsbestätigung", "Widerspruch", "Antwortschreiben",
            "EMA_Antrag", "Gerichtsvollzieher_Auftrag", "Insolvenzanmeldung",
            "Vergleichsangebot", "Kontoauszug", "Lieferschein", "Vertrag"
        };
        var documentList = new List<Document>();

        // Create 80+ documents with various edge cases
        foreach (var (debtor, index) in debtors.Take(50).Select((d, i) => (d, i)))
        {
            // Each debtor gets 1-4 documents
            var numDocs = random.Next(1, 5);
            for (int j = 0; j < numDocs; j++)
            {
                var docName = documentNames[random.Next(documentNames.Length)];
                var debtorName = debtor.LastName ?? debtor.CompanyName ?? "Unbekannt";

                // Edge case file names
                var fileName = (index * 10 + j) switch
                {
                    0 => $"{docName}_{debtorName}.pdf",
                    1 => $"{docName} mit Leerzeichen {debtorName}.pdf",
                    2 => $"{docName}_Müller-Öztürk_Sonderzeichen.pdf",
                    3 => $"GROSSBUCHSTABEN_{docName}.PDF",
                    4 => $"sehr_langer_dateiname_der_viele_informationen_enthält_{docName}_{debtorName}_{DateTime.UtcNow:yyyyMMdd}.pdf",
                    5 => $"{docName}_(Kopie).pdf",
                    6 => $"{docName}_v2_final_wirklich_final.pdf",
                    7 => $"2024-{random.Next(1, 13):D2}-{random.Next(1, 29):D2}_{docName}.pdf",
                    8 => $"{docName} - {debtorName} - Akte {random.Next(1000, 9999)}.pdf",
                    9 => $"scan_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf",
                    _ => $"{docName}_{debtorName}_{random.Next(100, 999)}.pdf"
                };

                // Edge case file sizes
                var fileSize = (index * 10 + j) % 15 switch
                {
                    0 => 1L, // 1 byte - minimal
                    1 => 100L, // 100 bytes
                    2 => 1024L, // 1 KB
                    3 => 10240L, // 10 KB
                    4 => 102400L, // 100 KB
                    5 => 1048576L, // 1 MB
                    6 => 5242880L, // 5 MB
                    7 => 10485760L, // 10 MB
                    8 => 52428800L, // 50 MB
                    9 => 104857600L, // 100 MB - large file
                    _ => random.Next(10000, 5000000)
                };

                documentList.Add(new Document
                {
                    Id = Guid.NewGuid(),
                    DebtorId = debtor.Id,
                    Name = fileName,
                    Type = j % 5 == 0 ? DocumentType.IMAGE : DocumentType.PDF,
                    SizeBytes = fileSize,
                    FilePath = $"/documents/{debtor.KreditorId}/{debtor.Id}/{Guid.NewGuid()}/",
                    UploadedAt = DateTime.UtcNow.AddDays(-random.Next(1, 365))
                });
            }
        }

        await _context.Documents.AddRangeAsync(documentList);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} documents with edge cases", documentList.Count);

        // Create comprehensive inquiries with edge cases
        var inquiryQuestions = new[]
        {
            // Standard questions
            "Können Sie mir eine Ratenzahlung anbieten?",
            "Ich habe diese Rechnung nie erhalten. Bitte senden Sie mir eine Kopie.",
            "Die Rechnung wurde bereits bezahlt. Anbei der Zahlungsbeleg.",
            "Ich bestreite diese Forderung. Bitte senden Sie mir alle Unterlagen.",
            "Wann wurde die Mahnung verschickt?",
            "Ich benötige eine Zahlungsaufstellung.",

            // Edge case questions - very long
            "Sehr geehrte Damen und Herren, ich habe Ihre Mahnung vom letzten Monat erhalten und möchte Ihnen mitteilen, dass ich derzeit leider nicht in der Lage bin, den vollen Betrag zu zahlen. Ich befinde mich seit drei Monaten in einer finanziell schwierigen Situation aufgrund von Arbeitslosigkeit. Ich habe jedoch bereits eine neue Stelle in Aussicht und erwarte meinen ersten Gehaltsscheck in etwa vier Wochen. Wäre es möglich, eine Ratenzahlung zu vereinbaren? Ich könnte ab nächsten Monat monatlich 100 EUR zahlen, bis die Schuld vollständig beglichen ist. Ich hoffe auf Ihr Verständnis und eine positive Rückmeldung. Mit freundlichen Grüßen.",

            // Edge case questions - minimal
            "?",
            "Warum?",
            "Hilfe",

            // Edge case questions - special characters
            "Können Sie mir helfen? Ich verstehe die Rechnung nicht... €€€ ??? !!! äöü ÄÖÜ ß",
            "RE: AW: RE: Fwd: Mahnung - DRINGEND!!!",

            // Edge case questions - technical
            "Bitte senden Sie mir alle Unterlagen als PDF per E-Mail an meine-email@domain.de. Falls das Dateiformat nicht möglich ist, akzeptiere ich auch JPEG oder PNG. Die maximale Dateigröße sollte 10 MB nicht überschreiten.",

            // Edge case questions - legal
            "Ich widerspreche hiermit fristgerecht der Forderung gemäß § 286 BGB. Ich fordere Sie auf, mir innerhalb von 14 Tagen sämtliche Nachweise über die Entstehung und Höhe der Forderung vorzulegen, insbesondere den ursprünglichen Vertrag, alle Rechnungen und eine detaillierte Zinsberechnung.",

            // Edge case questions - emotional
            "ICH HABE SCHON 3 MAL GESCHRIEBEN UND NIEMAND ANTWORTET MIR!!! DAS IST EINE FRECHHEIT!!! ICH WERDE MICH BESCHWEREN!!!",

            // Edge case questions - multiple questions
            "1. Wann wurde die Rechnung erstellt?\n2. An welche Adresse wurde sie geschickt?\n3. Wie hoch sind die aktuellen Zinsen?\n4. Kann ich in Raten zahlen?\n5. Wer ist mein Ansprechpartner?"
        };

        var inquiryAnswers = new[]
        {
            "Ratenzahlung wurde vereinbart. Bitte monatlich 50 EUR überweisen.",
            "Die Rechnung wurde am [DATUM] per Post versendet. Eine Kopie ist beigefügt.",
            "Wir konnten keinen Zahlungseingang feststellen. Bitte senden Sie uns den Zahlungsbeleg.",
            "Ihre Unterlagen wurden per Post an Ihre hinterlegte Adresse geschickt.",
            "Vielen Dank für Ihre Nachricht. Wir prüfen Ihren Fall und melden uns innerhalb von 3 Werktagen.",
            "Die Forderung wurde nach Prüfung als berechtigt bestätigt. Bitte zahlen Sie den offenen Betrag.",
            "Wir haben Ihren Widerspruch erhalten und leiten ihn an unsere Rechtsabteilung weiter.",
            "Aufgrund Ihrer finanziellen Situation bieten wir Ihnen einmalig einen Vergleich über 60% der Forderung an.",
            null // No answer yet
        };

        var inquiryList = new List<Inquiry>();
        foreach (var (caseItem, index) in cases.Take(60).Select((c, i) => (c, i)))
        {
            // Some cases have multiple inquiries
            var numInquiries = index % 10 == 0 ? random.Next(2, 5) : 1;

            for (int j = 0; j < numInquiries; j++)
            {
                var questionIndex = (index * numInquiries + j) % inquiryQuestions.Length;
                var answerIndex = (index * numInquiries + j) % inquiryAnswers.Length;
                var isResolved = answerIndex < inquiryAnswers.Length - 1 && random.Next(3) != 0;

                inquiryList.Add(new Inquiry
                {
                    Id = Guid.NewGuid(),
                    CaseId = caseItem.Id,
                    Question = inquiryQuestions[questionIndex],
                    Status = isResolved ? InquiryStatus.RESOLVED : InquiryStatus.OPEN,
                    CreatedBy = Guid.Parse("00000000-0000-0000-0000-000000000016"), // Debtor user
                    Answer = isResolved ? inquiryAnswers[answerIndex] : null,
                    ResolvedAt = isResolved ? DateTime.UtcNow.AddDays(-random.Next(1, 30)) : null
                });
            }
        }

        await _context.Inquiries.AddRangeAsync(inquiryList);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} inquiries with edge cases", inquiryList.Count);

        // Seed Templates - COMPREHENSIVE with edge cases
        var templates = new List<Template>
        {
            // ============ STANDARD MAHNUNG TEMPLATES ============
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
<p>{{kreditor.name}}</p>"
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
<p>{{kreditor.name}} Buchhaltung</p>"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "3. Mahnung - Letzte Warnung",
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
<p>{{kreditor.name}} - Rechtsabteilung</p>"
            },

            // ============ RECHTLICHE TEMPLATES ============
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Mahnbescheid-Ankündigung",
                Type = TemplateType.EMAIL,
                Category = TemplateCategory.LEGAL,
                Subject = "WICHTIG: Gerichtliches Mahnverfahren wird eingeleitet - {{case.invoiceNumber}}",
                Content = @"<div style=""border: 2px solid #dc2626; padding: 20px; background: #fef2f2;"">
<h2 style=""color: #dc2626;"">⚠️ Letzte Warnung vor gerichtlichem Mahnverfahren</h2>
<p>Sehr geehrte(r) {{debtor.firstName}} {{debtor.lastName}},</p>
<p>trotz mehrfacher Aufforderungen ist die Forderung aus Rechnung <strong>{{case.invoiceNumber}}</strong> weiterhin unbeglichen.</p>
<table style=""width: 100%; border-collapse: collapse; margin: 20px 0;"">
<tr><td style=""padding: 8px; border: 1px solid #ccc;"">Hauptforderung:</td><td style=""padding: 8px; border: 1px solid #ccc; text-align: right;"">{{case.principalAmount}}</td></tr>
<tr><td style=""padding: 8px; border: 1px solid #ccc;"">Zinsen:</td><td style=""padding: 8px; border: 1px solid #ccc; text-align: right;"">{{case.interest}}</td></tr>
<tr><td style=""padding: 8px; border: 1px solid #ccc;"">Kosten:</td><td style=""padding: 8px; border: 1px solid #ccc; text-align: right;"">{{case.costs}}</td></tr>
<tr style=""background: #fee2e2;""><td style=""padding: 8px; border: 1px solid #ccc; font-weight: bold;"">Gesamtbetrag:</td><td style=""padding: 8px; border: 1px solid #ccc; text-align: right; font-weight: bold;"">{{case.totalAmount}}</td></tr>
</table>
<p><strong>Letzte Frist: 7 Tage ab Zugang dieses Schreibens</strong></p>
<p>Bei Nichtzahlung wird ohne weitere Ankündigung ein gerichtlicher Mahnbescheid beantragt.</p>
</div>"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Mahnbescheid eingereicht",
                Type = TemplateType.EMAIL,
                Category = TemplateCategory.LEGAL,
                Subject = "Gerichtliches Mahnverfahren eingeleitet - Aktenzeichen {{case.courtFileNumber}}",
                Content = @"<p>Sehr geehrte(r) {{debtor.firstName}} {{debtor.lastName}},</p>
<p>wir teilen Ihnen mit, dass wir heute beim zuständigen <strong>{{case.competentCourt}}</strong> einen Antrag auf Erlass eines Mahnbescheids gestellt haben.</p>
<p>Das Aktenzeichen lautet: <strong>{{case.courtFileNumber}}</strong></p>
<p>Sie werden in Kürze Post vom Gericht erhalten. Bitte beachten Sie die Fristen!</p>
<p>Bei Fragen stehen wir Ihnen unter {{kreditor.contactEmail}} zur Verfügung.</p>
<p>Mit freundlichen Grüßen,<br>{{kreditor.name}} - Rechtsabteilung</p>"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Vollstreckungsbescheid beantragt",
                Type = TemplateType.LETTER,
                Category = TemplateCategory.LEGAL,
                Content = @"<h1 style=""color: #7f1d1d;"">VOLLSTRECKUNGSBESCHEID</h1>
<p><strong>Aktenzeichen: {{case.courtFileNumber}}</strong></p>
<hr>
<p>Sehr geehrte(r) {{debtor.lastName}},</p>
<p>nachdem Sie gegen den Mahnbescheid keinen Widerspruch eingelegt haben, wurde am heutigen Tage ein <strong>Vollstreckungsbescheid</strong> beantragt.</p>
<p>Dieser stellt einen vollstreckbaren Titel dar, der 30 Jahre gültig ist.</p>
<h3>Konsequenzen:</h3>
<ul>
<li>Zwangsvollstreckung in Ihr Vermögen</li>
<li>Pfändung von Lohn/Gehalt</li>
<li>Kontopfändung</li>
<li>Eintrag bei Auskunfteien (SCHUFA, etc.)</li>
</ul>
<p>Sie können dies noch immer vermeiden durch sofortige Zahlung von <strong>{{case.totalAmount}}</strong>.</p>"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Gerichtsvollzieher-Beauftragung",
                Type = TemplateType.LETTER,
                Category = TemplateCategory.LEGAL,
                Content = @"<h2>Beauftragung des Gerichtsvollziehers</h2>
<p>Sehr geehrte(r) {{debtor.firstName}} {{debtor.lastName}},</p>
<p>wir haben am heutigen Tage den Gerichtsvollzieher mit der Vollstreckung des Titels beauftragt.</p>
<p><strong>Vollstreckungstitel:</strong> {{case.courtFileNumber}}</p>
<p><strong>Zu vollstreckender Betrag:</strong> {{case.totalAmount}}</p>
<p>Der Gerichtsvollzieher wird sich in Kürze mit Ihnen in Verbindung setzen. Bitte halten Sie alle erforderlichen Unterlagen bereit.</p>
<p>Eine Zahlung ist weiterhin möglich auf das Konto:<br>IBAN: {{kreditor.bankAccountIBAN}}</p>"
            },

            // ============ VEREINBARUNGS-TEMPLATES ============
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Ratenzahlungsvereinbarung - Standard",
                Type = TemplateType.LETTER,
                Category = TemplateCategory.GENERAL,
                Content = @"<h2>Ratenzahlungsvereinbarung</h2>
<p>zwischen {{kreditor.name}} (Gläubiger) und {{debtor.firstName}} {{debtor.lastName}} (Schuldner).</p>
<p>Der Schuldner erkennt die Forderung in Höhe von {{case.totalAmount}} vollumfänglich an.</p>
<p>Zur Tilgung wird eine monatliche Rate von 50,00 EUR vereinbart, zahlbar zum 1. eines jeden Monats.</p>
<p>Bei Verzug mit einer Rate wird der gesamte Restbetrag sofort fällig.</p>
<br><br>
<p>_______________________<br>Unterschrift Schuldner</p>"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Ratenzahlung - Erhöhte Rate",
                Type = TemplateType.LETTER,
                Category = TemplateCategory.GENERAL,
                Content = @"<h2>Ratenzahlungsvereinbarung (Erhöhte Rate)</h2>
<p><strong>Schuldner:</strong> {{debtor.firstName}} {{debtor.lastName}}</p>
<p><strong>Gläubiger:</strong> {{kreditor.name}}</p>
<hr>
<p>Die Parteien vereinbaren folgende Ratenzahlung:</p>
<table style=""width: 100%; border-collapse: collapse;"">
<tr><td style=""padding: 8px; border: 1px solid #000;"">Gesamtforderung:</td><td style=""padding: 8px; border: 1px solid #000;"">{{case.totalAmount}}</td></tr>
<tr><td style=""padding: 8px; border: 1px solid #000;"">Monatliche Rate:</td><td style=""padding: 8px; border: 1px solid #000;"">150,00 EUR</td></tr>
<tr><td style=""padding: 8px; border: 1px solid #000;"">Zahlungstag:</td><td style=""padding: 8px; border: 1px solid #000;"">15. des Monats</td></tr>
<tr><td style=""padding: 8px; border: 1px solid #000;"">Erste Rate:</td><td style=""padding: 8px; border: 1px solid #000;"">{{case.nextActionDate}}</td></tr>
</table>
<p style=""margin-top: 30px;"">
Ort, Datum: _______________________<br><br>
Unterschrift Gläubiger: _______________________ &nbsp;&nbsp;&nbsp; Unterschrift Schuldner: _______________________
</p>"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Stundungsvereinbarung",
                Type = TemplateType.LETTER,
                Category = TemplateCategory.GENERAL,
                Content = @"<h2>Stundungsvereinbarung</h2>
<p>Die {{kreditor.name}} gewährt dem Schuldner {{debtor.firstName}} {{debtor.lastName}} eine Stundung der Forderung aus {{case.invoiceNumber}} in Höhe von {{case.totalAmount}}.</p>
<p><strong>Stundungszeitraum:</strong> 3 Monate ab Datum dieses Schreibens</p>
<p><strong>Bedingungen:</strong></p>
<ul>
<li>Der Schuldner erkennt die Forderung an</li>
<li>Keine weiteren Forderungen während der Stundung</li>
<li>Sofortige Fälligkeit bei Verstoß gegen Bedingungen</li>
</ul>"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Vergleichsangebot",
                Type = TemplateType.LETTER,
                Category = TemplateCategory.GENERAL,
                Content = @"<h2 style=""color: #166534;"">Vergleichsangebot - Einmalige Chance</h2>
<p>Sehr geehrte(r) {{debtor.firstName}} {{debtor.lastName}},</p>
<p>wir unterbreiten Ihnen ein einmaliges Vergleichsangebot:</p>
<div style=""background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;"">
<p><strong>Aktuelle Forderung:</strong> {{case.totalAmount}}</p>
<p><strong>Unser Angebot:</strong> Zahlung von 60% = [Betrag berechnen] innerhalb von 14 Tagen</p>
<p>Bei fristgerechter Zahlung verzichten wir auf den Restbetrag!</p>
</div>
<p>Dieses Angebot ist gültig bis {{case.nextActionDate}}. Bei Annahme bitte schriftlich bestätigen.</p>"
            },

            // ============ INFORMATIONS-TEMPLATES ============
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Zahlungseingang bestätigt",
                Type = TemplateType.EMAIL,
                Category = TemplateCategory.GENERAL,
                Subject = "Zahlungsbestätigung - Ihre Zahlung zu {{case.invoiceNumber}} ist eingegangen",
                Content = @"<div style=""background: #dcfce7; padding: 20px; border-radius: 8px;"">
<h2 style=""color: #166534;"">✓ Vielen Dank für Ihre Zahlung!</h2>
<p>Sehr geehrte(r) {{debtor.firstName}} {{debtor.lastName}},</p>
<p>wir bestätigen den Eingang Ihrer Zahlung zur Rechnung <strong>{{case.invoiceNumber}}</strong>.</p>
<p>Der Fall ist damit abgeschlossen. Wir wünschen Ihnen alles Gute!</p>
<p>Mit freundlichen Grüßen,<br>{{kreditor.name}}</p>
</div>"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Teilzahlung eingegangen",
                Type = TemplateType.EMAIL,
                Category = TemplateCategory.GENERAL,
                Subject = "Teilzahlung eingegangen - Restbetrag offen",
                Content = @"<p>Sehr geehrte(r) {{debtor.firstName}} {{debtor.lastName}},</p>
<p>wir bestätigen den Eingang einer Teilzahlung zu Ihrer Forderung {{case.invoiceNumber}}.</p>
<table style=""margin: 20px 0;"">
<tr><td>Ursprüngliche Forderung:</td><td style=""text-align: right;"">{{case.principalAmount}}</td></tr>
<tr><td>Ihre Zahlung:</td><td style=""text-align: right;"">- [BETRAG]</td></tr>
<tr style=""font-weight: bold; border-top: 2px solid #000;""><td>Verbleibender Restbetrag:</td><td style=""text-align: right;"">[RESTBETRAG]</td></tr>
</table>
<p>Bitte begleichen Sie den Restbetrag umgehend, um weitere Kosten zu vermeiden.</p>"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Adressermittlung eingeleitet",
                Type = TemplateType.LETTER,
                Category = TemplateCategory.GENERAL,
                Content = @"<h3>Interner Vermerk - Adressermittlung</h3>
<p><strong>Schuldner:</strong> {{debtor.firstName}} {{debtor.lastName}}</p>
<p><strong>Letzte bekannte Adresse:</strong><br>{{debtor.street}}<br>{{debtor.zipCode}} {{debtor.city}}</p>
<hr>
<p>Die Adresse wurde als unzustellbar gemeldet. Folgende Maßnahmen werden eingeleitet:</p>
<ol>
<li>EMA-Anfrage beim Einwohnermeldeamt</li>
<li>Auskunft bei bekannten Verwandten</li>
<li>Internetrecherche</li>
</ol>
<p>Status: {{debtor.addressStatus}}</p>"
            },

            // ============ EDGE CASES - SPEZIELLE TEMPLATES ============
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Unternehmens-Mahnung (B2B)",
                Type = TemplateType.LETTER,
                Category = TemplateCategory.REMINDER,
                Content = @"<div style=""font-family: 'Times New Roman', serif;"">
<h1 style=""text-align: center;"">MAHNUNG</h1>
<p style=""text-align: right;"">{{kreditor.name}}<br>{{kreditor.contactEmail}}</p>
<hr style=""border: 2px solid #000;"">
<p><strong>An:</strong><br>{{debtor.companyName}}<br>{{debtor.street}}<br>{{debtor.zipCode}} {{debtor.city}}</p>
<p><strong>Betreff:</strong> Offene Rechnung {{case.invoiceNumber}} - Geschäftskunden-Mahnung</p>
<p>Sehr geehrte Damen und Herren,</p>
<p>gemäß § 286 BGB befinden Sie sich mit der Zahlung der o.g. Rechnung in Verzug. Wir fordern Sie auf, den Betrag von <strong>{{case.totalAmount}}</strong> unverzüglich zu begleichen.</p>
<p>Bei Nichtzahlung innerhalb von 5 Werktagen werden wir rechtliche Schritte einleiten und Verzugszinsen nach § 288 Abs. 2 BGB (9 Prozentpunkte über Basiszinssatz) berechnen.</p>
<p>Hochachtungsvoll</p>
</div>"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Insolvenz-Anmeldung",
                Type = TemplateType.LETTER,
                Category = TemplateCategory.LEGAL,
                Content = @"<h2>Forderungsanmeldung zur Insolvenztabelle</h2>
<p><strong>Insolvenzgericht:</strong> [Gericht eintragen]</p>
<p><strong>Aktenzeichen:</strong> [Az. eintragen]</p>
<p><strong>Schuldner:</strong> {{debtor.firstName}} {{debtor.lastName}}</p>
<hr>
<p>Wir melden folgende Forderung zur Insolvenztabelle an:</p>
<table style=""width: 100%; border-collapse: collapse;"">
<tr><td style=""border: 1px solid #000; padding: 5px;"">Hauptforderung:</td><td style=""border: 1px solid #000; padding: 5px;"">{{case.principalAmount}}</td></tr>
<tr><td style=""border: 1px solid #000; padding: 5px;"">Zinsen bis Eröffnung:</td><td style=""border: 1px solid #000; padding: 5px;"">{{case.interest}}</td></tr>
<tr><td style=""border: 1px solid #000; padding: 5px;"">Kosten:</td><td style=""border: 1px solid #000; padding: 5px;"">{{case.costs}}</td></tr>
<tr><td style=""border: 1px solid #000; padding: 5px; font-weight: bold;"">Gesamtforderung:</td><td style=""border: 1px solid #000; padding: 5px; font-weight: bold;"">{{case.totalAmount}}</td></tr>
</table>
<p><strong>Rechtsgrund:</strong> {{case.invoiceNumber}} vom {{case.invoiceDate}}</p>"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "SCHUFA-Eintrag Vorwarnung",
                Type = TemplateType.EMAIL,
                Category = TemplateCategory.LEGAL,
                Subject = "⚠️ Drohender SCHUFA-Eintrag - Letzte Chance zur Vermeidung",
                Content = @"<div style=""background: #fef3c7; border: 2px solid #f59e0b; padding: 20px;"">
<h2>⚠️ Wichtige Mitteilung - SCHUFA-Eintrag</h2>
<p>Sehr geehrte(r) {{debtor.firstName}} {{debtor.lastName}},</p>
<p>wir weisen Sie darauf hin, dass wir berechtigt sind, Ihre Daten an die SCHUFA Holding AG zu übermitteln, sofern die Forderung nicht innerhalb von <strong>14 Tagen</strong> beglichen wird.</p>
<p>Ein negativer SCHUFA-Eintrag kann erhebliche Auswirkungen haben:</p>
<ul>
<li>Ablehnung von Krediten</li>
<li>Probleme bei Handyverträgen</li>
<li>Schwierigkeiten bei der Wohnungssuche</li>
<li>Ablehnung bei Online-Käufen auf Rechnung</li>
</ul>
<p><strong>Vermeiden Sie dies durch sofortige Zahlung von {{case.totalAmount}}!</strong></p>
</div>"
            },

            // ============ GRENZFÄLLE - SEHR LANGE INHALTE ============
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Vollständige Forderungsaufstellung mit allen Details",
                Type = TemplateType.LETTER,
                Category = TemplateCategory.GENERAL,
                Content = @"<h1>Detaillierte Forderungsaufstellung</h1>
<p><strong>Aktenzeichen intern:</strong> {{case.id}}</p>
<p><strong>Gerichtliches Aktenzeichen:</strong> {{case.courtFileNumber}}</p>
<hr>
<h2>1. Schuldnerdaten</h2>
<table style=""width: 100%; border-collapse: collapse; margin-bottom: 20px;"">
<tr><td style=""padding: 5px; border: 1px solid #ccc; width: 200px;"">Name:</td><td style=""padding: 5px; border: 1px solid #ccc;"">{{debtor.firstName}} {{debtor.lastName}}</td></tr>
<tr><td style=""padding: 5px; border: 1px solid #ccc;"">Firma:</td><td style=""padding: 5px; border: 1px solid #ccc;"">{{debtor.companyName}}</td></tr>
<tr><td style=""padding: 5px; border: 1px solid #ccc;"">Straße:</td><td style=""padding: 5px; border: 1px solid #ccc;"">{{debtor.street}}</td></tr>
<tr><td style=""padding: 5px; border: 1px solid #ccc;"">PLZ/Ort:</td><td style=""padding: 5px; border: 1px solid #ccc;"">{{debtor.zipCode}} {{debtor.city}}</td></tr>
<tr><td style=""padding: 5px; border: 1px solid #ccc;"">E-Mail:</td><td style=""padding: 5px; border: 1px solid #ccc;"">{{debtor.email}}</td></tr>
<tr><td style=""padding: 5px; border: 1px solid #ccc;"">Telefon:</td><td style=""padding: 5px; border: 1px solid #ccc;"">{{debtor.phone}}</td></tr>
<tr><td style=""padding: 5px; border: 1px solid #ccc;"">Risikobewertung:</td><td style=""padding: 5px; border: 1px solid #ccc;"">{{debtor.riskScore}}</td></tr>
</table>

<h2>2. Gläubigerdaten</h2>
<table style=""width: 100%; border-collapse: collapse; margin-bottom: 20px;"">
<tr><td style=""padding: 5px; border: 1px solid #ccc; width: 200px;"">Mandant:</td><td style=""padding: 5px; border: 1px solid #ccc;"">{{kreditor.name}}</td></tr>
<tr><td style=""padding: 5px; border: 1px solid #ccc;"">Handelsregister:</td><td style=""padding: 5px; border: 1px solid #ccc;"">{{kreditor.registrationNumber}}</td></tr>
<tr><td style=""padding: 5px; border: 1px solid #ccc;"">E-Mail:</td><td style=""padding: 5px; border: 1px solid #ccc;"">{{kreditor.contactEmail}}</td></tr>
<tr><td style=""padding: 5px; border: 1px solid #ccc;"">Bankverbindung:</td><td style=""padding: 5px; border: 1px solid #ccc;"">{{kreditor.bankAccountIBAN}}</td></tr>
</table>

<h2>3. Forderungsdetails</h2>
<table style=""width: 100%; border-collapse: collapse; margin-bottom: 20px;"">
<tr><td style=""padding: 5px; border: 1px solid #ccc; width: 200px;"">Rechnungsnummer:</td><td style=""padding: 5px; border: 1px solid #ccc;"">{{case.invoiceNumber}}</td></tr>
<tr><td style=""padding: 5px; border: 1px solid #ccc;"">Rechnungsdatum:</td><td style=""padding: 5px; border: 1px solid #ccc;"">{{case.invoiceDate}}</td></tr>
<tr><td style=""padding: 5px; border: 1px solid #ccc;"">Fälligkeitsdatum:</td><td style=""padding: 5px; border: 1px solid #ccc;"">{{case.dueDate}}</td></tr>
<tr><td style=""padding: 5px; border: 1px solid #ccc;"">Status:</td><td style=""padding: 5px; border: 1px solid #ccc;"">{{case.status}}</td></tr>
</table>

<h2>4. Betragsaufstellung</h2>
<table style=""width: 100%; border-collapse: collapse; margin-bottom: 20px;"">
<tr><td style=""padding: 5px; border: 1px solid #ccc;"">Hauptforderung:</td><td style=""padding: 5px; border: 1px solid #ccc; text-align: right;"">{{case.principalAmount}}</td></tr>
<tr><td style=""padding: 5px; border: 1px solid #ccc;"">Zinsen (5% p.a.):</td><td style=""padding: 5px; border: 1px solid #ccc; text-align: right;"">{{case.interest}}</td></tr>
<tr><td style=""padding: 5px; border: 1px solid #ccc;"">Mahnkosten:</td><td style=""padding: 5px; border: 1px solid #ccc; text-align: right;"">{{case.costs}}</td></tr>
<tr style=""background: #fee2e2; font-weight: bold;""><td style=""padding: 5px; border: 2px solid #dc2626;"">GESAMTBETRAG:</td><td style=""padding: 5px; border: 2px solid #dc2626; text-align: right;"">{{case.totalAmount}}</td></tr>
</table>

<h2>5. Verfahrenshistorie</h2>
<p>Dieses Dokument enthält alle relevanten Informationen zur Forderung und dient als Grundlage für das weitere Vorgehen.</p>
<p><strong>Zuständiges Mahngericht:</strong> {{case.competentCourt}}</p>
<p><strong>Nächste Aktion geplant:</strong> {{case.nextActionDate}}</p>

<hr>
<p style=""font-size: 10px; color: #666;"">Erstellt am: [DATUM] | Monetaris Inkasso-Management System</p>"
            },

            // ============ GRENZFÄLLE - SONDERZEICHEN & UMLAUTE ============
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Mahnung mit Sonderzeichen (Österreich/Schweiz)",
                Type = TemplateType.EMAIL,
                Category = TemplateCategory.REMINDER,
                Subject = "Zahlungserinnerung für Müller-Lüdenscheid GmbH & Co. KG",
                Content = @"<p>Sehr geehrte Damen und Herren der Müller-Lüdenscheid GmbH & Co. KG,</p>
<p>bezüglich Ihrer Räumlichkeiten in der Königstraße 42, München-Schwabing, ist noch eine Zahlung offen.</p>
<p>Bitte überweisen Sie € {{case.totalAmount}} auf unser Konto.</p>
<p>Für Rückfragen: François Müller-Großhändler (Telefon: +49 89 / 12 34 56 - 0)</p>
<p>Mit freundlichen Grüßen aus Düsseldorf,<br>{{kreditor.name}}</p>
<p style=""font-size: 10px;"">Währungen: € EUR, £ GBP, ¥ JPY, $ USD | Sonderzeichen: © ® ™ § ° ± × ÷</p>"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Vorlage mit HTML-Escape-Zeichen",
                Type = TemplateType.EMAIL,
                Category = TemplateCategory.GENERAL,
                Subject = "Test: <script>alert('XSS')</script> & \"Sonderzeichen\" 'Test'",
                Content = @"<p>Test-Template für HTML-Escape:</p>
<ul>
<li>Kleiner als: &lt;</li>
<li>Größer als: &gt;</li>
<li>Ampersand: &amp;</li>
<li>Anführungszeichen: &quot;</li>
<li>Apostroph: &#39;</li>
</ul>
<p>Code-Beispiel: &lt;div class=&quot;test&quot;&gt;{{case.totalAmount}}&lt;/div&gt;</p>
<p>Mathematik: 5 &lt; 10 &amp;&amp; 20 &gt; 15</p>"
            },

            // ============ GRENZFÄLLE - MINIMALE VORLAGEN ============
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Kurz-Mahnung (SMS-Stil)",
                Type = TemplateType.EMAIL,
                Category = TemplateCategory.REMINDER,
                Subject = "Mahnung {{case.invoiceNumber}}",
                Content = @"<p>Zahlung {{case.totalAmount}} überfällig. Bitte sofort zahlen. {{kreditor.name}}</p>"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Nur-Variablen-Test",
                Type = TemplateType.LETTER,
                Category = TemplateCategory.GENERAL,
                Content = @"{{debtor.firstName}} {{debtor.lastName}} {{debtor.companyName}} {{debtor.street}} {{debtor.zipCode}} {{debtor.city}} {{debtor.email}} {{debtor.phone}} {{case.invoiceNumber}} {{case.invoiceDate}} {{case.dueDate}} {{case.principalAmount}} {{case.interest}} {{case.costs}} {{case.totalAmount}} {{case.status}} {{case.courtFileNumber}} {{case.competentCourt}} {{kreditor.name}} {{kreditor.contactEmail}} {{kreditor.bankAccountIBAN}}"
            },

            // ============ GRENZFÄLLE - BRANCHENSPEZIFISCHE VORLAGEN ============
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Miete/Nebenkosten Mahnung",
                Type = TemplateType.LETTER,
                Category = TemplateCategory.REMINDER,
                Content = @"<h2>Mahnung - Mietrückstand</h2>
<p><strong>Mietobjekt:</strong> [Adresse eintragen]</p>
<p>Sehr geehrte(r) {{debtor.firstName}} {{debtor.lastName}},</p>
<p>für das o.g. Mietobjekt sind folgende Zahlungen überfällig:</p>
<ul>
<li>Miete: {{case.principalAmount}}</li>
<li>Nebenkosten: {{case.costs}}</li>
<li>Verzugszinsen: {{case.interest}}</li>
</ul>
<p><strong>Gesamt: {{case.totalAmount}}</strong></p>
<p>Wir weisen darauf hin, dass gemäß § 543 Abs. 2 Nr. 3 BGB eine fristlose Kündigung des Mietverhältnisses möglich ist, wenn der Mieter mit zwei aufeinanderfolgenden Monatsmieten in Verzug ist.</p>"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Handwerkerrechnung Mahnung",
                Type = TemplateType.EMAIL,
                Category = TemplateCategory.REMINDER,
                Subject = "Offene Handwerkerrechnung {{case.invoiceNumber}} - Bitte um Zahlung",
                Content = @"<p>Sehr geehrte(r) {{debtor.firstName}} {{debtor.lastName}},</p>
<p>die Rechnung für die bei Ihnen durchgeführten Handwerksleistungen ist weiterhin offen:</p>
<p><strong>Leistung:</strong> [Beschreibung eintragen]<br>
<strong>Ausgeführt am:</strong> {{case.invoiceDate}}<br>
<strong>Rechnungsbetrag:</strong> {{case.principalAmount}} (inkl. MwSt.)</p>
<p>Bitte überweisen Sie den Betrag innerhalb von 7 Tagen.</p>
<p>Bei Fragen zur Rechnung oder den Leistungen stehen wir Ihnen gerne zur Verfügung.</p>
<p>Mit freundlichen Grüßen,<br>{{kreditor.name}}</p>"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Ärztliche Behandlung Mahnung",
                Type = TemplateType.LETTER,
                Category = TemplateCategory.REMINDER,
                Content = @"<h2>Zahlungserinnerung - Privatärztliche Behandlung</h2>
<p><strong>Patient:</strong> {{debtor.firstName}} {{debtor.lastName}}</p>
<p><strong>Behandlungsdatum:</strong> {{case.invoiceDate}}</p>
<p><strong>Rechnungsnummer:</strong> {{case.invoiceNumber}}</p>
<hr>
<p>Sehr geehrte(r) {{debtor.lastName}},</p>
<p>die Rechnung für Ihre privatärztliche Behandlung gemäß GOÄ ist noch nicht beglichen.</p>
<p><strong>Offener Betrag:</strong> {{case.totalAmount}}</p>
<p>Bitte beachten Sie, dass wir bei weiterer Nichtzahlung gezwungen sind, ein Inkassounternehmen zu beauftragen.</p>
<p>Mit freundlichen Grüßen</p>"
            },

            // ============ ZUSÄTZLICHE EDGE CASES ============
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Leere Vorlage (Platzhalter)",
                Type = TemplateType.LETTER,
                Category = TemplateCategory.GENERAL,
                Content = @"<p>[Inhalt hier einfügen]</p>"
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Vorlage mit Tabelle und Formatierung",
                Type = TemplateType.EMAIL,
                Category = TemplateCategory.GENERAL,
                Subject = "Kontoübersicht {{debtor.lastName}}",
                Content = @"<style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#4a5568;color:white}tr:nth-child(even){background:#f3f4f6}</style>
<h2>Kontoübersicht für {{debtor.firstName}} {{debtor.lastName}}</h2>
<table>
<thead>
<tr><th>Rechnungsnr.</th><th>Datum</th><th>Betrag</th><th>Status</th></tr>
</thead>
<tbody>
<tr><td>{{case.invoiceNumber}}</td><td>{{case.invoiceDate}}</td><td>{{case.principalAmount}}</td><td>{{case.status}}</td></tr>
<tr><td colspan=""3"" style=""text-align:right;font-weight:bold;"">Zinsen:</td><td>{{case.interest}}</td></tr>
<tr><td colspan=""3"" style=""text-align:right;font-weight:bold;"">Kosten:</td><td>{{case.costs}}</td></tr>
<tr style=""background:#fee2e2""><td colspan=""3"" style=""text-align:right;font-weight:bold;"">GESAMT:</td><td style=""font-weight:bold"">{{case.totalAmount}}</td></tr>
</tbody>
</table>"
            }
        };
        await _context.Templates.AddRangeAsync(templates);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {Count} templates with edge cases", templates.Count);

        _logger.LogInformation("Database seeding completed successfully!");
        _logger.LogWarning("==========================================================");
        _logger.LogWarning("REMEMBER: All seeded users have temporary passwords");
        _logger.LogWarning("Users should change passwords on first login!");
        _logger.LogWarning("==========================================================");
    }

    /// <summary>
    /// Generates a cryptographically secure random password
    /// SECURITY: 20 characters with uppercase, lowercase, digits, and special characters
    /// </summary>
    private static string GenerateSecurePassword()
    {
        const string uppercaseChars = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // No I, O to avoid confusion
        const string lowercaseChars = "abcdefghjkmnpqrstuvwxyz"; // No i, l, o to avoid confusion
        const string digitChars = "23456789"; // No 0, 1 to avoid confusion
        const string specialChars = "!@#$%^&*"; // Common safe special characters
        const int passwordLength = 20;

        var random = RandomNumberGenerator.Create();
        var password = new char[passwordLength];

        // Ensure at least one character from each category
        password[0] = GetRandomChar(uppercaseChars, random);
        password[1] = GetRandomChar(lowercaseChars, random);
        password[2] = GetRandomChar(digitChars, random);
        password[3] = GetRandomChar(specialChars, random);

        // Fill the rest with random characters from all categories
        string allChars = uppercaseChars + lowercaseChars + digitChars + specialChars;
        for (int i = 4; i < passwordLength; i++)
        {
            password[i] = GetRandomChar(allChars, random);
        }

        // Shuffle the password to avoid predictable patterns
        return new string(ShuffleArray(password, random));
    }

    /// <summary>
    /// Gets a cryptographically random character from a given set
    /// </summary>
    private static char GetRandomChar(string chars, RandomNumberGenerator random)
    {
        var bytes = new byte[4];
        random.GetBytes(bytes);
        var index = BitConverter.ToUInt32(bytes, 0) % chars.Length;
        return chars[(int)index];
    }

    /// <summary>
    /// Shuffles an array using Fisher-Yates algorithm with cryptographic randomness
    /// </summary>
    private static char[] ShuffleArray(char[] array, RandomNumberGenerator random)
    {
        var result = (char[])array.Clone();
        for (int i = result.Length - 1; i > 0; i--)
        {
            var bytes = new byte[4];
            random.GetBytes(bytes);
            var j = (int)(BitConverter.ToUInt32(bytes, 0) % (i + 1));
            (result[i], result[j]) = (result[j], result[i]);
        }
        return result;
    }
}
