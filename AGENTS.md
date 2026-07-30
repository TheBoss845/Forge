<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- Single Next.js 16 (App Router) app; package manager is **npm** (`package-lock.json`). Dependencies are refreshed by the startup update script, so you normally don't need to run `npm install` yourself.
- No environment variables are required yet (Milestone 1). `.env.example` documents future Supabase/AI keys; copying it to `.env.local` is optional and not needed to run the app.
- Standard commands live in `package.json` scripts and the README table: `npm run dev` (Turbopack dev server on port 3000), `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build`.
- Theme switching (light/system/dark) is a three-button segmented control in the header powered by `next-themes`; preference persists in `localStorage`, so a reload keeps the last-selected theme.
