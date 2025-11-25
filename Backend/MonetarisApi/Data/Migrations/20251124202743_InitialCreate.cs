using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MonetarisApi.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "templates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    Subject = table.Column<string>(type: "text", nullable: true),
                    Content = table.Column<string>(type: "text", nullable: false),
                    LastModified = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_templates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tenants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    RegistrationNumber = table.Column<string>(type: "text", nullable: false),
                    ContactEmail = table.Column<string>(type: "text", nullable: false),
                    BankAccountIBAN = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tenants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: true),
                    AvatarInitials = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_users_tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "debtors",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    AgentId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsCompany = table.Column<bool>(type: "boolean", nullable: false),
                    CompanyName = table.Column<string>(type: "text", nullable: true),
                    FirstName = table.Column<string>(type: "text", nullable: true),
                    LastName = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    Phone = table.Column<string>(type: "text", nullable: true),
                    Street = table.Column<string>(type: "text", nullable: true),
                    ZipCode = table.Column<string>(type: "text", nullable: true),
                    City = table.Column<string>(type: "text", nullable: true),
                    Country = table.Column<string>(type: "text", nullable: false),
                    AddressStatus = table.Column<string>(type: "text", nullable: false),
                    AddressLastChecked = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RiskScore = table.Column<string>(type: "text", nullable: false),
                    TotalDebt = table.Column<decimal>(type: "numeric(15,2)", precision: 15, scale: 2, nullable: false),
                    OpenCases = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_debtors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_debtors_tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_debtors_users_AgentId",
                        column: x => x.AgentId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "refresh_tokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Token = table.Column<string>(type: "text", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RevokedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_refresh_tokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_refresh_tokens_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_tenant_assignments",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_tenant_assignments", x => new { x.UserId, x.TenantId });
                    table.ForeignKey(
                        name: "FK_user_tenant_assignments_tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_tenant_assignments_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "cases",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    DebtorId = table.Column<Guid>(type: "uuid", nullable: false),
                    AgentId = table.Column<Guid>(type: "uuid", nullable: true),
                    PrincipalAmount = table.Column<decimal>(type: "numeric(15,2)", precision: 15, scale: 2, nullable: false),
                    Costs = table.Column<decimal>(type: "numeric(15,2)", precision: 15, scale: 2, nullable: false),
                    Interest = table.Column<decimal>(type: "numeric(15,2)", precision: 15, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    InvoiceNumber = table.Column<string>(type: "text", nullable: false),
                    InvoiceDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    NextActionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompetentCourt = table.Column<string>(type: "text", nullable: false),
                    CourtFileNumber = table.Column<string>(type: "text", nullable: true),
                    AiAnalysis = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_cases_debtors_DebtorId",
                        column: x => x.DebtorId,
                        principalTable: "debtors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_cases_tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_cases_users_AgentId",
                        column: x => x.AgentId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "documents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DebtorId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    SizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    FilePath = table.Column<string>(type: "text", nullable: false),
                    PreviewUrl = table.Column<string>(type: "text", nullable: true),
                    UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_documents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_documents_debtors_DebtorId",
                        column: x => x.DebtorId,
                        principalTable: "debtors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "case_history",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CaseId = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    Details = table.Column<string>(type: "text", nullable: false),
                    Actor = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_case_history", x => x.Id);
                    table.ForeignKey(
                        name: "FK_case_history_cases_CaseId",
                        column: x => x.CaseId,
                        principalTable: "cases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "inquiries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CaseId = table.Column<Guid>(type: "uuid", nullable: false),
                    Question = table.Column<string>(type: "text", nullable: false),
                    Answer = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    ResolvedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_inquiries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_inquiries_cases_CaseId",
                        column: x => x.CaseId,
                        principalTable: "cases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_inquiries_users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_case_history_CaseId",
                table: "case_history",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_case_history_CreatedAt",
                table: "case_history",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_cases_AgentId",
                table: "cases",
                column: "AgentId");

            migrationBuilder.CreateIndex(
                name: "IX_cases_DebtorId",
                table: "cases",
                column: "DebtorId");

            migrationBuilder.CreateIndex(
                name: "IX_cases_DueDate",
                table: "cases",
                column: "DueDate");

            migrationBuilder.CreateIndex(
                name: "IX_cases_InvoiceNumber",
                table: "cases",
                column: "InvoiceNumber");

            migrationBuilder.CreateIndex(
                name: "IX_cases_NextActionDate",
                table: "cases",
                column: "NextActionDate");

            migrationBuilder.CreateIndex(
                name: "IX_cases_Status",
                table: "cases",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_cases_TenantId",
                table: "cases",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_debtors_AgentId",
                table: "debtors",
                column: "AgentId");

            migrationBuilder.CreateIndex(
                name: "IX_debtors_Email",
                table: "debtors",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_debtors_RiskScore",
                table: "debtors",
                column: "RiskScore");

            migrationBuilder.CreateIndex(
                name: "IX_debtors_TenantId",
                table: "debtors",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_documents_DebtorId",
                table: "documents",
                column: "DebtorId");

            migrationBuilder.CreateIndex(
                name: "IX_documents_UploadedAt",
                table: "documents",
                column: "UploadedAt");

            migrationBuilder.CreateIndex(
                name: "IX_inquiries_CaseId",
                table: "inquiries",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_inquiries_CreatedBy",
                table: "inquiries",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_inquiries_Status",
                table: "inquiries",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_refresh_tokens_ExpiresAt",
                table: "refresh_tokens",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_refresh_tokens_Token",
                table: "refresh_tokens",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_refresh_tokens_UserId",
                table: "refresh_tokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_templates_Category",
                table: "templates",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_templates_Type",
                table: "templates",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_tenants_ContactEmail",
                table: "tenants",
                column: "ContactEmail");

            migrationBuilder.CreateIndex(
                name: "IX_tenants_RegistrationNumber",
                table: "tenants",
                column: "RegistrationNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_tenant_assignments_TenantId",
                table: "user_tenant_assignments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_user_tenant_assignments_UserId",
                table: "user_tenant_assignments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_users_Email",
                table: "users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_Role",
                table: "users",
                column: "Role");

            migrationBuilder.CreateIndex(
                name: "IX_users_TenantId",
                table: "users",
                column: "TenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "case_history");

            migrationBuilder.DropTable(
                name: "documents");

            migrationBuilder.DropTable(
                name: "inquiries");

            migrationBuilder.DropTable(
                name: "refresh_tokens");

            migrationBuilder.DropTable(
                name: "templates");

            migrationBuilder.DropTable(
                name: "user_tenant_assignments");

            migrationBuilder.DropTable(
                name: "cases");

            migrationBuilder.DropTable(
                name: "debtors");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "tenants");
        }
    }
}
