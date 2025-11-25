-- =============================================
-- Monetaris Database Schema - Tables
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TENANTS (Mandanten/Gläubiger)
-- =============================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    contact_email VARCHAR(200) NOT NULL,
    bank_account_iban VARCHAR(34) NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tenants_email ON tenants(contact_email);
COMMENT ON TABLE tenants IS 'Mandanten/Gläubiger - Kunden die das Inkasso-System nutzen';

-- =============================================
-- USERS (Benutzer)
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(500) NOT NULL,
    role user_role NOT NULL,

    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    avatar_initials VARCHAR(5),
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_tenant ON users(tenant_id);
COMMENT ON TABLE users IS 'Benutzer mit Rollen: ADMIN, AGENT, CLIENT, DEBTOR';

-- =============================================
-- USER_TENANT_ASSIGNMENTS (Agent → Tenant Zuordnung)
-- =============================================
CREATE TABLE user_tenant_assignments (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),

    PRIMARY KEY (user_id, tenant_id)
);

CREATE INDEX idx_uta_user ON user_tenant_assignments(user_id);
CREATE INDEX idx_uta_tenant ON user_tenant_assignments(tenant_id);
COMMENT ON TABLE user_tenant_assignments IS 'Agents können mehrere Tenants betreuen';

-- =============================================
-- DEBTORS (Schuldner)
-- =============================================
CREATE TABLE debtors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    agent_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Identity
    is_company BOOLEAN NOT NULL DEFAULT FALSE,
    company_name VARCHAR(300),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(200),
    phone VARCHAR(50),

    -- Address (embedded)
    street VARCHAR(200),
    zip_code VARCHAR(10),
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Deutschland',
    address_status address_status DEFAULT 'UNKNOWN',
    address_last_checked TIMESTAMP,

    -- Risk & Stats
    risk_score risk_score DEFAULT 'C',
    total_debt DECIMAL(15,2) DEFAULT 0.00,
    open_cases INT DEFAULT 0,
    notes TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_debtor_name CHECK (
        (is_company = TRUE AND company_name IS NOT NULL) OR
        (is_company = FALSE AND first_name IS NOT NULL AND last_name IS NOT NULL)
    )
);

CREATE INDEX idx_debtors_tenant ON debtors(tenant_id);
CREATE INDEX idx_debtors_agent ON debtors(agent_id);
CREATE INDEX idx_debtors_risk ON debtors(risk_score);
CREATE INDEX idx_debtors_email ON debtors(email);

-- Full-text search index für Namen
CREATE INDEX idx_debtors_company_name_fts ON debtors USING GIN(to_tsvector('german', COALESCE(company_name, '')));
CREATE INDEX idx_debtors_person_name_fts ON debtors USING GIN(to_tsvector('german', COALESCE(first_name || ' ' || last_name, '')));

COMMENT ON TABLE debtors IS 'Schuldner (Personen oder Firmen)';

-- =============================================
-- CASES (Inkassofälle)
-- =============================================
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    debtor_id UUID NOT NULL REFERENCES debtors(id) ON DELETE RESTRICT,
    agent_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Financials
    principal_amount DECIMAL(15,2) NOT NULL CHECK (principal_amount >= 0),
    costs DECIMAL(15,2) DEFAULT 0.00 CHECK (costs >= 0),
    interest DECIMAL(15,2) DEFAULT 0.00 CHECK (interest >= 0),
    total_amount DECIMAL(15,2) GENERATED ALWAYS AS (principal_amount + costs + interest) STORED,
    currency VARCHAR(3) DEFAULT 'EUR',

    -- Workflow
    invoice_number VARCHAR(50) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status case_status DEFAULT 'NEW',
    next_action_date TIMESTAMP,

    -- Legal
    competent_court VARCHAR(200) DEFAULT 'Amtsgericht Coburg - Zentrales Mahngericht',
    court_file_number VARCHAR(50),

    -- AI/Notes
    ai_analysis TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cases_tenant ON cases(tenant_id);
CREATE INDEX idx_cases_debtor ON cases(debtor_id);
CREATE INDEX idx_cases_agent ON cases(agent_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_invoice ON cases(invoice_number);
CREATE INDEX idx_cases_due_date ON cases(due_date);
CREATE INDEX idx_cases_next_action ON cases(next_action_date);

COMMENT ON TABLE cases IS 'Inkassofälle mit ZPO-Workflow';

-- =============================================
-- CASE_HISTORY (Audit Log)
-- =============================================
CREATE TABLE case_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,

    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    actor VARCHAR(200) NOT NULL,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_case_history_case ON case_history(case_id);
CREATE INDEX idx_case_history_date ON case_history(created_at);
COMMENT ON TABLE case_history IS 'Audit-Log für alle Case-Änderungen';

-- =============================================
-- DOCUMENTS (Dokumente)
-- =============================================
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    debtor_id UUID NOT NULL REFERENCES debtors(id) ON DELETE CASCADE,

    name VARCHAR(300) NOT NULL,
    type document_type NOT NULL,
    size_bytes BIGINT NOT NULL CHECK (size_bytes > 0),
    file_path VARCHAR(500) NOT NULL,
    preview_url VARCHAR(500),

    uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_documents_debtor ON documents(debtor_id);
CREATE INDEX idx_documents_uploaded ON documents(uploaded_at);
COMMENT ON TABLE documents IS 'Dokumente (PDFs, Bilder) zu Schuldnern';

-- =============================================
-- INQUIRIES (Anfragen/Rückfragen)
-- =============================================
CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,

    question TEXT NOT NULL,
    answer TEXT,
    status inquiry_status DEFAULT 'OPEN',

    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

CREATE INDEX idx_inquiries_case ON inquiries(case_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created_by ON inquiries(created_by);
COMMENT ON TABLE inquiries IS 'Rückfragen zu Fällen';

-- =============================================
-- TEMPLATES (Kommunikationsvorlagen)
-- =============================================
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    type template_type NOT NULL,
    category template_category NOT NULL,

    subject VARCHAR(300),
    content TEXT NOT NULL,

    last_modified TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_templates_type ON templates(type);
CREATE INDEX idx_templates_category ON templates(category);
COMMENT ON TABLE templates IS 'Vorlagen für E-Mails, Briefe, SMS';

-- =============================================
-- REFRESH_TOKENS (JWT Refresh Tokens)
-- =============================================
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    revoked_at TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
COMMENT ON TABLE refresh_tokens IS 'JWT Refresh Tokens für Auth';

-- Output message
DO $$
BEGIN
    RAISE NOTICE 'All tables created successfully!';
END $$;
