-- Local user mirror table for deterministic RBAC in dev.
-- Supabase remains the source of truth for authentication.
CREATE TABLE IF NOT EXISTS users (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_user_id UUID NOT NULL UNIQUE,
    email            VARCHAR(255) NOT NULL UNIQUE,
    role             VARCHAR(20) NOT NULL DEFAULT 'user',
    tenant_id        UUID REFERENCES tenants(id) ON DELETE SET NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
