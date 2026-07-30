# Forge

**Describe your business. Forge builds the software.**

Forge is an AI-powered platform that helps businesses describe the software
they need, plan it, generate it, customize it, test it, and deploy it. It
interviews the user, understands the business, produces an editable project
blueprint, and — in later phases — generates and deploys working applications.

## Current status

Forge is in early development and is being built in controlled milestones.
Nothing is simulated: a milestone is marked complete only when it works.

| Milestone              | Status      |
| ---------------------- | ----------- |
| 1. Project foundation  | ✅ Complete |
| 2. Marketing landing   | Up next     |
| 3. Authentication      | Planned     |
| 4. Business onboarding | Planned     |
| 5. Project dashboard   | Planned     |
| 6. Discovery interview | Planned     |
| 7. Blueprint workspace | Planned     |
| 8. Testing and polish  | Planned     |

## Technology

- [Next.js](https://nextjs.org) 16 (App Router) with React 19 and strict TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4 with a semantic design-token system
- [next-themes](https://github.com/pacocoursey/next-themes) for light / dark / system theming
- [Lucide](https://lucide.dev) icons; component primitives built with
  `class-variance-authority`, `clsx`, and `tailwind-merge`
- Planned: Supabase (auth, PostgreSQL, row-level security), Zod validation,
  a provider-abstracted AI layer

## Getting started

Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local   # no variables are required yet
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command                | Purpose                               |
| ---------------------- | ------------------------------------- |
| `npm run dev`          | Start the development server          |
| `npm run build`        | Production build                      |
| `npm run start`        | Serve the production build            |
| `npm run lint`         | ESLint                                |
| `npm run typecheck`    | TypeScript type checking (`--noEmit`) |
| `npm run format`       | Format all files with Prettier        |
| `npm run format:check` | Verify formatting without writing     |

## Project structure

```text
app/                  Routes (App Router). Route groups such as (marketing)
                      and (auth) are added as their milestones land.
components/
  layout/             Global chrome: header, footer, logo
  providers/          Client-side context providers (theming)
  ui/                 Reusable UI primitives (button, card, input, ...)
lib/
  utilities/          Small shared helpers
```

Planned directories (created with the milestone that needs them):
`features/` for domain logic (auth, projects, interviews, blueprints, ai),
`lib/ai/`, `lib/database/`, `lib/validation/`, `types/`, `tests/`, and
`supabase/` for migrations.

## Design system

All colors flow through semantic tokens defined in `app/globals.css`
(background, surface, elevated surface, borders, three text tiers, one
restrained accent, and success / warning / danger). Components reference
tokens — never raw color values. Light, dark, and system modes are supported,
and reduced-motion preferences are respected globally.

## Environment variables

Documented in [`.env.example`](.env.example). No variables are required for
Milestone 1; Supabase keys arrive with authentication (Milestone 3) and AI
provider configuration with the discovery interview (Milestone 6).
Server-only secrets (service-role keys, model API keys) are never exposed to
client code.

## Security posture

Security is a core product feature: validated input, row-level security on
every table, server-side handling of all secrets, rate-limited AI endpoints,
and no execution of untrusted generated code inside the Forge application.
These guarantees are implemented alongside the milestones that introduce the
corresponding surfaces.
