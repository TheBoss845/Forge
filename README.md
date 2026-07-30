# Forge

**Describe your business. Forge builds the software.**

Forge is an AI-powered platform for businesses that need custom software but
don't have a development team. You describe your business in plain language;
Forge interviews you like a senior consultant, then produces a complete,
editable, versioned project blueprint — users, roles, features, pages, data
models, workflows, integrations, and security requirements. Application
generation from approved blueprints is the next phase.

## What works today

- **Marketing site** — landing page with product explanation, examples,
  security overview, pricing preview, and FAQ.
- **Accounts** — email/password registration, sign-in, sign-out, password
  reset, email confirmation. Built on Supabase Auth with SSR sessions.
- **Business onboarding** — a three-step conversational flow that creates
  your organization and business profile. Drafts persist between visits.
- **Project dashboard** — projects with honest statuses, empty states, and a
  new-project flow seeded with example business prompts.
- **AI discovery interview** — an adaptive interview that asks one focused
  question at a time, never repeats itself, offers suggested answers, allows
  skipping, and maintains a live "business understanding" summary.
- **Blueprint workspace** — validated, versioned blueprints across 13
  sections with read-only rendering, direct section editing (validated
  before save), AI-powered revision, version history, and approval.
- **Built-in accounts on Netlify** — with no database at all, visitors can
  still create real accounts (email + password, scrypt-hashed, signed
  session cookies) backed by Netlify Blobs, and their projects sync across
  devices. Falls back to device-only workspaces when no storage exists;
  upgrades to full Supabase auth when a database is configured.
- **Honest states everywhere** — when a capability is missing, the affected
  screens say exactly that. Nothing is simulated.

- **Interactive prototype** — the builder renders a live, clickable
  prototype of the planned application straight from the blueprint: real
  pages, navigation, role switching, and forms/tables derived from your data
  models (clearly labeled as sample data).
- **Application generation (Phase 2)** — template-based generation turns the
  blueprint into a complete, runnable Next.js starter: one page per
  blueprint page, navigation, typed data models, sample data, and a
  ready-to-apply PostgreSQL schema. Browse the files in the Code tab and
  download the project as a ZIP. Deterministic and verified — the generated
  example app builds cleanly.
- **AI code modification (Phase 3)** — ask Forge to change a generated file
  in plain language, review a line-by-line diff before anything is saved,
  then apply it. Every generation, edit, and restore creates an immutable
  version snapshot with one-click rollback.
- **Deployment preparation (Phase 4)** — a guided Deploy tab: download,
  host on Netlify/Vercel, and connect real data, with an environment
  checklist derived from the blueprint's integrations. One-click deployment
  from inside Forge is future work and is labeled as such.

## Publishing

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for a complete plain-English guide to
putting Forge on the internet with Netlify (or Vercel), Supabase, and an AI
provider — including every environment variable and the auth URL setup.

## Technology

- [Next.js](https://nextjs.org) 16 (App Router) + React 19 + strict TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4 with a semantic design-token system (light/dark/system)
- [Supabase](https://supabase.com): Postgres, Auth, row-level security
- [Zod](https://zod.dev) validation of every external input, including all AI output
- [React Hook Form](https://react-hook-form.com) for forms
- Provider-abstracted AI layer (OpenAI-compatible or Anthropic, chosen by env)
- [Vitest](https://vitest.dev) for unit tests

## Getting started

Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app runs without
configuration; authenticated features activate once you add credentials.

### 1. Connect Supabase (accounts, projects, blueprints)

1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase SQL editor, run the contents of
   [`supabase/migrations/0001_initial_schema.sql`](supabase/migrations/0001_initial_schema.sql)
   (or use `supabase db push` with the CLI).
3. Copy the project URL and anon key from Project Settings → API into
   `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 2. Connect an AI provider (interview, blueprints)

Set in `.env.local`:

```bash
AI_PROVIDER=openai        # or "anthropic"
AI_MODEL=gpt-4o           # or e.g. "claude-sonnet-4-5"
AI_API_KEY=sk-...         # server-only, never exposed to the client
```

`AI_BASE_URL` optionally points the OpenAI provider at any
OpenAI-compatible API.

### Scripts

| Command                | Purpose                           |
| ---------------------- | --------------------------------- |
| `npm run dev`          | Start the development server      |
| `npm run build`        | Production build                  |
| `npm run start`        | Serve the production build        |
| `npm run lint`         | ESLint                            |
| `npm run typecheck`    | TypeScript type checking          |
| `npm test`             | Unit tests (Vitest)               |
| `npm run format`       | Format all files with Prettier    |
| `npm run format:check` | Verify formatting without writing |

## Architecture

```text
app/
  (marketing)/          Landing page
  (auth)/               Login, register, password reset
  (app)/                Authenticated app: dashboard, projects, settings
  auth/confirm/         Email link / OAuth code handling
  onboarding/           Business onboarding
components/
  ui/                   Primitives (button, card, input, alert, …)
  layout/               App shell, marketing header, footer, logo
  marketing/ onboarding/ projects/ interview/ blueprint/ auth/ settings/
features/
  auth/ organizations/ projects/ interviews/ blueprints/
                        Validation, server actions, queries, AI services
lib/
  ai/                   Provider abstraction (OpenAI-compatible, Anthropic),
                        JSON extraction, usage tracking
  database/             Supabase server/browser clients, config detection
  security/             Rate limiting
  analytics/            Structured product events
  utilities/            cn, slug, formatting, app URL
supabase/migrations/    SQL schema with row-level security
tests/                  Unit tests
types/                  Database row types
proxy.ts                Session refresh + optimistic route protection
```

Key decisions:

- **Server actions** own all mutations; every one re-validates input with
  Zod and re-checks authentication and authorization.
- **Row-level security** isolates organizations at the database layer;
  security-definer helper functions prevent policy recursion.
- **AI output is untrusted input**: every response is parsed, validated
  against a Zod schema, and given one structured repair attempt before the
  operation fails with a useful error.
- **Blueprint versions are immutable** — every edit (manual or AI) creates a
  new version; approval supersedes previous versions.
- **Rate limiting** on AI operations is an in-memory sliding window
  (documented limitation: per-instance; swap for a shared store before
  scaling horizontally).

## Security posture

- Secrets live only in server-side environment variables; the service-role
  key and AI keys never reach the client.
- Every table has row-level security; users can only reach organizations
  they belong to, enforced in Postgres, not just in application code.
- All external input — including AI responses — is validated with Zod.
- Redirect targets from query parameters are constrained to same-site paths.
- Password reset does not reveal whether an account exists.
- AI endpoints are rate limited per user.
- No AI-generated code is ever executed inside the Forge application.

## Roadmap

| Phase                                       | Status                              |
| ------------------------------------------- | ----------------------------------- |
| 1. Discovery + blueprints                   | ✅ Complete                         |
| 2. Template-based application generation    | ✅ Complete (sample-data starters)  |
| 3. AI code modification with diffs/versions | ✅ Complete (file-level edits)      |
| 4. Deployment                               | ◐ Guided deployment (one-click TBD) |
| 5. Advanced multi-agent generation          | Planned                             |
