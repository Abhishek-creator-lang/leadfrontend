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
- **Local-first:** progress, notes and drafts are saved in `localStorage`, with JSON export and import in Settings.

## Getting started

```bash
npm install
npm run dev            # builds the content index, then starts Next.js on http://localhost:3100
npm run build          # type-checks and builds for production (pre-renders every page)
npm start              # serves the production build on http://localhost:3100
npm run verify:content # runs every coding solution against its tests (starters must fail)
npm run format         # formats the code with Prettier (format:check in CI)
```

## Stack

- Next.js 15 (App Router), React 19, TypeScript and MUI 5 (theme structure adapted from `mt-business-frontend`)
- Routes live in `src/app/`. Server components read `content/` from disk and every page is pre-rendered with
  `generateStaticParams`. Interactive screens are client components in `src/views/`.
- Redux Toolkit (`progress` slice persisted to localStorage, loaded after hydration)

```
src/
  app/         routes (server components): params, metadata, server-side content loading
  views/       client screens, one folder per feature (dashboard, questions, workspace, …)
  components/  shared UI (LinkCard, ProgressSummary, Section, QuestionList, Markdown, …)
  layout/      AppShell (app bar + sidebar) and Page/PageHeader
  content/     content index + lookups (index.ts), filesystem loaders (server.ts)
  constants/   app, layout, navigation, storage keys, timings, colors
  utils/       pure helpers (progress, format, files, date, download)
  store/ context/ hooks/ theme/ routes/
```
- `@codesandbox/sandpack-react`, `react-markdown` with GFM and highlight.js, and Mermaid for diagrams
- Vitest, jsdom and Testing Library to verify the content

## Content

All content lives in `content/`. Each question is a folder containing `meta.json`, `prompt.md` and `solution.md`, plus
`starter/`, `solution/` and tests for coding questions. `scripts/build-index.ts` validates everything with zod and
generates `src/content/index.generated.json`, and invalid content fails the build. See
[CONTENT_GUIDE.md](./CONTENT_GUIDE.md) for the authoring spec and [content-plan/CATALOG.md](./content-plan/CATALOG.md)
for the full catalog.

```
content/
  questions/<format>/<slug>/   javascript | user-interface | algorithms | quiz | system-design | behavioral
  guides/<guide>/NN-slug.md
  companies/<company>.md
  study-plans.json
  focus-areas.json
```
