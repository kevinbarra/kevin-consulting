-- ====================================================================
-- KEVIN CONSULTING - PORTAL DE GESTIÓN DE CLIENTES Y COBRANZA
-- SCRIPT DE MIGRACIÓN Y MODELADO DE BASE DE DATOS (DDL & RLS)
-- ====================================================================

-- Habilitar extensión para generación de UUIDs (opcional pero recomendado)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. TIPOS ENUM (ESTADOS DE NEGOCIO Y ROLES)
-- --------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('admin', 'client');
CREATE TYPE billing_status AS ENUM ('pagado', 'pendiente', 'atrasado');
CREATE TYPE document_type_enum AS ENUM ('Contrato', 'Addendum', 'CSF');

-- --------------------------------------------------------------------
-- 2. CREACIÓN DE TABLAS RELACIONALES
-- --------------------------------------------------------------------

-- Tabla: users
-- Almacena las credenciales y el rol global para la autenticación
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla: clients
-- Almacena la información fiscal e identificadores comerciales del cliente
CREATE TABLE clients (
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

-- Tabla: billings
-- Almacena los registros de facturación y cobranza (conciliación fiscal)
CREATE TABLE billings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    concept VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0.00), -- Exacto, previene redondeos para el SAT
    status billing_status NOT NULL,
    payment_form VARCHAR(100),
    bank_destination VARCHAR(100),
    sat_uuid UUID, -- Almacena UUID del SAT de 36 caracteres de forma nativa
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla: documents
-- Almacena el repositorio de documentos cargados en el portal
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    document_type document_type_enum NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- --------------------------------------------------------------------
-- 3. ESTRUCTURA DE ÍNDICES DE RENDIMIENTO
-- --------------------------------------------------------------------

-- Índice implícito único: PostgreSQL ya indexa 'users(email)' y 'clients(user_id)' por restricciones UNIQUE.

-- Optimización de búsquedas y uniones en Billings por client_id
CREATE INDEX idx_billings_client_id ON billings(client_id);

-- Optimización de reportes administrativos globales por estatus
CREATE INDEX idx_billings_status ON billings(status);

-- Índice compuesto vital para la sección "Mi Cuenta" del portal de clientes
-- Agiliza de forma dramática consultas como "obtener facturas pendientes del cliente X"
CREATE INDEX idx_billings_client_status ON billings(client_id, status);

-- Optimización de búsquedas y carga de documentos por cliente
CREATE INDEX idx_documents_client_id ON documents(client_id);

-- --------------------------------------------------------------------
-- 4. SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- --------------------------------------------------------------------

-- Habilitar RLS en cada tabla
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE billings ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Política para: users
-- - El administrador puede ver/modificar todo.
-- - El cliente sólo puede interactuar con su propio registro de usuario.
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

-- Política para: clients
-- - El administrador puede ver/modificar todo.
-- - El cliente sólo puede interactuar con su propia información de perfil de cliente.
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

-- Política para: billings
-- - El administrador puede ver/modificar todo.
-- - El cliente sólo puede interactuar con facturas que pertenezcan a su perfil de cliente.
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

-- Política para: documents
-- - El administrador puede ver/modificar todo.
-- - El cliente sólo puede interactuar con documentos vinculados a su perfil de cliente.
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

-- Tabla: system_logs
-- Registra eventos de automatización del sistema (como la ejecución del cron job)
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

