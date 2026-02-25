# Nexora — AI-Powered Portfolio SaaS

**Full Production Launch Plan**

| Field         | Value                                                  |
| ------------- | ------------------------------------------------------ |
| Author        | Mahadi Hassan                                                |
| Architecture  | Single Repo (Monorepo)                                 |
| Stack         | NestJS + Next.js 14 + PostgreSQL + Redis + Supabase + OpenAI |

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Architecture Overview](#2-architecture-overview)
3. [Multi-Tenant Strategy](#3-multi-tenant-strategy)
4. [Authentication & Security](#4-authentication--security)
5. [Core Modules](#5-core-modules)
6. [Admin Panel](#6-admin-panel)
7. [Super Admin Panel](#7-super-admin-panel)
8. [Subscription Architecture](#8-subscription-architecture)
9. [Usage Metering](#9-usage-metering)
10. [Observability](#10-observability)
11. [SEO Engine](#11-seo-engine)
12. [Storage & CDN](#12-storage--cdn)
13. [Backup Strategy](#13-backup-strategy)
14. [Feature Flags](#14-feature-flags)
15. [Development Roadmap](#15-development-roadmap)
16. [Future Enhancements](#16-future-enhancements)
17. [Launch Checklist](#17-launch-checklist)
18. [Business Model & Risk Mitigation](#18-business-model--risk-mitigation)

---

## 1. Product Vision

Build a **Multi-Tenant AI Portfolio SaaS Platform** where:

- Each user gets a unique subdomain:
  - `mahadi.domain.com`
  - `farhana.domain.com`
- AI Chat understands the portfolio owner deeply
- Timeline shows life achievements chronologically
- Blog system with optional guest identity
- Git statistics integration
- Admin panel for management
- Subscription system
- Super admin system
- Secure & scalable architecture

**Final Positioning:** This is not just a portfolio builder. This is **AI-Powered Personal Brand SaaS Infrastructure**.

---

## 2. Architecture Overview

### 2.1 Repository Structure (Single Repo)

```
root/
│
├── apps/
│   ├── web/                # Public marketing site (Next.js)
│   ├── portfolio/          # Public tenant portfolio app
│   ├── admin/              # Tenant admin panel
│   └── super-admin/        # SaaS owner dashboard
│
├── packages/
│   ├── ui/                 # Shared UI components
│   ├── config/             # Shared configs (eslint, tsconfig)
│   ├── types/              # Shared types
│   ├── utils/              # Shared helpers
│   └── validation/         # Zod schemas
│
├── server/
│   ├── api-gateway/        # Optional BFF layer
│   ├── auth-ms/            # Authentication service
│   ├── tenant-ms/          # Tenant management
│   ├── portfolio-ms/       # Public portfolio service
│   ├── blog-ms/            # Blog service
│   ├── timeline-ms/        # Timeline engine
│   ├── ai-ms/              # AI service (RAG)
│   ├── subscription-ms/    # Billing & plans
│   ├── analytics-ms/       # Usage & metrics
│   └── notification-ms/    # Emails / events
│
└── infra/
    ├── docker/
    ├── migrations/
    └── scripts/
```

### 2.2 High-Level Data Flow

```
Browser (subdomain request)
   │
   ▼
Next.js Middleware (resolve tenant from subdomain)
   │
   ▼
Portfolio App (SSR / ISR)
   │
   ▼
API Gateway (BFF)
   │
   ├──▶ auth-ms        (JWT validation, session)
   ├──▶ tenant-ms      (tenant context)
   ├──▶ portfolio-ms   (profile, skills, services)
   ├──▶ blog-ms        (posts, comments)
   ├──▶ timeline-ms    (events, achievements)
   ├──▶ ai-ms          (RAG chat)
   ├──▶ subscription-ms(plans, billing)
   ├──▶ analytics-ms   (metrics, usage)
   └──▶ notification-ms(emails, events)
         │
         ▼
    PostgreSQL + Redis + Supabase + S3
```

---

## 3. Multi-Tenant Strategy

**Approach:** Shared DB with `tenant_id` (Recommended)

Every table must contain:

```sql
tenant_id UUID NOT NULL
```

All queries must be scoped by:

```typescript
where: { tenantId: currentTenantId }
```

### Required Implementations

| Requirement                              | Detail                                                     |
| ---------------------------------------- | ---------------------------------------------------------- |
| PostgreSQL Row Level Security (RLS)      | Enforce tenant isolation at the database level              |
| Tenant Context Middleware                 | NestJS middleware to extract and inject `tenantId` per request |
| Tenant Resolver                          | Resolve tenant from subdomain, API key, or JWT claims      |
| Query Scoping                            | Every repository method must include `tenantId` in WHERE   |

### RLS Policy Example

```sql
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON portfolios
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

## 4. Authentication & Security

### Auth Strategy

| Component        | Implementation                        |
| ---------------- | ------------------------------------- |
| Auth Provider    | Supabase Auth                         |
| Access Token     | Short-lived JWT                       |
| Session Store    | Redis-based server-side session store |
| Refresh Token    | HTTP-only secure cookie               |

### Security Hardening Checklist

| Measure                    | Detail                                             |
| -------------------------- | -------------------------------------------------- |
| CSRF Protection            | Token-based CSRF for state-changing requests        |
| Rate Limiting              | Redis-backed, per-tenant and per-IP                 |
| Helmet                     | Security headers middleware                         |
| CORS                       | Strict origin rules, per-subdomain allowlist        |
| Request Validation         | Zod schemas on every endpoint                       |
| Audit Logging              | Log every write operation with actor + tenant       |
| Activity Logs              | User-facing activity history                        |
| API Throttling             | Tiered limits based on subscription plan            |
| IP Tracking                | Track and optionally block suspicious IPs           |
| AI Query Limits            | Per-plan caps on AI chat requests                   |
| Field Encryption           | Encrypt PII and sensitive fields at rest            |

### Auth Flow

```
1. User signs up / logs in via Supabase Auth
2. Supabase returns access_token + refresh_token
3. Server validates JWT, creates Redis session
4. refresh_token stored in HTTP-only cookie
5. On token expiry, refresh via cookie silently
6. On logout, destroy Redis session + clear cookie
```

---

## 5. Core Modules

### 5.1 Public Portfolio App

#### Features

- Hero section
- About
- Skills
- Services
- Git stats
- AI Chat
- Timeline
- Blogs preview
- Contact form

#### Subdomain Middleware (Next.js)

```typescript
// middleware.ts — Pseudocode
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');
  const subdomain = extractSubdomain(hostname);

  if (subdomain) {
    // 1. Resolve tenant from subdomain (check Redis cache first)
    // 2. Inject tenant context into request headers
    // 3. Rewrite URL to portfolio app with tenant context
    // 4. Apply tenant theme
  }
}
```

**Caching Strategy:**

- Subdomain-to-tenant mapping cached in Redis
- Portfolio data cached with tenant-scoped keys
- Cache invalidation on admin updates

---

### 5.2 AI Chat Engine (RAG)

#### Architecture

```
User Question
     │
     ▼
Retrieve Relevant Context (pgvector similarity search)
     │
     ▼
Inject into GPT Prompt (with system instructions + context)
     │
     ▼
Generate Answer (OpenAI API)
     │
     ▼
Return to User + Log token usage
```

#### Data Sources for Embeddings

- Resume
- Blogs
- Timeline events
- Projects
- Skills
- GitHub data

#### Database Schema

```sql
CREATE TABLE ai_documents (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL,
    content     TEXT NOT NULL,
    embedding   vector(1536),
    type        VARCHAR(50) NOT NULL,  -- 'resume', 'blog', 'timeline', 'project', 'skill', 'github'
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON ai_documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

#### Implementation Requirements

| Component                    | Detail                                              |
| ---------------------------- | --------------------------------------------------- |
| pgvector                     | PostgreSQL extension for vector similarity search    |
| Embedding Pipeline           | Generate embeddings on content create/update         |
| Background Re-embedding      | Queue-based re-embedding when source data changes    |
| Token Metering               | Track input + output tokens per request per tenant   |
| Rate Limiting                | Per-plan limits on AI queries                        |

---

### 5.3 Blog System

#### Features

- Markdown support (with sanitization)
- SEO optimized (meta tags, OpenGraph, schema markup)
- Public reading
- Optional guest comments
- Email verification for replies

#### Guest Identity Strategy

Store per guest interaction:

| Field              | Purpose                              |
| ------------------ | ------------------------------------ |
| email (optional)   | For reply notifications              |
| hashed fingerprint | Browser fingerprint (privacy-safe)   |
| device UUID        | Device identification                |
| IP                 | Rate limiting and abuse detection    |

Rate limit via Redis. Add moderation queue for all guest comments.

#### Blog Schema

```sql
CREATE TABLE blogs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL,
    title       VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) NOT NULL,
    content     TEXT NOT NULL,
    excerpt     TEXT,
    cover_image VARCHAR(500),
    published   BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);

CREATE TABLE blog_comments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_id         UUID NOT NULL REFERENCES blogs(id),
    tenant_id       UUID NOT NULL,
    guest_email     VARCHAR(255),
    guest_fingerprint VARCHAR(255),
    guest_device_id VARCHAR(255),
    guest_ip        INET,
    content         TEXT NOT NULL,
    approved        BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 5.4 Timeline Engine

#### Unified Content Model

```sql
CREATE TABLE timeline_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
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
```

#### Supported Types

| Type        | Description                  |
| ----------- | ---------------------------- |
| blog        | Published blog post          |
| achievement | Personal milestone           |
| education   | Degree, course, certification|
| role        | Job or position              |
| promotion   | Career advancement           |
| award       | Recognition or prize         |
| project     | Completed or ongoing project |

#### Filter Support

- Date range
- Type
- Category
- Tags

---

### 5.5 GitHub Stats

| Requirement      | Detail                                  |
| ---------------- | --------------------------------------- |
| GitHub API       | Fetch repos, contributions, languages   |
| Cron Refresh     | Daily scheduled refresh                 |
| Redis Cache      | Cache stats for fast serving            |
| DB Snapshot      | Store historical snapshots for trends   |

```sql
CREATE TABLE github_stats (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL,
    data        JSONB NOT NULL,
    fetched_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. Admin Panel

The tenant admin panel allows portfolio owners to manage their content and settings.

### Features

| Feature                | Description                                      |
| ---------------------- | ------------------------------------------------ |
| Profile Management     | Edit bio, avatar, social links, contact info     |
| Blog CRUD              | Create, edit, publish, delete blog posts         |
| Timeline CRUD          | Manage timeline events and achievements          |
| AI Knowledge Manager   | Upload/manage documents for RAG context          |
| GitHub Integration     | Connect GitHub account, configure sync           |
| Theme Customization    | Colors, fonts, layout preferences                |
| Domain Configuration   | Custom domain setup and verification             |
| Analytics              | View portfolio visits, AI chat usage, blog reads |
| Subscription View      | Current plan, usage, billing history             |

---

## 7. Super Admin Panel

The SaaS owner dashboard for platform-wide management.

### Features

| Feature                | Description                                      |
| ---------------------- | ------------------------------------------------ |
| Tenant Management      | View, search, edit all tenants                   |
| Suspend User           | Temporarily or permanently disable a tenant      |
| Subscription Plans     | Create, edit, archive pricing plans              |
| Revenue Dashboard      | MRR, churn, LTV, revenue charts                  |
| Feature Flags          | Toggle features globally or per-plan             |
| Usage Metrics          | Platform-wide AI consumption, storage, API calls |
| AI Consumption View    | Per-tenant AI token usage and costs              |
| System Logs            | Centralized audit and error logs                 |

---

## 8. Subscription Architecture

**Payment Provider:** Stripe

### Registration-to-Access Flow

```
1. User registers (Supabase Auth)
2. Email verified
3. Select plan (Starter / Pro / Business)
4. Stripe Checkout session created
5. Payment success → Stripe webhook fires
6. Tenant record created in DB
7. Subdomain generated and provisioned
8. Access granted based on plan features
```

### Required Implementations

| Requirement               | Detail                                               |
| ------------------------- | ---------------------------------------------------- |
| Webhook Validation        | Verify Stripe webhook signatures                     |
| Plan-Based Feature Limits | Gate features via `feature_flags` table              |
| AI Usage Metering         | Track and enforce AI query limits per billing cycle  |
| Trial System              | Free trial period with automatic conversion          |
| Grace Period              | Buffer after failed payment before suspension        |
| Failed Payment Handling   | Retry logic, notifications, eventual suspension      |

### Subscription Schema

```sql
CREATE TABLE plans (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    stripe_price_id VARCHAR(255) NOT NULL,
    features    JSONB NOT NULL,
    price_cents INTEGER NOT NULL,
    interval    VARCHAR(20) DEFAULT 'month',
    active      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID NOT NULL UNIQUE,
    plan_id           UUID NOT NULL REFERENCES plans(id),
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id     VARCHAR(255),
    status            VARCHAR(50) NOT NULL,  -- 'active', 'trialing', 'past_due', 'canceled', 'suspended'
    current_period_start TIMESTAMPTZ,
    current_period_end   TIMESTAMPTZ,
    trial_ends_at     TIMESTAMPTZ,
    canceled_at       TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 9. Usage Metering

Track resource consumption per tenant for billing enforcement and analytics.

### Tracked Metrics

| Metric         | Description                          |
| -------------- | ------------------------------------ |
| AI Tokens Used | Input + output tokens per AI request |
| Blog Count     | Total published blogs                |
| Storage Used   | Total file storage in bytes          |
| Timeline Count | Total timeline entries               |
| API Calls      | Total API requests per period        |
| Bandwidth      | Data transfer volume                 |

### Schema

```sql
CREATE TABLE usage_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    value       BIGINT NOT NULL,
    timestamp   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_logs_tenant_metric ON usage_logs (tenant_id, metric_type, timestamp);
```

### Aggregation

- Real-time counters in Redis for fast limit checks
- Periodic flush to `usage_logs` table for persistence
- Monthly rollup for billing cycle reports

---

## 10. Observability

| Tool / Practice         | Purpose                                          |
| ----------------------- | ------------------------------------------------ |
| Sentry                  | Error tracking and alerting                      |
| OpenTelemetry           | Distributed tracing across microservices         |
| Structured Logging      | JSON-formatted logs with correlation IDs         |
| Central Log Aggregation | Ship logs to centralized store (e.g., Loki, ELK) |
| Health Checks           | `/health` endpoint on every service              |
| Metrics Endpoint        | `/metrics` for Prometheus scraping               |

### Logging Standard

Every log entry must include:

```json
{
  "timestamp": "ISO-8601",
  "level": "info|warn|error",
  "service": "blog-ms",
  "tenantId": "uuid",
  "correlationId": "uuid",
  "message": "...",
  "metadata": {}
}
```

---

## 11. SEO Engine

| Feature                      | Implementation                                     |
| ---------------------------- | -------------------------------------------------- |
| Dynamic Sitemap per Tenant   | Generate `sitemap.xml` at `{subdomain}/sitemap.xml`|
| Meta Tags                    | Dynamic `<title>`, `<meta description>` per page   |
| OpenGraph Generation         | OG image, title, description for social sharing    |
| Blog Schema Markup           | JSON-LD `Article` schema for blog posts            |
| Robots Control               | Per-tenant `robots.txt` with configurable rules    |

### Implementation Notes

- Sitemaps generated at build time (ISR) or on-demand
- OpenGraph images can be generated dynamically using `@vercel/og`
- Schema markup injected via Next.js `metadata` API

---

## 12. Storage & CDN

| Service              | Usage                                    |
| -------------------- | ---------------------------------------- |
| S3 / Supabase Storage | Primary object storage                  |
| Cloudflare CDN       | Edge caching and delivery                |

### Stored Assets

- Profile images and avatars
- Resume files (PDF)
- Blog media (images, attachments)
- Portfolio media

### Upload Flow

```
Client → Presigned URL (from API) → Direct upload to S3/Supabase
   │
   └──▶ CDN URL returned for serving
```

---

## 13. Backup Strategy

| Schedule         | Action                                       |
| ---------------- | -------------------------------------------- |
| Daily            | Automated PostgreSQL database backup          |
| Weekly           | Full snapshot (DB + storage)                  |
| Redis            | AOF + RDB persistence configured             |

### Additional Requirements

- Disaster recovery documentation maintained and tested
- Backup verification (automated restore test monthly)
- Off-site backup storage (different region/provider)
- Point-in-time recovery enabled on PostgreSQL

---

## 14. Feature Flags

### Schema

```sql
CREATE TABLE feature_flags (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    plan_level  VARCHAR(50) NOT NULL,  -- 'starter', 'pro', 'business', 'all'
    enabled     BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### Controlled Features

| Feature        | Starter | Pro | Business |
| -------------- | ------- | --- | -------- |
| AI Chat        | 50/mo   | 500/mo | Unlimited |
| Custom Domain  | No      | Yes | Yes      |
| Analytics      | Basic   | Full | Full    |
| White Label    | No      | No  | Yes      |
| Blog Posts     | 10      | 50  | Unlimited |
| Storage        | 100MB   | 1GB | 10GB     |

### Usage in Code

```typescript
function canAccess(feature: string, tenant: Tenant): boolean {
  const flag = getFeatureFlag(feature);
  if (!flag || !flag.enabled) return false;
  if (flag.planLevel === 'all') return true;
  return planHierarchy[tenant.planLevel] >= planHierarchy[flag.planLevel];
}
```

---

## 15. Development Roadmap

### Phase 1 — Foundation

**Step 1: Monorepo & Infrastructure Setup**

- Initialize monorepo with Turborepo
- Setup Next.js apps (`web`, `portfolio`, `admin`, `super-admin`)
- Setup NestJS microservices
- Setup PostgreSQL + Redis (Docker Compose for local dev)
- Configure shared packages (`ui`, `config`, `types`, `utils`, `validation`)

**Step 2: Authentication**

- Setup Supabase Auth (email + OAuth providers)
- Implement Redis session store
- Implement JWT validation middleware in NestJS
- Setup refresh token rotation with HTTP-only cookies

**Step 3: Tenant System**

- Create tenant model and database schema
- Implement tenant resolver middleware (subdomain → tenant)
- Add tenant context injection to all service requests

---

### Phase 2 — Core Portfolio

**Step 4: Public Portfolio**

- Implement public portfolio layout and components
- Add subdomain routing in Next.js middleware
- Connect to `portfolio-ms` for dynamic data
- Implement theme system (per-tenant customization)

**Step 5: Blog System**

- Implement `blog-ms` (NestJS service)
- Add blog CRUD endpoints
- Build public blog reading view with SEO
- Add guest comment system with moderation queue

**Step 6: Timeline**

- Implement `timeline-ms` (NestJS service)
- Build timeline CRUD and display
- Add filter support (date, type, category, tags)

---

### Phase 3 — AI Engine

**Step 7: RAG Infrastructure**

- Setup pgvector extension
- Build embedding pipeline (content → OpenAI embedding → store)
- Create `ai-ms` (NestJS service)
- Implement RAG endpoint (retrieve context → generate answer)
- Build background re-embedding queue

**Step 8: Chat Interface**

- Connect chat UI component to AI service
- Add token metering (track usage per request)
- Add AI rate limiting (per-plan caps)
- Implement streaming responses

---

### Phase 4 — Subscription

**Step 9: Stripe Integration**

- Integrate Stripe (Checkout, Customer Portal, Webhooks)
- Implement webhook handler for all relevant events
- Create plan system with feature flag gating
- Add trial, grace period, and failed payment logic
- Build subscription management UI

---

### Phase 5 — Security Hardening

**Step 10: Production Security**

- Add Redis-backed rate limiting (per-IP, per-tenant)
- Add CSRF protection
- Implement audit logs (every write operation)
- Add structured logging with correlation IDs
- Implement PostgreSQL RLS policies on all tenant tables
- Add Helmet security headers
- Strict CORS configuration

---

### Phase 6 — Scaling & Optimization

**Step 11: Performance**

- Implement Redis caching strategy (tenant data, portfolio pages)
- Add background job processing (Bull/BullMQ)
- Add cron jobs (GitHub stats refresh, usage rollup, backup)
- Optimize database indexes
- Implement connection pooling (PgBouncer)

---

### Phase 7 — Super Admin

**Step 12: Platform Management**

- Build super admin UI (Next.js app)
- Add tenant management (list, search, suspend, delete)
- Add analytics dashboard (platform-wide metrics)
- Add revenue tracking and reporting
- Add system log viewer

---

### Phase 8 — Production Launch

**Step 13: Deployment & Operations**

- Setup Docker images for all services
- Setup CI/CD pipeline (GitHub Actions)
- Setup monitoring (Sentry + OpenTelemetry + Prometheus)
- Setup automated backups
- Load testing and performance validation
- Deploy to production infrastructure

---

## 16. Future Enhancements

| Feature              | Description                                          |
| -------------------- | ---------------------------------------------------- |
| AI Resume Builder    | Generate tailored resumes from portfolio data        |
| AI Interview Coach   | Practice interviews with AI based on portfolio       |
| Portfolio Score      | AI-generated portfolio quality and completeness score|
| Recruiter Mode       | Special view for recruiters with contact gating      |
| Voice-Based AI Chat  | Voice input/output for portfolio AI assistant        |
| Public API           | REST/GraphQL API for third-party integrations        |
| Affiliate System     | Referral program with commission tracking            |

---

## 17. Launch Checklist

- [ ] SSL enabled on all subdomains
- [ ] Backups configured and verified
- [ ] Rate limits active and tested
- [ ] Stripe webhook tested (all event types)
- [ ] AI limits enforced per plan
- [ ] SEO validated (sitemaps, meta tags, schema)
- [ ] CDN configured and cache rules set
- [ ] Load tested (target: concurrent users per plan)
- [ ] Monitoring active (Sentry, metrics, health checks)
- [ ] CORS and security headers verified
- [ ] RLS policies tested for tenant isolation
- [ ] Disaster recovery procedure documented and tested

---

## 18. Business Model & Risk Mitigation

### Pricing Tiers

| Feature          | Starter       | Pro           | Business       |
| ---------------- | ------------- | ------------- | -------------- |
| AI Queries       | 50/month      | 500/month     | Unlimited      |
| Storage          | 100 MB        | 1 GB          | 10 GB          |
| Blog Posts       | 10            | 50            | Unlimited      |
| Custom Domain    | No            | Yes           | Yes            |
| White Label      | No            | No            | Yes            |
| Analytics        | Basic         | Full          | Full           |
| Support          | Community     | Email         | Priority       |

### Risk Areas & Mitigation

| Risk                        | Impact  | Mitigation                                                |
| --------------------------- | ------- | --------------------------------------------------------- |
| AI Cost Explosion           | High    | Per-plan token caps, usage metering, cost alerts          |
| Multi-Tenant Data Leakage   | Critical| RLS policies, tenant-scoped queries, security audits      |
| Subdomain Routing Bugs      | High    | Comprehensive middleware tests, fallback to 404           |
| Stripe Webhook Failure      | High    | Idempotent handlers, retry queue, manual reconciliation   |
| Caching Inconsistencies     | Medium  | Cache invalidation on writes, short TTLs, versioned keys |
| AI Hallucination Risk       | Medium  | Strict RAG with source citation, confidence thresholds    |

### Mitigation Principles

1. **Strict RAG** — Only answer from embedded portfolio data, never hallucinate
2. **Tenant Scoping** — Every query, cache key, and storage path includes `tenant_id`
3. **Usage Caps** — Hard limits enforced at the API layer before reaching expensive services
4. **Logging & Alerting** — Every anomaly triggers an alert; every action is auditable

---

*This document is the authoritative reference for the Nexora platform. All implementation decisions should align with the architecture, security requirements, and roadmap defined here.*
