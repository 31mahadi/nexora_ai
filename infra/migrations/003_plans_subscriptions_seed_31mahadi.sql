CREATE TABLE IF NOT EXISTS plans (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(100) NOT NULL UNIQUE,
    stripe_price_id  VARCHAR(255),
    features         JSONB NOT NULL DEFAULT '{}',
    price_cents      INTEGER NOT NULL DEFAULT 0,
    interval         VARCHAR(20) NOT NULL DEFAULT 'month',
    active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id              UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id                UUID NOT NULL REFERENCES plans(id),
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id     VARCHAR(255),
    status                 VARCHAR(30) NOT NULL DEFAULT 'active',
    current_period_start   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end     TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    trial_ends_at          TIMESTAMPTZ,
    canceled_at            TIMESTAMPTZ,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

INSERT INTO tenants (subdomain, name, owner_id, status, theme, settings)
VALUES (
    '31mahadi',
    '31 Mahadi',
    '11111111-1111-1111-1111-111111111111',
    'active',
    '{"primary":"#0f172a","accent":"#22c55e"}'::jsonb,
    '{"portfolioPublic": true}'::jsonb
)
ON CONFLICT (subdomain) DO UPDATE SET
    name = EXCLUDED.name,
    status = EXCLUDED.status,
    theme = EXCLUDED.theme,
    settings = EXCLUDED.settings,
    updated_at = NOW();

INSERT INTO plans (name, stripe_price_id, features, price_cents, interval, active)
VALUES (
    'Pro',
    'price_seed_pro',
    '{"projects": 50, "customDomain": true, "analytics": true}'::jsonb,
    2900,
    'month',
    TRUE
)
ON CONFLICT (name) DO UPDATE SET
    stripe_price_id = EXCLUDED.stripe_price_id,
    features = EXCLUDED.features,
    price_cents = EXCLUDED.price_cents,
    interval = EXCLUDED.interval,
    active = EXCLUDED.active,
    updated_at = NOW();

INSERT INTO subscriptions (
    tenant_id,
    plan_id,
    stripe_subscription_id,
    stripe_customer_id,
    status,
    current_period_start,
    current_period_end
)
SELECT
    t.id,
    p.id,
    'sub_seed_31mahadi',
    'cus_seed_31mahadi',
    'active',
    NOW(),
    NOW() + INTERVAL '30 days'
FROM tenants t
CROSS JOIN plans p
WHERE t.subdomain = '31mahadi' AND p.name = 'Pro'
ON CONFLICT (tenant_id) DO UPDATE SET
    plan_id = EXCLUDED.plan_id,
    stripe_subscription_id = EXCLUDED.stripe_subscription_id,
    stripe_customer_id = EXCLUDED.stripe_customer_id,
    status = EXCLUDED.status,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    canceled_at = NULL,
    updated_at = NOW();
