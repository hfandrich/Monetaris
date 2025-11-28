using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MonetarisApi.Data.Migrations
{
    /// <inheritdoc />
    public partial class RenameTenantToKreditor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // =============================================
            // STEP 1: Drop all foreign keys referencing tenants
            // =============================================
            migrationBuilder.DropForeignKey(
                name: "fk_cases_tenants_tenant_id",
                table: "cases");

            migrationBuilder.DropForeignKey(
                name: "fk_debtors_tenants_tenant_id",
                table: "debtors");

            migrationBuilder.DropForeignKey(
                name: "fk_templates_tenants_tenant_id",
                table: "templates");

            migrationBuilder.DropForeignKey(
                name: "fk_users_tenants_tenant_id",
                table: "users");

            // Drop FK from user_tenant_assignments
            migrationBuilder.DropForeignKey(
                name: "fk_user_tenant_assignments_tenants_tenant_id",
                table: "user_tenant_assignments");

            migrationBuilder.DropForeignKey(
                name: "fk_user_tenant_assignments_users_user_id",
                table: "user_tenant_assignments");

            // =============================================
            // STEP 2: Rename tables (preserves data!)
            // =============================================
            migrationBuilder.RenameTable(
                name: "tenants",
                newName: "kreditoren");

            migrationBuilder.RenameTable(
                name: "user_tenant_assignments",
                newName: "user_kreditor_assignments");

            // =============================================
            // STEP 3: Rename columns in all tables
            // =============================================

            // Rename tenant_id to kreditor_id in user_kreditor_assignments
            migrationBuilder.RenameColumn(
                name: "tenant_id",
                table: "user_kreditor_assignments",
                newName: "kreditor_id");

            // Rename tenant_id to kreditor_id in users
            migrationBuilder.RenameColumn(
                name: "tenant_id",
                table: "users",
                newName: "kreditor_id");

            // Rename tenant_id to kreditor_id in templates
            migrationBuilder.RenameColumn(
                name: "tenant_id",
                table: "templates",
                newName: "kreditor_id");

            // Rename tenant_id to kreditor_id in debtors
            migrationBuilder.RenameColumn(
                name: "tenant_id",
                table: "debtors",
                newName: "kreditor_id");

            // Rename tenant_id to kreditor_id in cases
            migrationBuilder.RenameColumn(
                name: "tenant_id",
                table: "cases",
                newName: "kreditor_id");

            // =============================================
            // STEP 4: Rename indexes
            // =============================================
            migrationBuilder.RenameIndex(
                name: "ix_users_tenant_id",
                table: "users",
                newName: "ix_users_kreditor_id");

            migrationBuilder.RenameIndex(
                name: "ix_templates_tenant_id",
                table: "templates",
                newName: "ix_templates_kreditor_id");

            migrationBuilder.RenameIndex(
                name: "ix_debtors_tenant_id",
                table: "debtors",
                newName: "ix_debtors_kreditor_id");

            migrationBuilder.RenameIndex(
                name: "ix_cases_tenant_id",
                table: "cases",
                newName: "ix_cases_kreditor_id");

            // Rename indexes on kreditoren table (formerly tenants)
            migrationBuilder.RenameIndex(
                name: "ix_tenants_contact_email",
                table: "kreditoren",
                newName: "ix_kreditoren_contact_email");

            migrationBuilder.RenameIndex(
                name: "ix_tenants_registration_number",
                table: "kreditoren",
                newName: "ix_kreditoren_registration_number");

            // Rename indexes on user_kreditor_assignments table
            migrationBuilder.RenameIndex(
                name: "ix_user_tenant_assignments_tenant_id",
                table: "user_kreditor_assignments",
                newName: "ix_user_kreditor_assignments_kreditor_id");

            migrationBuilder.RenameIndex(
                name: "ix_user_tenant_assignments_user_id",
                table: "user_kreditor_assignments",
                newName: "ix_user_kreditor_assignments_user_id");

            // =============================================
            // STEP 5: Recreate foreign keys with new names
            // =============================================
            migrationBuilder.AddForeignKey(
                name: "fk_cases_kreditoren_kreditor_id",
                table: "cases",
                column: "kreditor_id",
                principalTable: "kreditoren",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_debtors_kreditoren_kreditor_id",
                table: "debtors",
                column: "kreditor_id",
                principalTable: "kreditoren",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_templates_kreditoren_kreditor_id",
                table: "templates",
                column: "kreditor_id",
                principalTable: "kreditoren",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_users_kreditoren_kreditor_id",
                table: "users",
                column: "kreditor_id",
                principalTable: "kreditoren",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            // FK for user_kreditor_assignments
            migrationBuilder.AddForeignKey(
                name: "fk_user_kreditor_assignments_kreditoren_kreditor_id",
                table: "user_kreditor_assignments",
                column: "kreditor_id",
                principalTable: "kreditoren",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_user_kreditor_assignments_users_user_id",
                table: "user_kreditor_assignments",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop new foreign keys
            migrationBuilder.DropForeignKey(
                name: "fk_cases_kreditoren_kreditor_id",
                table: "cases");

            migrationBuilder.DropForeignKey(
                name: "fk_debtors_kreditoren_kreditor_id",
                table: "debtors");

            migrationBuilder.DropForeignKey(
                name: "fk_templates_kreditoren_kreditor_id",
                table: "templates");

            migrationBuilder.DropForeignKey(
                name: "fk_users_kreditoren_kreditor_id",
                table: "users");

            migrationBuilder.DropForeignKey(
                name: "fk_user_kreditor_assignments_kreditoren_kreditor_id",
                table: "user_kreditor_assignments");

            migrationBuilder.DropForeignKey(
                name: "fk_user_kreditor_assignments_users_user_id",
                table: "user_kreditor_assignments");

            // Rename columns back
            migrationBuilder.RenameColumn(
                name: "kreditor_id",
                table: "users",
                newName: "tenant_id");

            migrationBuilder.RenameColumn(
                name: "kreditor_id",
                table: "templates",
                newName: "tenant_id");

            migrationBuilder.RenameColumn(
                name: "kreditor_id",
                table: "debtors",
                newName: "tenant_id");

            migrationBuilder.RenameColumn(
                name: "kreditor_id",
                table: "cases",
                newName: "tenant_id");

            migrationBuilder.RenameColumn(
                name: "kreditor_id",
                table: "user_kreditor_assignments",
                newName: "tenant_id");

            // Rename indexes back
            migrationBuilder.RenameIndex(
                name: "ix_users_kreditor_id",
                table: "users",
                newName: "ix_users_tenant_id");

            migrationBuilder.RenameIndex(
                name: "ix_templates_kreditor_id",
                table: "templates",
                newName: "ix_templates_tenant_id");

            migrationBuilder.RenameIndex(
                name: "ix_debtors_kreditor_id",
                table: "debtors",
                newName: "ix_debtors_tenant_id");

            migrationBuilder.RenameIndex(
                name: "ix_cases_kreditor_id",
                table: "cases",
                newName: "ix_cases_tenant_id");

            migrationBuilder.RenameIndex(
                name: "ix_kreditoren_contact_email",
                table: "kreditoren",
                newName: "ix_tenants_contact_email");

            migrationBuilder.RenameIndex(
                name: "ix_kreditoren_registration_number",
                table: "kreditoren",
                newName: "ix_tenants_registration_number");

            migrationBuilder.RenameIndex(
                name: "ix_user_kreditor_assignments_kreditor_id",
                table: "user_kreditor_assignments",
                newName: "ix_user_tenant_assignments_tenant_id");

            migrationBuilder.RenameIndex(
                name: "ix_user_kreditor_assignments_user_id",
                table: "user_kreditor_assignments",
                newName: "ix_user_tenant_assignments_user_id");

            // Rename tables back
            migrationBuilder.RenameTable(
                name: "kreditoren",
                newName: "tenants");

            migrationBuilder.RenameTable(
                name: "user_kreditor_assignments",
                newName: "user_tenant_assignments");

            // Recreate old foreign keys
            migrationBuilder.AddForeignKey(
                name: "fk_cases_tenants_tenant_id",
                table: "cases",
                column: "tenant_id",
                principalTable: "tenants",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_debtors_tenants_tenant_id",
                table: "debtors",
                column: "tenant_id",
                principalTable: "tenants",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_templates_tenants_tenant_id",
                table: "templates",
                column: "tenant_id",
                principalTable: "tenants",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_users_tenants_tenant_id",
                table: "users",
                column: "tenant_id",
                principalTable: "tenants",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_user_tenant_assignments_tenants_tenant_id",
                table: "user_tenant_assignments",
                column: "tenant_id",
                principalTable: "tenants",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_user_tenant_assignments_users_user_id",
                table: "user_tenant_assignments",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
