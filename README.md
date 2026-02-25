# Nexora

AI-Powered Portfolio SaaS Platform — Multi-tenant, AI Chat, Timeline, Blog, Subscriptions.

## Stack

- **Monorepo:** Bun + Turborepo
- **Frontend:** Next.js 15, React 19, Tailwind CSS
- **Backend:** NestJS 11
- **Database:** PostgreSQL 18, Redis 8
- **Auth:** Supabase
- **Lint/Format:** Biome

## Prerequisites

- Node.js 24 LTS
- Bun 1.2+
- Docker & Docker Compose

## Quick Start

```bash
# Install dependencies
bun install

# Start infrastructure (PostgreSQL + Redis)
cd infra/docker && docker compose up -d && cd ../..

# Run migrations
export DATABASE_URL="postgres://nexora:nexora_dev@localhost:5432/nexora"
./infra/scripts/migrate.sh

# Start development
# All apps + services (19 processes):
bun run dev

# Or just essential apps (7 processes):
bun run dev:apps
```

Or use the setup script:

```bash
./infra/scripts/setup.sh
bun run dev
```

## Apps

| App          | Port | Purpose                    |
| ------------ | ---- | -------------------------- |
| web          | 3000 | Marketing site             |
| portfolio    | 3002 | Public tenant portfolios   |
| admin        | 3003 | Tenant admin panel         |
| super-admin  | 3004 | SaaS owner dashboard       |
| api-gateway  | 4000 | BFF / proxy                |
| auth-ms      | 3001 | Authentication             |
| tenant-ms    | 3005 | Tenant resolution          |
| portfolio-ms | 3006 | Profile, skills, services   |
| blog-ms      | 3007 | Blog CRUD                  |
| timeline-ms  | 3008 | Timeline CRUD              |
| ai-ms        | 3009 | AI endpoint stubs          |
| subscription-ms | 3010 | Subscription APIs       |
| analytics-ms | 3011 | Analytics endpoint stubs   |
| notification-ms | 3012 | Notification stubs      |

## Environment

Copy `.env.example` to `.env` and fill in Supabase credentials.

## Seeded Baseline (Full System)

Migrations `003_plans_subscriptions_seed_31mahadi.sql` and `004_seed_full_system.sql` seed:

- tenants: `31mahadi`, `farhana`
- plans: `Starter`, `Pro`
- subscriptions: active/trialing sample subscriptions
- portfolio profile + skills + services
- blogs
- timeline items

The seed migrations are idempotent, so rerunning `./infra/scripts/migrate.sh` keeps baseline data in sync.

For auth parity (Supabase + local DB mirror), run:

```bash
bun run seed:auth
```

This creates/updates seeded users in Supabase Auth and mirrors them into local `users` table with tenant/role mapping.

## Seeded Auth Users

`bun run seed:auth` ensures these deterministic users exist:

- `owner@nexora.dev` (`super-admin`)
- `admin31@nexora.dev` (`tenant-admin`, tenant `31mahadi`)
- `adminfarhana@nexora.dev` (`tenant-admin`, tenant `farhana`)
- `user31@nexora.dev` (`user`, tenant `31mahadi`)

Default password for local testing: `NexoraPass!123`

## End-to-End Smoke Test

```bash
# 1) Infra + migrations
cd infra/docker && docker compose up -d && cd ../..
export DATABASE_URL="postgres://nexora:nexora_dev@localhost:5432/nexora"
bash ./infra/scripts/migrate.sh
bun run seed:auth

# 2) Start apps/services
bun run dev
```

Then verify:

1. Landing page: `http://localhost:3000`
2. Public tenant portfolio: `http://31mahadi.localhost:3002`
3. Tenant admin login: `http://localhost:3003/login` (must be `tenant-admin` for `31mahadi`)
4. Super admin login: `http://localhost:3004/login` (must be `super-admin`)
5. Super admin dashboard shows active subscription card for `31mahadi`

If ports are stuck from previous runs:

```bash
for p in 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010 3011 3012 4000; do lsof -ti :$p | xargs kill -9 2>/dev/null; done
```

## Scripts

- `bun run build` — Build all packages (runs sequentially to avoid webpack chunk collisions)
- `bun run dev` — Start all apps in development
- `bun run seed:auth` — Seed Supabase auth users and local user mirror
- `bun run lint` — Run Biome check
- `bun run lint:fix` — Run Biome check and fix
- `bun run format` — Format with Biome
