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
                name: "tenants",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    registration_number = table.Column<string>(type: "text", nullable: false),
                    contact_email = table.Column<string>(type: "text", nullable: false),
                    bank_account_iban = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tenants", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "templates",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: true),
                    name = table.Column<string>(type: "text", nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "text", nullable: false),
                    subject = table.Column<string>(type: "text", nullable: true),
                    content = table.Column<string>(type: "text", nullable: false),
                    last_modified = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_templates", x => x.id);
                    table.ForeignKey(
                        name: "fk_templates_tenants_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenants",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    role = table.Column<string>(type: "text", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: true),
                    avatar_initials = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.id);
                    table.ForeignKey(
                        name: "fk_users_tenants_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenants",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "debtors",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    agent_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_company = table.Column<bool>(type: "boolean", nullable: false),
                    company_name = table.Column<string>(type: "text", nullable: true),
                    first_name = table.Column<string>(type: "text", nullable: true),
                    last_name = table.Column<string>(type: "text", nullable: true),
                    email = table.Column<string>(type: "text", nullable: true),
                    phone = table.Column<string>(type: "text", nullable: true),
                    date_of_birth = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    street = table.Column<string>(type: "text", nullable: true),
                    zip_code = table.Column<string>(type: "text", nullable: true),
                    city = table.Column<string>(type: "text", nullable: true),
                    country = table.Column<string>(type: "text", nullable: false),
                    address_status = table.Column<string>(type: "text", nullable: false),
                    address_last_checked = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    risk_score = table.Column<string>(type: "text", nullable: false),
                    total_debt = table.Column<decimal>(type: "numeric(15,2)", precision: 15, scale: 2, nullable: false),
                    open_cases = table.Column<int>(type: "integer", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_debtors", x => x.id);
                    table.ForeignKey(
                        name: "fk_debtors_tenants_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenants",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_debtors_users_agent_id",
                        column: x => x.agent_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "refresh_tokens",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    token = table.Column<string>(type: "text", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    revoked_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_refresh_tokens", x => x.id);
                    table.ForeignKey(
                        name: "fk_refresh_tokens_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_tenant_assignments",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_tenant_assignments", x => new { x.user_id, x.tenant_id });
                    table.ForeignKey(
                        name: "fk_user_tenant_assignments_tenants_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenants",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_user_tenant_assignments_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "cases",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    debtor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    agent_id = table.Column<Guid>(type: "uuid", nullable: true),
                    principal_amount = table.Column<decimal>(type: "numeric(15,2)", precision: 15, scale: 2, nullable: false),
                    costs = table.Column<decimal>(type: "numeric(15,2)", precision: 15, scale: 2, nullable: false),
                    interest = table.Column<decimal>(type: "numeric(15,2)", precision: 15, scale: 2, nullable: false),
                    currency = table.Column<string>(type: "text", nullable: false),
                    invoice_number = table.Column<string>(type: "text", nullable: false),
                    invoice_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    due_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    next_action_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    competent_court = table.Column<string>(type: "text", nullable: false),
                    court_file_number = table.Column<string>(type: "text", nullable: true),
                    ai_analysis = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cases", x => x.id);
                    table.ForeignKey(
                        name: "fk_cases_debtors_debtor_id",
                        column: x => x.debtor_id,
                        principalTable: "debtors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_cases_tenants_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "tenants",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_cases_users_agent_id",
                        column: x => x.agent_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "documents",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    debtor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    size_bytes = table.Column<long>(type: "bigint", nullable: false),
                    file_path = table.Column<string>(type: "text", nullable: false),
                    preview_url = table.Column<string>(type: "text", nullable: true),
                    uploaded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_documents", x => x.id);
                    table.ForeignKey(
                        name: "fk_documents_debtors_debtor_id",
                        column: x => x.debtor_id,
                        principalTable: "debtors",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "case_history",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    case_id = table.Column<Guid>(type: "uuid", nullable: false),
                    action = table.Column<string>(type: "text", nullable: false),
                    details = table.Column<string>(type: "text", nullable: false),
                    actor = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_case_history", x => x.id);
                    table.ForeignKey(
                        name: "fk_case_history_cases_case_id",
                        column: x => x.case_id,
                        principalTable: "cases",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "inquiries",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    case_id = table.Column<Guid>(type: "uuid", nullable: false),
                    question = table.Column<string>(type: "text", nullable: false),
                    answer = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_by = table.Column<Guid>(type: "uuid", nullable: false),
                    resolved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_inquiries", x => x.id);
                    table.ForeignKey(
                        name: "fk_inquiries_cases_case_id",
                        column: x => x.case_id,
                        principalTable: "cases",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_inquiries_users_created_by",
                        column: x => x.created_by,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_case_history_case_id",
                table: "case_history",
                column: "case_id");

            migrationBuilder.CreateIndex(
                name: "ix_case_history_created_at",
                table: "case_history",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_cases_agent_id",
                table: "cases",
                column: "agent_id");

            migrationBuilder.CreateIndex(
                name: "ix_cases_debtor_id",
                table: "cases",
                column: "debtor_id");

            migrationBuilder.CreateIndex(
                name: "ix_cases_due_date",
                table: "cases",
                column: "due_date");

            migrationBuilder.CreateIndex(
                name: "ix_cases_invoice_number",
                table: "cases",
                column: "invoice_number");

            migrationBuilder.CreateIndex(
                name: "ix_cases_next_action_date",
                table: "cases",
                column: "next_action_date");

            migrationBuilder.CreateIndex(
                name: "ix_cases_status",
                table: "cases",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_cases_tenant_id",
                table: "cases",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "ix_debtors_agent_id",
                table: "debtors",
                column: "agent_id");

            migrationBuilder.CreateIndex(
                name: "ix_debtors_email",
                table: "debtors",
                column: "email");

            migrationBuilder.CreateIndex(
                name: "ix_debtors_risk_score",
                table: "debtors",
                column: "risk_score");

            migrationBuilder.CreateIndex(
                name: "ix_debtors_tenant_id",
                table: "debtors",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "ix_documents_debtor_id",
                table: "documents",
                column: "debtor_id");

            migrationBuilder.CreateIndex(
                name: "ix_documents_uploaded_at",
                table: "documents",
                column: "uploaded_at");

            migrationBuilder.CreateIndex(
                name: "ix_inquiries_case_id",
                table: "inquiries",
                column: "case_id");

            migrationBuilder.CreateIndex(
                name: "ix_inquiries_created_by",
                table: "inquiries",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "ix_inquiries_status",
                table: "inquiries",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_refresh_tokens_expires_at",
                table: "refresh_tokens",
                column: "expires_at");

            migrationBuilder.CreateIndex(
                name: "ix_refresh_tokens_token",
                table: "refresh_tokens",
                column: "token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_refresh_tokens_user_id",
                table: "refresh_tokens",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_templates_category",
                table: "templates",
                column: "category");

            migrationBuilder.CreateIndex(
                name: "ix_templates_tenant_id",
                table: "templates",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "ix_templates_type",
                table: "templates",
                column: "type");

            migrationBuilder.CreateIndex(
                name: "ix_tenants_contact_email",
                table: "tenants",
                column: "contact_email");

            migrationBuilder.CreateIndex(
                name: "ix_tenants_registration_number",
                table: "tenants",
                column: "registration_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_user_tenant_assignments_tenant_id",
                table: "user_tenant_assignments",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_tenant_assignments_user_id",
                table: "user_tenant_assignments",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_users_email",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_users_role",
                table: "users",
                column: "role");

            migrationBuilder.CreateIndex(
                name: "ix_users_tenant_id",
                table: "users",
                column: "tenant_id");
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
