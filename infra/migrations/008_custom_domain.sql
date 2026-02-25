-- Custom domain per tenant
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_tenants_custom_domain ON tenants(custom_domain) WHERE custom_domain IS NOT NULL;
