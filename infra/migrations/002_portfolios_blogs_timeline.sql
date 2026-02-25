-- Portfolio profile and skills
CREATE TABLE portfolios (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL UNIQUE REFERENCES tenants(id),
    bio         TEXT,
    tagline     VARCHAR(255),
    avatar_url  VARCHAR(500),
    social_links JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE portfolio_skills (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id),
    name        VARCHAR(100) NOT NULL,
    category    VARCHAR(50),
    sort_order  INT DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE portfolio_services (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id),
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order  INT DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Blogs
CREATE TABLE blogs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id    UUID NOT NULL REFERENCES tenants(id),
    title        VARCHAR(255) NOT NULL,
    slug         VARCHAR(255) NOT NULL,
    content      TEXT NOT NULL,
    excerpt      TEXT,
    cover_image  VARCHAR(500),
    published    BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_blogs_tenant ON blogs(tenant_id);
CREATE INDEX idx_blogs_published ON blogs(tenant_id, published, published_at DESC);

CREATE TABLE blog_comments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_id          UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    tenant_id        UUID NOT NULL REFERENCES tenants(id),
    guest_email      VARCHAR(255),
    guest_fingerprint VARCHAR(255),
    guest_ip         INET,
    content          TEXT NOT NULL,
    approved         BOOLEAN DEFAULT FALSE,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_comments_blog ON blog_comments(blog_id);

-- Timeline
CREATE TABLE timeline_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    type            VARCHAR(50) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    date            DATE NOT NULL,
    tags            TEXT[],
    related_blog_id UUID REFERENCES blogs(id),
    visibility      VARCHAR(20) DEFAULT 'public',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timeline_tenant ON timeline_items(tenant_id);
CREATE INDEX idx_timeline_date ON timeline_items(tenant_id, date DESC);
CREATE INDEX idx_timeline_type ON timeline_items(tenant_id, type);
