using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MonetarisApi.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddInkassoFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "phone",
                table: "debtors",
                newName: "vat_id");

            migrationBuilder.RenameColumn(
                name: "is_company",
                table: "debtors",
                newName: "is_deceased");

            migrationBuilder.AddColumn<string>(
                name: "additional_address_info",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "bank_bic",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "bank_name",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "birth_country",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "birth_name",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "birth_place",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "city",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "city_district",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "country",
                table: "kreditoren",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "date_of_birth",
                table: "kreditoren",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "door_position",
                table: "kreditoren",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ebo_address",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "entity_type",
                table: "kreditoren",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "fax",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "file_reference",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "first_name",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "floor",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "gender",
                table: "kreditoren",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "house_number",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_deceased",
                table: "kreditoren",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "last_name",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "partners",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "phone_landline",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "phone_mobile",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "place_of_death",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "po_box",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "po_box_zip_code",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "register_court",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "represented_by",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "street",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "vat_id",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "zip_code",
                table: "kreditoren",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "additional_address_info",
                table: "debtors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "bank_bic",
                table: "debtors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "bank_iban",
                table: "debtors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "bank_name",
                table: "debtors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "birth_country",
                table: "debtors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "birth_name",
                table: "debtors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "birth_place",
                table: "debtors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "city_district",
                table: "debtors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "door_position",
                table: "debtors",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ebo_address",
                table: "debtors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "entity_type",
                table: "debtors",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "fax",
                table: "debtors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "file_reference",
                table: "debtors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "floor",
                table: "debtors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "gender",
                table: "debtors",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "house_number",
                table: "debtors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "partners",
                table: "debtors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "phone_landline",
                table: "debtors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "phone_mobile",
                table: "debtors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "place_of_death",
                table: "debtors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "po_box",
                table: "debtors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "po_box_zip_code",
                table: "debtors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "register_court",
                table: "debtors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "register_number",
                table: "debtors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "represented_by",
                table: "debtors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "additional_costs",
                table: "cases",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "claim_description",
                table: "cases",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "date_of_origin",
                table: "cases",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "interest_end_date",
                table: "cases",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "interest_on_costs",
                table: "cases",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "interest_rate",
                table: "cases",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "interest_start_date",
                table: "cases",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_variable_interest",
                table: "cases",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "payment_allocation_notes",
                table: "cases",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "procedure_costs",
                table: "cases",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "statute_of_limitations_date",
                table: "cases",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "additional_address_info",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "bank_bic",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "bank_name",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "birth_country",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "birth_name",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "birth_place",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "city",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "city_district",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "country",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "date_of_birth",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "door_position",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "ebo_address",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "entity_type",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "fax",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "file_reference",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "first_name",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "floor",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "gender",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "house_number",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "is_deceased",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "last_name",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "partners",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "phone_landline",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "phone_mobile",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "place_of_death",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "po_box",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "po_box_zip_code",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "register_court",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "represented_by",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "street",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "vat_id",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "zip_code",
                table: "kreditoren");

            migrationBuilder.DropColumn(
                name: "additional_address_info",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "bank_bic",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "bank_iban",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "bank_name",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "birth_country",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "birth_name",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "birth_place",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "city_district",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "door_position",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "ebo_address",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "entity_type",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "fax",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "file_reference",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "floor",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "gender",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "house_number",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "partners",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "phone_landline",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "phone_mobile",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "place_of_death",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "po_box",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "po_box_zip_code",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "register_court",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "register_number",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "represented_by",
                table: "debtors");

            migrationBuilder.DropColumn(
                name: "additional_costs",
                table: "cases");

            migrationBuilder.DropColumn(
                name: "claim_description",
                table: "cases");

            migrationBuilder.DropColumn(
                name: "date_of_origin",
                table: "cases");

            migrationBuilder.DropColumn(
                name: "interest_end_date",
                table: "cases");

            migrationBuilder.DropColumn(
                name: "interest_on_costs",
                table: "cases");

            migrationBuilder.DropColumn(
                name: "interest_rate",
                table: "cases");

            migrationBuilder.DropColumn(
                name: "interest_start_date",
                table: "cases");

            migrationBuilder.DropColumn(
                name: "is_variable_interest",
                table: "cases");

            migrationBuilder.DropColumn(
                name: "payment_allocation_notes",
                table: "cases");

            migrationBuilder.DropColumn(
                name: "procedure_costs",
                table: "cases");

            migrationBuilder.DropColumn(
                name: "statute_of_limitations_date",
                table: "cases");

            migrationBuilder.RenameColumn(
                name: "vat_id",
                table: "debtors",
                newName: "phone");

            migrationBuilder.RenameColumn(
                name: "is_deceased",
                table: "debtors",
                newName: "is_company");
        }
    }
}
