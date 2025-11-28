-- Flyway Migration: V1__baseline_schema.sql
-- Description: Baseline schema for Monetaris (matches EF Core InitialCreate)
-- Author: AI-First Development
-- Date: 2024

-- This migration serves as a baseline for Flyway
-- It should match the existing EF Core migration: 20251124202743_InitialCreate

-- Note: If the database already has these tables (from EF Core),
-- Flyway will skip this migration due to baselineOnMigrate=true

-- Enums are created in init-scripts/01_create_enums.sql
-- Tables are created in init-scripts/02_create_tables.sql

-- This file exists to establish the Flyway baseline version
-- Future migrations should be numbered V2__, V3__, etc.

SELECT 'Baseline migration complete' AS status;
