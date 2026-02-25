-- Full-system deterministic seed for local testing.
-- This migration is idempotent and safe to re-run.

INSERT INTO tenants (subdomain, name, owner_id, status, theme, settings)
VALUES
  (
    '31mahadi',
    '31 Mahadi',
    '11111111-1111-1111-1111-111111111111',
    'active',
    '{"primary":"#0f172a","accent":"#22c55e"}'::jsonb,
    '{"portfolioPublic": true}'::jsonb
  ),
  (
    'farhana',
    'Farhana',
    '22222222-2222-2222-2222-222222222222',
    'active',
    '{"primary":"#1e293b","accent":"#a855f7"}'::jsonb,
    '{"portfolioPublic": true}'::jsonb
  )
ON CONFLICT (subdomain) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  theme = EXCLUDED.theme,
  settings = EXCLUDED.settings,
  updated_at = NOW();

INSERT INTO plans (name, stripe_price_id, features, price_cents, interval, active)
VALUES
  (
    'Starter',
    'price_seed_starter',
    '{"projects":10,"customDomain":false,"analytics":false}'::jsonb,
    900,
    'month',
    TRUE
  ),
  (
    'Pro',
    'price_seed_pro',
    '{"projects":50,"customDomain":true,"analytics":true}'::jsonb,
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
  tenant_id, plan_id, stripe_subscription_id, stripe_customer_id, status,
  current_period_start, current_period_end, trial_ends_at, canceled_at
)
SELECT t.id, p.id, 'sub_seed_31mahadi', 'cus_seed_31mahadi', 'active', NOW(), NOW() + INTERVAL '30 days', NULL, NULL
FROM tenants t
JOIN plans p ON p.name = 'Pro'
WHERE t.subdomain = '31mahadi'
ON CONFLICT (tenant_id) DO UPDATE SET
  plan_id = EXCLUDED.plan_id,
  stripe_subscription_id = EXCLUDED.stripe_subscription_id,
  stripe_customer_id = EXCLUDED.stripe_customer_id,
  status = EXCLUDED.status,
  current_period_start = EXCLUDED.current_period_start,
  current_period_end = EXCLUDED.current_period_end,
  trial_ends_at = EXCLUDED.trial_ends_at,
  canceled_at = NULL,
  updated_at = NOW();

INSERT INTO subscriptions (
  tenant_id, plan_id, stripe_subscription_id, stripe_customer_id, status,
  current_period_start, current_period_end, trial_ends_at, canceled_at
)
SELECT t.id, p.id, 'sub_seed_farhana', 'cus_seed_farhana', 'trialing', NOW(), NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days', NULL
FROM tenants t
JOIN plans p ON p.name = 'Starter'
WHERE t.subdomain = 'farhana'
ON CONFLICT (tenant_id) DO UPDATE SET
  plan_id = EXCLUDED.plan_id,
  stripe_subscription_id = EXCLUDED.stripe_subscription_id,
  stripe_customer_id = EXCLUDED.stripe_customer_id,
  status = EXCLUDED.status,
  current_period_start = EXCLUDED.current_period_start,
  current_period_end = EXCLUDED.current_period_end,
  trial_ends_at = EXCLUDED.trial_ends_at,
  canceled_at = NULL,
  updated_at = NOW();

INSERT INTO portfolios (tenant_id, bio, tagline, avatar_url, social_links)
SELECT
  t.id,
  'I build SaaS and AI-powered products.',
  'Full-stack builder and problem solver',
  NULL,
  '{"github":"https://github.com/31mahadi","linkedin":"https://linkedin.com/in/31mahadi"}'::jsonb
FROM tenants t
WHERE t.subdomain = '31mahadi'
ON CONFLICT (tenant_id) DO UPDATE SET
  bio = EXCLUDED.bio,
  tagline = EXCLUDED.tagline,
  avatar_url = EXCLUDED.avatar_url,
  social_links = EXCLUDED.social_links,
  updated_at = NOW();

INSERT INTO portfolios (tenant_id, bio, tagline, avatar_url, social_links)
SELECT
  t.id,
  'Design-focused engineer shipping elegant products.',
  'Product-minded frontend engineer',
  NULL,
  '{"github":"https://github.com/farhana","linkedin":"https://linkedin.com/in/farhana"}'::jsonb
FROM tenants t
WHERE t.subdomain = 'farhana'
ON CONFLICT (tenant_id) DO UPDATE SET
  bio = EXCLUDED.bio,
  tagline = EXCLUDED.tagline,
  avatar_url = EXCLUDED.avatar_url,
  social_links = EXCLUDED.social_links,
  updated_at = NOW();

DELETE FROM portfolio_skills
WHERE tenant_id IN (
  SELECT id FROM tenants WHERE subdomain IN ('31mahadi', 'farhana')
);

INSERT INTO portfolio_skills (tenant_id, name, category, sort_order)
SELECT id, 'TypeScript', 'backend', 1 FROM tenants WHERE subdomain = '31mahadi'
UNION ALL
SELECT id, 'NestJS', 'backend', 2 FROM tenants WHERE subdomain = '31mahadi'
UNION ALL
SELECT id, 'Next.js', 'frontend', 3 FROM tenants WHERE subdomain = '31mahadi'
UNION ALL
SELECT id, 'React', 'frontend', 1 FROM tenants WHERE subdomain = 'farhana'
UNION ALL
SELECT id, 'Tailwind', 'frontend', 2 FROM tenants WHERE subdomain = 'farhana'
UNION ALL
SELECT id, 'Figma', 'design', 3 FROM tenants WHERE subdomain = 'farhana';

DELETE FROM portfolio_services
WHERE tenant_id IN (
  SELECT id FROM tenants WHERE subdomain IN ('31mahadi', 'farhana')
);

INSERT INTO portfolio_services (tenant_id, title, description, sort_order)
SELECT id, 'SaaS Development', 'Build secure multi-tenant products.', 1 FROM tenants WHERE subdomain = '31mahadi'
UNION ALL
SELECT id, 'API Architecture', 'Design scalable service APIs.', 2 FROM tenants WHERE subdomain = '31mahadi'
UNION ALL
SELECT id, 'UI Engineering', 'Responsive accessible interfaces.', 1 FROM tenants WHERE subdomain = 'farhana'
UNION ALL
SELECT id, 'Design Systems', 'Reusable component systems.', 2 FROM tenants WHERE subdomain = 'farhana';

DELETE FROM blogs
WHERE tenant_id IN (
  SELECT id FROM tenants WHERE subdomain IN ('31mahadi', 'farhana')
);

INSERT INTO blogs (tenant_id, title, slug, content, excerpt, published, published_at)
SELECT
  id,
  'How I Built Nexora',
  'how-i-built-nexora',
  'A practical walkthrough of building a multi-tenant AI SaaS.',
  'Architecture and lessons from building Nexora.',
  TRUE,
  NOW() - INTERVAL '2 days'
FROM tenants
WHERE subdomain = '31mahadi'
UNION ALL
SELECT
  id,
  'Designing For Conversion',
  'designing-for-conversion',
  'How design systems and content structure improve conversion.',
  'A framework for conversion-focused design.',
  TRUE,
  NOW() - INTERVAL '1 day'
FROM tenants
WHERE subdomain = 'farhana';

DELETE FROM timeline_items
WHERE tenant_id IN (
  SELECT id FROM tenants WHERE subdomain IN ('31mahadi', 'farhana')
);

INSERT INTO timeline_items (tenant_id, type, title, description, date, tags, related_blog_id, visibility)
SELECT
  t.id,
  'project',
  'Launched Nexora MVP',
  'First version of multi-tenant portfolio SaaS.',
  CURRENT_DATE - 7,
  ARRAY['saas', 'launch'],
  b.id,
  'public'
FROM tenants t
LEFT JOIN blogs b ON b.tenant_id = t.id AND b.slug = 'how-i-built-nexora'
WHERE t.subdomain = '31mahadi';

INSERT INTO timeline_items (tenant_id, type, title, description, date, tags, related_blog_id, visibility)
SELECT
  t.id,
  'achievement',
  'Reached 100 beta users',
  'Validated core product fit with beta cohort.',
  CURRENT_DATE - 1,
  ARRAY['growth'],
  NULL,
  'public'
FROM tenants t
WHERE t.subdomain = '31mahadi';

INSERT INTO timeline_items (tenant_id, type, title, description, date, tags, related_blog_id, visibility)
SELECT
  t.id,
  'project',
  'Shipped design system v1',
  'Unified components and design tokens across apps.',
  CURRENT_DATE - 5,
  ARRAY['design-system', 'frontend'],
  b.id,
  'public'
FROM tenants t
LEFT JOIN blogs b ON b.tenant_id = t.id AND b.slug = 'designing-for-conversion'
WHERE t.subdomain = 'farhana';
