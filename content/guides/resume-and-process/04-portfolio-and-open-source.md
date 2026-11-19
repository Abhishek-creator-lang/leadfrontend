---
title: Portfolio and open source
description: How senior and lead front end engineers can use portfolios, open source, writing, and talks as evidence of skill and leadership, covering what to build, how to present it, and what hiring managers actually look at.
source: original
---
For junior engineers, a portfolio often stands in for missing work experience. For senior and lead engineers, it does a different job: it's **public evidence of judgment, craft, and influence** that's hard to convey on a one-page resume. Done well, it gets you past the resume screen, gives interviewers something concrete to discuss, and sometimes brings recruiters to you. Done badly, it's a pile of half-finished tutorial projects.

## What hiring managers actually look at

Most reviewers spend only a few minutes on your links. In that time they look for:

| Signal | Evidence |
| --- | --- |
| Craft | A polished, fast, accessible live demo; clean code structure |
| Judgment | READMEs and write-ups explaining decisions and trade-offs |
| Depth | A non-trivial problem solved well (performance, real-time, complex state, a11y) |
| Communication | Clear writing in docs, blog posts, PR discussions |
| Collaboration and leadership | Open source maintainership, reviews, RFCs, community involvement |
| Consistency | Sustained activity over time, not one burst |

They won't read your entire codebase. Make the best parts easy to find.

## Choosing what to show

### Option 1: a few deep projects (best for most)

Two or three substantial projects beat ten small ones. Good candidates for senior/lead engineers:

| Project idea | Shows |
| --- | --- |
| A headless, accessible component library (combobox, dialog, data grid) with docs | API design, a11y expertise, testing, documentation |
| A performance case study: take a slow public demo app and make it fast, with before/after metrics | Diagnosis, CWV expertise, measurement |
| A real-time collaborative app (CRDT-based editor, whiteboard) | Architecture, complex state, networking |
| A developer tool (ESLint plugin, codemod, Vite plugin, CLI) | Tooling depth, ecosystem understanding, leverage thinking |
| An offline-first PWA | Service workers, sync strategies, resilience |
| An RSC/streaming app with a write-up on boundaries and caching | Modern React architecture |

Choose projects related to the roles you want. If you're targeting design-system lead roles, the component library matters more than a game.

### Option 2: case studies from professional work

Many senior engineers can't share proprietary code, but you can often share **anonymized case studies**:

```markdown
## Case study: Cutting dashboard INP from 450ms to 160ms

**Context:** B2B analytics app; enterprise accounts with 40k+ row tables.
**Problem:** Filter interactions blocked the main thread for 400ms+ on mid-tier laptops.
**Approach:**
- Profiled with real-scale data; found aggregate recomputation + full table render
- Moved aggregation to a Web Worker; virtualized table; deferred non-urgent updates
- Added a large-dataset fixture to CI performance checks
**Results:** p75 INP 450 → 160 ms; zero perf-related support tickets in 2 quarters
**What I'd do differently:** Introduce realistic data fixtures from day one
```

Check your employment agreement and get approval if needed. Remove customer names, internal URLs, and exact revenue figures.

### Option 3: open source contributions

| Type | Signal | Effort |
| --- | --- | --- |
| Maintaining a library with real users | Very strong: ownership, API design, community | High, ongoing |
| Significant features or fixes in popular projects | Strong: works in unfamiliar codebases, collaborates | Medium |
| Documentation improvements | Moderate: communication, attention to detail | Low–medium |
| Issue triage and reviews | Moderate: judgment, community leadership | Medium, ongoing |
| Typo PRs | Negligible | — |

### Getting started in open source

1. Contribute to tools you already use at work, where you understand the pain points.
2. Read CONTRIBUTING.md and look for "good first issue" or "help wanted" labels.
3. Start with reproductions and documentation, then fixes.
4. For anything substantial, discuss in an issue first before writing a large PR.
5. Be patient and gracious in reviews. Maintainers are often volunteers.

## Writing and speaking

For lead roles, **writing may be the strongest portfolio item**, because it shows exactly the communication skill the job needs.

| Format | Ideas |
| --- | --- |
| Technical blog posts | Deep dives into problems you solved; migration retrospectives; explainers |
| Public RFC-style essays | "How we'd structure a front end platform for 10 teams" |
| Talks (meetups, conferences) | Case studies; recorded talks are easy to share |
| Internal-turned-public | With permission, publish sanitized versions of engineering blog posts |
| Newsletters / notes | Curated learning in your specialty |

Good topics come from your real work: what you learned, what went wrong, what you'd recommend. One thoughtful article every couple of months beats a burst of low-effort posts.

## Presenting your portfolio

### A personal site

Keep it simple, fast, and accessible. It's itself a portfolio piece.

- **Above the fold:** name, role focus ("Front end lead: design systems and performance"), and links to resume, GitHub, LinkedIn, and writing.
- **Featured work:** 3–4 items, each with a one-line summary, your role, technologies, outcome, and links (demo, code, write-up).
- **Writing/talks:** a list with dates.
- **Lighthouse and accessibility:** expect reviewers to check them. Score well, with semantic HTML, alt text, keyboard navigation, and good contrast.

### GitHub profile

- Pin your best 4–6 repositories.
- Each pinned repo has a strong README: what it is, why it exists, a screenshot or GIF, how to run it, key decisions, and tests.
- Use a profile README sparingly: a short intro and links.
- Archive or hide abandoned experiments if they distract.

### README template for a portfolio project

```markdown
# Accessible Combobox

A headless, WAI-ARIA compliant combobox for React 19 with async search,
virtualization for large option lists, and full keyboard + screen reader support.

[Live demo](https://example.dev/combobox) · [Docs](https://example.dev/combobox/docs)

## Why
Most combobox implementations I reviewed failed screen reader testing or
lacked async cancellation. This explores a correct, minimal API.

## Key decisions
- Prop getters over components → consumers keep full markup control
- `aria-activedescendant` instead of moving DOM focus → stable input focus on mobile
- AbortController per query → no out-of-order results

## Quality
- RTL + user-event tests; axe checks; manual NVDA/VoiceOver test notes
- Bundle: 3.1 KB gzipped

## Trade-offs and future work
- No multi-select yet; virtualization assumes fixed row height
```

## On the resume

- Add a short "Selected work" or "Open source & writing" section with 2–4 high-signal items.
- Quantify where possible: "Maintainer of X (1.2k GitHub stars, ~40k weekly npm downloads)".
- Link directly to the best artifact, not just your GitHub profile.

## In interviews

- Use portfolio projects for "Tell me about a technical challenge" if your professional work is confidential.
- Prepare to walk through one project's architecture and trade-offs for 10–15 minutes. Some companies use it as the deep-dive round.
- Bring it up naturally ("I explored exactly this trade-off in my combobox library…"), but don't let it replace professional stories for leadership questions.

## Time investment guidance

You don't need a portfolio to get hired as a senior or lead engineer. Strong professional stories matter more. Invest if:

- You're changing domains (e.g. back end → front end, or into design systems).
- Your work is mostly confidential and your resume undersells it.
- You want inbound opportunities or a public profile.
- You enjoy it. Sustainable side projects come from genuine interest.

A reasonable target for a working lead engineer: one maintained flagship project or a consistent open-source contribution stream, plus a few well-written articles or talks per year.

## Checklist

- [ ] 2–4 featured items aligned with target roles
- [ ] Each has a clear README or write-up with decisions, trade-offs, and outcomes
- [ ] Live demos are fast, accessible, and working
- [ ] Professional case studies anonymized and approved
- [ ] Writing or talks show communication skill
- [ ] Resume links directly to the best artifacts
- [ ] I can present one project in depth for 10–15 minutes
