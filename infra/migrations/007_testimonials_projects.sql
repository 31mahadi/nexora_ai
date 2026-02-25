-- Testimonials (tenant-scoped)
CREATE TABLE testimonials (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id),
    quote       TEXT NOT NULL,
    author      VARCHAR(255) NOT NULL,
    role        VARCHAR(255),
    sort_order  INT DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_testimonials_tenant ON testimonials(tenant_id);

-- Projects (tenant-scoped)
CREATE TABLE portfolio_projects (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id),
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    image_url   VARCHAR(500),
    link_url    VARCHAR(500),
    tags        TEXT[],
    sort_order  INT DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portfolio_projects_tenant ON portfolio_projects(tenant_id);
