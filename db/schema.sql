-- ====================================================================
-- KEVIN CONSULTING - PORTAL DE GESTIÓN DE CLIENTES Y COBRANZA
-- SCRIPT DE MIGRACIÓN Y MODELADO DE BASE DE DATOS (DDL & RLS)
-- ====================================================================

-- Habilitar extensión para generación de UUIDs (opcional pero recomendado)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. TIPOS ENUM (ESTADOS DE NEGOCIO Y ROLES)
-- --------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'client');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_status') THEN
        CREATE TYPE billing_status AS ENUM ('pagado', 'pendiente', 'atrasado');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type_enum') THEN
        CREATE TYPE document_type_enum AS ENUM ('Contrato', 'Addendum', 'CSF');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_type') THEN
        CREATE TYPE service_type AS ENUM ('recurrente', 'instalacion_proyecto');
    END IF;
END$$;

-- --------------------------------------------------------------------
-- 2. CREACIÓN DE TABLAS RELACIONALES
-- --------------------------------------------------------------------

-- Tabla: users
-- Almacena las credenciales y el rol global para la autenticación
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla: clients
-- Almacena la información fiscal e identificadores comerciales del cliente
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    rfc VARCHAR(13) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    tax_regime VARCHAR(100) NOT NULL,
    cfdi_use VARCHAR(10) NOT NULL,
    fiscal_tracked BOOLEAN DEFAULT TRUE NOT NULL,
    cutoff_day INTEGER NOT NULL CHECK (cutoff_day BETWEEN 1 AND 31),
    subtotal NUMERIC(12, 2) DEFAULT 0.00 NOT NULL CHECK (subtotal >= 0.00), -- Monto mensual pactado
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla: contracts_services
-- Almacena los contratos o servicios específicos del cliente (modelo 1:N)
CREATE TABLE IF NOT EXISTS contracts_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    service_name VARCHAR(255) NOT NULL,
    service_type service_type NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0.00),
    current_balance NUMERIC(12, 2) NOT NULL CHECK (current_balance >= 0.00), -- Evita saldos negativos
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla: billings
-- Almacena los registros de facturación y cobranza (conciliación fiscal)
CREATE TABLE IF NOT EXISTS billings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    service_id UUID REFERENCES contracts_services(id) ON DELETE SET NULL, -- Relación con el servicio
    concept VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0.00), -- Exacto, previene redondeos para el SAT
    status billing_status NOT NULL,
    payment_form VARCHAR(100),
    bank_destination VARCHAR(100),
    sat_uuid UUID, -- Almacena UUID del SAT de 36 caracteres de forma nativa
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    amount_paid NUMERIC(12, 2) DEFAULT 0.00 CHECK (amount_paid >= 0.00), -- Abonos de pago
    payment_date TIMESTAMPTZ,
    internal_invoice_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla: documents
-- Almacena el repositorio de documentos cargados en el portal
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    document_type document_type_enum NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla: system_logs
-- Registra eventos de automatización del sistema (como la ejecución del cron job)
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- --------------------------------------------------------------------
-- 3. ESTRUCTURA DE ÍNDICES DE RENDIMIENTO
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_billings_client_id ON billings(client_id);
CREATE INDEX IF NOT EXISTS idx_billings_status ON billings(status);
CREATE INDEX IF NOT EXISTS idx_billings_client_status ON billings(client_id, status);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_services_client_id ON contracts_services(client_id);
CREATE INDEX IF NOT EXISTS idx_billings_service_id ON billings(service_id);

-- --------------------------------------------------------------------
-- 4. SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- --------------------------------------------------------------------

-- Habilitar RLS en cada tabla
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients FORCE ROW LEVEL SECURITY;

ALTER TABLE contracts_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts_services FORCE ROW LEVEL SECURITY;

ALTER TABLE billings ENABLE ROW LEVEL SECURITY;
ALTER TABLE billings FORCE ROW LEVEL SECURITY;

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY;

-- Limpieza de políticas previas para evitar colisiones
DROP POLICY IF EXISTS users_policy ON users;
DROP POLICY IF EXISTS clients_policy ON clients;
DROP POLICY IF EXISTS contracts_services_policy ON contracts_services;
DROP POLICY IF EXISTS billings_policy ON billings;
DROP POLICY IF EXISTS documents_policy ON documents;

-- Políticas de RLS
CREATE POLICY users_policy ON users
    FOR ALL
    USING (
        NULLIF(current_setting('app.current_user_role', true), '') = 'admin'
        OR id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
    )
    WITH CHECK (
        NULLIF(current_setting('app.current_user_role', true), '') = 'admin'
        OR id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
    );

CREATE POLICY clients_policy ON clients
    FOR ALL
    USING (
        NULLIF(current_setting('app.current_user_role', true), '') = 'admin'
        OR user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
    )
    WITH CHECK (
        NULLIF(current_setting('app.current_user_role', true), '') = 'admin'
        OR user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
    );

CREATE POLICY contracts_services_policy ON contracts_services
    FOR ALL
    USING (
        NULLIF(current_setting('app.current_user_role', true), '') = 'admin'
        OR client_id IN (
            SELECT id FROM clients
            WHERE user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
        )
    )
    WITH CHECK (
        NULLIF(current_setting('app.current_user_role', true), '') = 'admin'
        OR client_id IN (
            SELECT id FROM clients
            WHERE user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
        )
    );

CREATE POLICY billings_policy ON billings
    FOR ALL
    USING (
        NULLIF(current_setting('app.current_user_role', true), '') = 'admin'
        OR client_id IN (
            SELECT id FROM clients
            WHERE user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
        )
    )
    WITH CHECK (
        NULLIF(current_setting('app.current_user_role', true), '') = 'admin'
        OR client_id IN (
            SELECT id FROM clients
            WHERE user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
        )
    );

CREATE POLICY documents_policy ON documents
    FOR ALL
    USING (
        NULLIF(current_setting('app.current_user_role', true), '') = 'admin'
        OR client_id IN (
            SELECT id FROM clients
            WHERE user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
        )
    )
    WITH CHECK (
        NULLIF(current_setting('app.current_user_role', true), '') = 'admin'
        OR client_id IN (
            SELECT id FROM clients
            WHERE user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
        )
    );
