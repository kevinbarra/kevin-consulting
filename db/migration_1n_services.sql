-- ====================================================================
-- KEVIN CONSULTING - MIGRACIÓN DE BASE DE DATOS (DDL & RLS)
-- ACTUALIZACIÓN DE MODELO A 1:N (CLIENTES -> MÚLTIPLES SERVICIOS/CONTRATOS)
-- ====================================================================

BEGIN;

-- 1. CREACIÓN DEL ENUM DE TIPO DE SERVICIO
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_type') THEN
        CREATE TYPE service_type AS ENUM ('recurrente', 'instalacion_proyecto');
    END IF;
END$$;

-- 2. CREACIÓN DE LA TABLA 'contracts_services'
CREATE TABLE IF NOT EXISTS contracts_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    service_name VARCHAR(255) NOT NULL,
    service_type service_type NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0.00),
    current_balance NUMERIC(12, 2) NOT NULL CHECK (current_balance >= 0.00), -- Restricción check para evitar saldos negativos
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. MODIFICACIÓN DE LA TABLA 'billings' (PAGOS/ABONOS)
-- Añadir service_id como FK (SET NULL en delete para preservar históricos contables)
ALTER TABLE billings 
    ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES contracts_services(id) ON DELETE SET NULL;

-- Añadir campos amount_paid, payment_date e internal_invoice_url
ALTER TABLE billings 
    ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(12, 2) DEFAULT 0.00 CHECK (amount_paid >= 0.00),
    ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS internal_invoice_url TEXT;

-- 4. CREACIÓN DE ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_contracts_services_client_id ON contracts_services(client_id);
CREATE INDEX IF NOT EXISTS idx_billings_service_id ON billings(service_id);

-- 5. SEGURIDAD A NIVEL DE FILA (RLS) EN 'contracts_services'
ALTER TABLE contracts_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts_services FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS contracts_services_policy ON contracts_services;

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

COMMIT;
