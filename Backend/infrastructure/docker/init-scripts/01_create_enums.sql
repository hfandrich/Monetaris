-- =============================================
-- Monetaris Database Schema - Enums
-- =============================================
-- Diese Datei wird automatisch beim ersten Start
-- von PostgreSQL ausgeführt (docker-entrypoint-initdb.d)
-- =============================================

-- User Roles
CREATE TYPE user_role AS ENUM (
    'ADMIN',
    'AGENT',
    'CLIENT',
    'DEBTOR'
);

-- Case Status (ZPO-Workflow)
CREATE TYPE case_status AS ENUM (
    -- Vorgerichtlich
    'DRAFT',
    'NEW',
    'REMINDER_1',
    'REMINDER_2',
    'ADDRESS_RESEARCH',

    -- Gerichtliches Mahnverfahren
    'PREPARE_MB',
    'MB_REQUESTED',
    'MB_ISSUED',
    'MB_OBJECTION',

    -- Vollstreckungsbescheid
    'PREPARE_VB',
    'VB_REQUESTED',
    'VB_ISSUED',
    'TITLE_OBTAINED',

    -- Zwangsvollstreckung
    'ENFORCEMENT_PREP',
    'GV_MANDATED',
    'EV_TAKEN',

    -- Abschluss
    'PAID',
    'SETTLED',
    'INSOLVENCY',
    'UNCOLLECTIBLE'
);

-- Address Status
CREATE TYPE address_status AS ENUM (
    'UNKNOWN',
    'RESEARCH_PENDING',
    'CONFIRMED',
    'MOVED',
    'DECEASED'
);

-- Risk Score
CREATE TYPE risk_score AS ENUM (
    'A',  -- Excellent
    'B',  -- Good
    'C',  -- Average
    'D',  -- Poor
    'E'   -- Default
);

-- Document Type
CREATE TYPE document_type AS ENUM (
    'PDF',
    'IMAGE',
    'WORD',
    'EXCEL'
);

-- Inquiry Status
CREATE TYPE inquiry_status AS ENUM (
    'OPEN',
    'RESOLVED'
);

-- Template Type
CREATE TYPE template_type AS ENUM (
    'EMAIL',
    'LETTER',
    'SMS'
);

-- Template Category
CREATE TYPE template_category AS ENUM (
    'REMINDER',
    'LEGAL',
    'PAYMENT',
    'GENERAL'
);

-- Output message
DO $$
BEGIN
    RAISE NOTICE 'Enums created successfully!';
END $$;
