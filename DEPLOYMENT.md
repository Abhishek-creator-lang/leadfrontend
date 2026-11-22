# Deploying on Vercel + Neon (free tiers)

The app is a standard Next.js 15 project with a PostgreSQL database. This guide uses **Neon** (free Postgres,
0.5 GB — the content is ~12 MB) and **Vercel** (free Hobby plan). No code changes are needed; everything is
configured through environment variables.

## 1. Create the database (Neon)

1. Sign up at <https://neon.tech> and create a project (pick the region closest to your Vercel region, e.g.
   `aws-ap-south-1` for India).
2. On the project dashboard, open **Connect** and copy two connection strings:
   - **Pooled** (host contains `-pooler`) → used by the app on Vercel as `DATABASE_URL`.
   - **Direct** (no `-pooler`) → used by migrations and the content import as `DATABASE_URL_UNPOOLED`.

   Both end with `?sslmode=require`; keep that.

## 2. Create the tables, the super admin and the content (from your machine)

Create `.env.production.local` in the project root (git-ignored). The `db:*` and `content:*` scripts read it;
`npm run dev` ignores it, so local development keeps using your local database.

```bash
DATABASE_URL=postgresql://…-pooler.…neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://….neon.tech/neondb?sslmode=require
SUPER_ADMIN_EMAIL=you@yourdomain.com
SUPER_ADMIN_NAME=Your Name
SUPER_ADMIN_PASSWORD=a-long-unique-password
```

Then run:

```bash
npm run db:migrate        # tables + the single super admin
npm run content:import    # all questions, guides, plans, focus areas and companies
npm run db:status         # optional: confirm every migration is applied
```

Both commands are safe to re-run. Delete `SUPER_ADMIN_PASSWORD` from the file afterwards and change the
password after your first sign-in (Account → Change password).

> `npm start` on your machine also reads `.env.production.local`, so a local production server would use Neon.

## 3. Email (required in production)

Sign-up confirmation, invitations and password resets are sent by email. Without SMTP the links are only written to
the server logs, so real users could not register. Free options:

| Provider | Free tier | SMTP host / port |
| --- | --- | --- |
| Brevo | 300 emails/day | `smtp-relay.brevo.com` / `587` |
| Gmail (app password) | ~500/day, personal use | `smtp.gmail.com` / `465` |
| Resend | 3,000/month (needs a domain) | `smtp.resend.com` / `465` |

## 4. Deploy on Vercel

1. Push the repository to GitHub and **Import** it at <https://vercel.com/new> (framework: Next.js, defaults).
2. **Settings → Environment Variables** (Production, and Preview if you want previews):

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | Neon **pooled** connection string |
   | `APP_URL` | `https://<your-project>.vercel.app` (or your domain) — used in email links |
   | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | from your email provider |
   | `MAIL_FROM` | e.g. `Lead Frontend <no-reply@yourdomain.com>` (must be a sender your provider allows) |
   | `DB_POOL_MAX` | optional, default `3` on Vercel |

   `SUPER_ADMIN_*` and `DATABASE_URL_UNPOOLED` are **not** needed on Vercel (they're only for the scripts).
3. Deploy. The build doesn't touch the database; pages read it at request time.
4. Open the site, sign in with the super admin, and set up **Admin → Buy me a coffee** if you want it.

## 5. Updating later

- **Code changes:** push to GitHub; Vercel redeploys.
- **New migrations:** run `npm run db:migrate` locally (with `.env.production.local`) **before** or right after
  deploying the code that needs them.
- **Content:** edit in **Admin → Content** and publish — no redeploy. To snapshot it into Git:
  `npm run content:export` (writes the published content to `content/`).

## Notes and limits of the free setup

- **Neon free** suspends the database after ~5 minutes of inactivity; the first request afterwards takes ~1 s
  longer while it wakes up.
- **Login rate limiting** is kept in memory per server instance. On Vercel that only slows down repeated attempts
  that hit the same instance; add a shared store (e.g. Upstash Redis, free tier) if you need it to be strict.
- **Vercel Hobby** is for non-commercial use; a paid plan is required for commercial projects.
- Connections: the app uses Neon's pooler (`DATABASE_URL`) with a small pool per instance (`DB_POOL_MAX`, default 3),
  which keeps many short-lived serverless instances within Neon's connection limits.
