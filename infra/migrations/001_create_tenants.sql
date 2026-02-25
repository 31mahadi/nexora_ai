CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE tenants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subdomain       VARCHAR(63) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    owner_id        UUID NOT NULL,
    status          VARCHAR(20) DEFAULT 'active',
    theme           JSONB DEFAULT '{}',
    settings        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tenants_subdomain ON tenants (subdomain);
CREATE INDEX idx_tenants_owner ON tenants (owner_id);
CREATE INDEX idx_tenants_status ON tenants (status);
