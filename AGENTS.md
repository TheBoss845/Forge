<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- Single Next.js 16 (App Router) + React 19 app. Package manager is **npm** (`package-lock.json`); the startup update script runs `npm ci`, so you normally don't need to install dependencies yourself.
- The app runs with **no environment variables**. Supabase (auth/database) and the AI provider are optional — when unset, the affected screens render an honest "not configured" notice instead of failing. So `/register`, `/login`, onboarding, projects, interviews, and blueprints are gated behind Supabase config, and AI features additionally need `AI_*` keys. See `.env.example` and `README.md` for the variable list; local Supabase requires applying `supabase/migrations/0001_initial_schema.sql`.
- Routes that need auth (`/dashboard`, `/projects/*`, `/onboarding`) return a 307 redirect to `/login` when Supabase is unconfigured or you're signed out — this is expected, not a bug.
- Standard commands are in `package.json` scripts / the README table: `npm run dev` (Turbopack dev server on port 3000), `npm run lint`, `npm run typecheck`, `npm test` (Vitest), `npm run format:check`, `npm run build`.
- The dev server uses Turbopack with hot reload; after changing dependencies restart `npm run dev` so new packages are picked up.
