# Publishing Forge — a plain-English guide

This guide takes you from the code in this repository to a real website that
anyone can visit. No prior experience needed. Everything here has a free
tier — you can launch without paying anything.

## The 15-minute version: OpenAI key only, no database

Forge has a full **guest mode**: visitors go to `/try`, answer the AI
interview, get their blueprint and interactive prototype, and download their
starter code — all without accounts. Their progress is saved in their own
browser. When Forge detects that no database is configured, the whole site
automatically points people to this experience.

For this you need exactly ONE secret:

1. Get an OpenAI API key (Part 2 below, ~5 minutes).
2. Deploy to Netlify (Part 3 below, ~10 minutes) and add just one
   environment variable: name it `OPENAI_API_KEY` (or `AI_API_KEY` — both
   work), value = your key. Forge assumes OpenAI and the `gpt-4o` model
   unless you also set `AI_PROVIDER` / `AI_MODEL`.
3. Deploy. Done — a real, working AI product.

Add **Supabase** later (Part 1) whenever you want visitor accounts, saved
projects, teams, and the full workspace. Nothing breaks in the meantime;
Forge simply unlocks those features when the keys appear.

---

## The full version: accounts + database + AI

Set up three things:

1. **Supabase** — the database where accounts and projects live.
2. **An AI key** — what powers the interview and blueprints.
3. **Netlify** — the service that puts the website on the internet.

---

## Part 1: Set up the database (Supabase)

1. Go to [supabase.com](https://supabase.com) and click **Start your
   project**. Sign up with your GitHub account (easiest) or email.
2. Click **New project**. Give it a name like `forge`, choose a strong
   database password (save it somewhere safe — you rarely need it, but don't
   lose it), pick the region closest to your customers, and click **Create
   new project**. Wait a minute or two while it sets up.
3. Now create the tables. In the left sidebar click **SQL Editor**, then
   **New query**. Open the file `supabase/migrations/0001_initial_schema.sql`
   from this repository, copy ALL of it, paste it into the editor, and click
   **Run**. You should see "Success. No rows returned". That one step created
   every table Forge needs, with security rules that keep each business's
   data private.
4. Get your two keys. In the left sidebar click the gear icon (**Project
   Settings**), then **API**. You need two values from this page:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon public** key — a long string starting with `eyJ...`

   Keep this tab open; you'll paste these into Netlify in Part 3.

5. One more Supabase step you'll finish AFTER Netlify gives you a website
   address (Part 4): telling Supabase what your site's address is, so
   confirmation emails link to the right place.

---

## Part 2: Get an AI key

Forge's interviewer and blueprint writer need an AI provider. Pick ONE:

**Option A — OpenAI (recommended if unsure)**

1. Go to [platform.openai.com](https://platform.openai.com) and create an
   account.
2. Add a small amount of billing credit (Settings → Billing) — $5 goes a
   very long way for interviews and blueprints.
3. Go to **API keys**, click **Create new secret key**, and copy it. It
   starts with `sk-`. You can only see it once, so paste it somewhere safe
   right away.
4. Your three values for later:
   - `AI_PROVIDER` = `openai`
   - `AI_MODEL` = `gpt-4o`
   - `AI_API_KEY` = the `sk-...` key you just copied

**Option B — Anthropic (Claude)**

1. Go to [console.anthropic.com](https://console.anthropic.com), create an
   account, and add billing credit.
2. Create an API key under **API Keys**.
3. Your three values for later:
   - `AI_PROVIDER` = `anthropic`
   - `AI_MODEL` = `claude-sonnet-4-5`
   - `AI_API_KEY` = the key you copied

Treat this key like a bank card number: never share it, never put it in the
code, only paste it into Netlify's environment variables (next part).

---

## Part 3: Put the website online (Netlify)

1. Go to [netlify.com](https://www.netlify.com) and sign up **with your
   GitHub account**. This matters — it lets Netlify see your repository.
2. Click **Add new site → Import an existing project → GitHub**.
3. Authorize Netlify when GitHub asks, then pick this repository from the
   list.
4. Netlify will detect Next.js automatically. Leave the build settings
   alone (build command `npm run build` — the included `netlify.toml`
   already tells Netlify everything it needs).
5. **Before clicking Deploy**, click **Add environment variables** (or go to
   Site configuration → Environment variables after creating the site) and
   add these, one at a time. Spelling matters — copy the names exactly:

   | Name                            | Value                                  |
   | ------------------------------- | -------------------------------------- |
   | `OPENAI_API_KEY`                | your secret AI key from Part 2         |
   | `NEXT_PUBLIC_SUPABASE_URL`      | (optional) Project URL from Part 1     |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (optional) anon public key from Part 1 |
   | `NEXT_PUBLIC_APP_URL`           | your site address — see the note below |

   Naming notes: the AI key can be `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`,
   or the generic `AI_API_KEY` — Forge understands all three and infers the
   provider. Set `AI_PROVIDER` / `AI_MODEL` only if you want something other
   than the defaults (`openai` / `gpt-4o`). The two Supabase variables are
   only needed for accounts and saved projects; without them Forge runs in
   guest mode.

   Note on `NEXT_PUBLIC_APP_URL`: you won't know your site's address until
   Netlify creates it. Skip it for now, and come back to fill it in during
   Part 4.

6. Click **Deploy**. Netlify builds the site (takes 2–4 minutes the first
   time). When it finishes you'll get an address like
   `https://something-random-12345.netlify.app`. Click it — your site is
   live!
7. Optional but nice: rename the site. Go to Site configuration → Site
   details → **Change site name** and pick something like `forge-yourname`,
   giving you `https://forge-yourname.netlify.app`.

---

## Part 4: Connect the two ends (5 minutes, don't skip)

Right now Supabase doesn't know your website's address, so account
confirmation emails would point to the wrong place. Fix that:

1. Copy your Netlify address (e.g. `https://forge-yourname.netlify.app`).
2. In Netlify: Site configuration → Environment variables → add or edit
   `NEXT_PUBLIC_APP_URL` and set it to that address.
3. In Supabase: left sidebar → **Authentication** → **URL Configuration**:
   - Set **Site URL** to your Netlify address.
   - Under **Redirect URLs**, click **Add URL** and add:
     `https://forge-yourname.netlify.app/auth/confirm`
     (using your real address).
4. Back in Netlify: go to **Deploys** and click **Trigger deploy → Deploy
   site**, so the site picks up the new variable.

---

## Part 5: Prove it works

1. Visit your site. The landing page should load with no warnings.
2. Click **Start building** and create an account with a real email.
3. Check your inbox for the confirmation email, click the link — you should
   land back on your site, signed in, at the business onboarding.
4. Complete onboarding, create a project, answer a few interview questions,
   and generate a blueprint. If all of that works, you are fully live.

---

## If something goes wrong

- **"Authentication is not configured yet" on the sign-in page** — the two
  `NEXT_PUBLIC_SUPABASE_...` variables are missing or misspelled in Netlify.
  Fix them, then trigger a new deploy (variables only apply to new deploys).
- **"The AI interviewer is not configured yet"** — same story for
  `AI_PROVIDER` / `AI_MODEL` / `AI_API_KEY`.
- **The confirmation email link goes to localhost** — you skipped Part 4.
  Set Site URL and the redirect URL in Supabase, set `NEXT_PUBLIC_APP_URL`
  in Netlify, and redeploy.
- **Build fails on Netlify** — open the deploy log, and check the Node
  version: Site configuration → Build & deploy → Environment → add
  `NODE_VERSION` = `22` if needed.
- **AI answers fail with a rate/quota error** — your OpenAI/Anthropic
  account is out of credit. Top it up on the provider's billing page.

## A custom domain later (optional)

When you buy a domain (e.g. `forgeapp.com`), add it in Netlify under
**Domain management → Add a domain**, follow their DNS instructions, then
update `NEXT_PUBLIC_APP_URL`, and the Site URL + redirect URL in Supabase to
the new domain, and redeploy. HTTPS is automatic and free.

## Deploying to Vercel instead

Forge also works on [Vercel](https://vercel.com) with zero configuration:
Import the repository, add the same environment variables, deploy, then do
Part 4 exactly the same way.
