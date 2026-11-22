# Lead Frontend

An interview-prep app for **senior and lead front end** roles. It covers JavaScript, React UI coding, algorithms,
quiz questions, front end system design and behavioral/leadership rounds. Its structure follows the GreatFrontEnd
interview dashboard (formats, study plans, focus areas, playbooks), but the content is its own. See
[LICENSES.md](./LICENSES.md).

## Features

- **Dashboard:** progress by format, streak, activity heatmap, continue-where-you-left-off, and recommended next questions.
- **Question bank:** filter by format, difficulty, quiz category, topic, company and completion. Supports search and sort, and filters are kept in the URL.
- **Coding workspace:** a Sandpack editor with a live React preview, a Jest-style test runner and a console.
  - Drafts autosave.
  - Reset or load the reference solution at any time.
  - Each question has solution and notes tabs.
- **Study plans:** Lead 75, 1 week, 1 month, 3 months, and the Senior/Lead track.
- **Focus areas:** accessibility, async, DSA, design-system components, DOM, forms, polyfills, lodash utilities, hooks, state, performance and security.
- **Guides:**
  - Front End Interview Playbook
  - System Design Playbook (RADIO)
  - React Playbook
  - Senior & Lead Track
  - Behavioral
  - Resume & negotiation
- **Company guides** for 36 companies.
- **Accounts:** sign up with email confirmation; progress, notes and drafts sync to your account (guests keep them in `localStorage`). JSON export and import in Settings.
- **Admin area:** user management, invitations and learner progress for admins and the super admin.

## Getting started

```bash
npm install
npm run dev            # starts Next.js on http://localhost:3100 (needs the database, see below)
npm run build          # type-checks and builds for production
npm start              # serves the production build on http://localhost:3100
npm run verify:content # runs every coding solution against its tests (starters must fail)
npm run format         # formats the code with Prettier (format:check in CI)
```

## Accounts and database

Guests can browse everything; their progress stays in `localStorage`. Signed-in users get their
progress stored in PostgreSQL (13+) and synced across devices. Guest progress is merged into the
account on first sign-in.

1. Copy `.env.example` to `.env.local` and set `DATABASE_URL`, `APP_URL` and the `SUPER_ADMIN_*` values.
2. `npm run db:migrate` creates the tables and the **super admin** (from `SUPER_ADMIN_*`). Change that
   password after the first sign-in (Account → Change password).
3. `npm run content:import` loads all learner content from `content/` into the database (once; safe to re-run).
4. Leave `SMTP_HOST` empty in development: emails (confirmation, invite, reset links) are printed to the
   server console instead of being sent.

```bash
npm run db:migrate         # apply pending migrations
npm run db:rollback        # undo the last batch
npm run db:status          # list applied / pending migrations
npm run db:make -- <name>  # new migration in db/migrations
```

| Role | Can do |
| --- | --- |
| Learner | Register (email confirmation), sign in, track progress, notes, drafts and study plans |
| Admin | Everything a learner can, plus `/admin`: overview stats, user list, learner progress, invite learners, activate/deactivate, send reset links, delete learners |
| Super admin | Exactly one (created by the migration, enforced by a unique index). Also creates and manages admins |

Credentials are never handled by admins: new accounts get an invite link to set their own password, and
"reset password" emails the user a reset link. Sessions are opaque random tokens (only their SHA-256 is
stored) in an httpOnly cookie; passwords are hashed with scrypt. Authorization is checked on every page and
Server Action in `src/server/auth/dal.ts`; `src/middleware.ts` only redirects guests away from
`/admin` and `/account`.

## Buy me a coffee (UPI)

All content is free. Visitors can optionally support the site by scanning a UPI QR code (or, on a phone,
tapping "Pay with UPI app"). The super admin configures it under **Admin → Buy me a coffee**
(`/admin/support`): turn it on, enter the UPI ID and payee name, suggested amounts, texts, an optional link
for supporters outside India, and where to show it (top bar, sidebar, dashboard; `/support` always works).
Settings are stored in the `settings` table (`npm run db:migrate`). Payments go directly to the UPI ID;
the app does not process or verify them.

## Stack

- Next.js 15 (App Router), React 19, TypeScript and MUI 5 (theme structure adapted from `mt-business-frontend`)
- Routes live in `src/app/`. Content is read from PostgreSQL (`src/server/content/catalog.ts`); pages render per
  request because the root layout reads the session. Interactive screens are client components in `src/views/`.
- PostgreSQL + Knex (migrations in `db/migrations`), Nodemailer, zod, Server Actions
- Redux Toolkit (`progress` slice: synced to the database for signed-in users, `localStorage` for guests)

```
src/
  app/         routes (server components): params, metadata, server-side content loading
  views/       client screens, one folder per feature (dashboard, questions, workspace, …)
  components/  shared UI (LinkCard, ProgressSummary, Section, QuestionList, Markdown, …)
  layout/      AppShell (app bar + sidebar) and Page/PageHeader
  content/     content types + lookups (client: `useContent()`, server: `getContent()`)
  server/      server-only: db (Knex), auth (sessions, tokens, DAL), mail, content catalog, repositories
  middleware.ts  redirects guests away from /admin and /account
  constants/   app, layout, navigation, storage keys, timings, colors
  utils/       pure helpers (progress, format, files, date, download)
  store/ context/ hooks/ theme/ routes/
```
- `@codesandbox/sandpack-react`, `react-markdown` with GFM and highlight.js, and Mermaid for diagrams
- Vitest, jsdom and Testing Library to verify the content

## Content (CMS)

All learner content (questions, guides and chapters, study plans, focus areas, company guides and the topic/company
tag lists) is stored in PostgreSQL and managed by admins under **Admin → Content** (`/admin/content`). Every item is
one JSON document validated by the zod schemas in `src/lib/validation/content.ts`.

- **Draft → Published.** Editors change a draft; learners only see the published copy until **Publish**. Unpublish,
  archive (hidden, progress kept) and restore are one click; never-published drafts can be deleted.
- **Editors:** Markdown with live preview for prompts, solutions, chapters and company guides; a file editor for
  starter / solution / test code with **Check tests** (runs the tests against the solution and the starter in the
  sandbox — advisory only); question pickers for study plans and focus areas; managed tag lists with rename/merge.
- **Revision history:** every save and publish is kept (last 50 saves per item); any revision can be restored
  into the draft.
- **Renames are safe:** changing a slug/format and publishing redirects the old URL, rewrites plan / focus-area
  references and moves learners' progress to the new id. Plans can only reference published questions, and a
  question used by a plan can't be archived or unpublished.
- Publishing bumps a content version; every server instance reloads the catalog on its next request.

`content/` is now an archive in the original file layout ([CONTENT_GUIDE.md](./CONTENT_GUIDE.md)):

```bash
npm run content:import             # files → database (adds missing items; --force overwrites CMS edits)
npm run content:export             # published database content → content/ (e.g. to commit a snapshot)
npm run verify:content             # runs every coding solution in content/ against its tests
```

```
content/
  questions/<format>/<slug>/   javascript | user-interface | algorithms | quiz | system-design | behavioral
  guides/<guide>/NN-slug.md
  companies/<company>.md
  study-plans.json
  focus-areas.json
```
