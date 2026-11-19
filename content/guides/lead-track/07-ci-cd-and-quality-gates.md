---
title: CI/CD and quality gates
description: Designing a front end delivery pipeline with fast feedback, meaningful quality gates, preview environments, trunk-based development, and DORA metrics to measure it.
source: original
---
A lead's influence on quality is mostly **systemic**: the pipeline decides what's easy, what's blocked, and how quickly mistakes are caught. A good front end pipeline makes the right thing the default and keeps feedback fast enough that people don't route around it.

## Goals of the pipeline

1. **Fast feedback:** most PR checks finish in under 10 minutes.
2. **Meaningful gates:** each check catches a real class of defect, with low flakiness.
3. **Safe, frequent releases:** deploy many times a day with low change-failure rate.
4. **Easy recovery:** rollback in minutes.

## A reference pipeline

```mermaid
flowchart LR
  PR[Pull request] --> Static[Lint, types, format]
  Static --> Unit[Unit and component tests]
  Unit --> Build[Build and bundle budgets]
  Build --> Preview[Preview deploy]
  Preview --> E2E[Smoke E2E, a11y, visual]
  E2E --> Merge[Merge to main]
  Merge --> Prod[Deploy behind flags]
  Prod --> Monitor[Canary checks and RUM]
```

| Stage | Checks | Target time | Blocking? |
| --- | --- | --- | --- |
| Static | ESLint (incl. hooks, a11y, import boundaries), TypeScript `tsc --noEmit`, Prettier/Biome check | < 2 min | Yes |
| Unit/component | Vitest/Jest + RTL, affected packages only | < 5 min | Yes |
| Build | Production build; bundle-size budgets (size-limit); dependency audit | < 5 min | Yes (budgets with exception process) |
| Preview | Per-PR deployment URL | < 5 min | — |
| Post-preview | Playwright smoke tests; axe checks; Lighthouse CI on key routes; visual regression | < 10 min | Smoke + axe yes; Lighthouse/visual as required reviews |
| Main | Full E2E suite, deploy to production (dark), progressive rollout | Continuous | Auto-halt on guardrails |

## Making it fast

| Technique | Effect |
| --- | --- |
| **Affected-only** builds and tests (Nx, Turborepo, custom git diff) | Avoids testing unchanged packages |
| **Remote caching** of task outputs | Skips work already done elsewhere |
| **Parallelization / sharding** of test suites | Linear speedups on E2E and large unit suites |
| Fast tools (Vite/Vitest, SWC/esbuild, Biome, Rspack/Turbopack) | 2–10× faster than older toolchains in many codebases |
| Dependency caching (pnpm store) | Cuts install time |
| Running cheap checks first | Fails fast |

**Measure CI time** (p50/p95) as a first-class metric. When p95 creeps above 15 minutes, developers start batching changes, which hurts quality.

## Quality gates that matter

### Static analysis

- `eslint-plugin-react-hooks` (now includes React Compiler-related rules), `jsx-a11y`, import boundary rules.
- TypeScript strict mode for new packages; track `any` and `@ts-expect-error` counts.
- Ban risky APIs with lint rules (`dangerouslySetInnerHTML` without sanitizer, direct `localStorage` token storage).

### Tests

- Integration-heavy test suite for components (see Testing React chapter).
- Coverage reported for visibility; **gate on changed lines** (e.g. ≥ 80% on diff) rather than a global percentage that punishes legacy.

### Bundle and performance

- size-limit or bundler stats with budgets per entry/route.
- Lighthouse CI on 3–5 key routes with assertions on TBT, LCP, CLS.

### Accessibility

- axe-core in component tests and Playwright (`@axe-core/playwright`). Block on new serious/critical violations.
- Automated checks catch only a portion of issues, so pair them with manual audits.

### Visual regression

- Chromatic (Storybook) or Playwright screenshots for design-system components and key pages.
- Changes require explicit approval, ideally by a designer for DS components.

### Security and supply chain

- Dependency vulnerability scanning (npm audit, Dependabot/Renovate, Snyk, Socket).
- Lockfile enforcement; block install scripts from untrusted packages where tooling allows.
- Secret scanning; no secrets in client bundles (env var allowlists like `VITE_`/`NEXT_PUBLIC_` reviewed).

## Flaky tests policy

Flaky tests destroy trust in the pipeline. A clear policy:

1. Auto-detect flakes (retry-pass patterns) and **quarantine** them within 24 hours (still run, not blocking).
2. Create a ticket assigned to the owning team with an SLA (e.g. one week).
3. Track flake rate per suite. Target < 1% of runs.
4. Delete tests that can't be stabilized and replace them with lower-level coverage.

## Branching and release strategy

| Strategy | Description | Fits |
| --- | --- | --- |
| Trunk-based development | Small PRs merged to main daily; flags hide incomplete work | Most product teams; highest DORA performance |
| GitHub flow | Short-lived feature branches; deploy from main | Small teams |
| Release branches | Stabilize releases on branches | Mobile/desktop apps, regulated releases, on-prem software |
| Long-lived feature branches | Weeks-long branches | Avoid: merge pain, integration risk |

For web front ends, **trunk-based development + feature flags + continuous deployment** is the standard to aim for.

## Preview environments

Per-PR preview URLs (Vercel, Netlify, Cloudflare Pages, or custom) transform collaboration:

- Product and design review real behavior before merge.
- E2E and Lighthouse run against a real deployment.
- Use mock or seeded back-end data, or point to a shared staging API with clear data isolation.

## Release safety

- Hashed immutable assets + short-cached HTML → instant rollback by repointing.
- Feature flags with ownership and expiry dates (stale flags are tech debt; lint for flags older than 90 days).
- Progressive rollout with automated guardrails (error rate, vitals, key journey success).
- Version skew handling: keep old chunks available; reload prompts on chunk load failures.

## Measuring delivery: DORA metrics

| Metric | Definition | Elite benchmark (approx.) |
| --- | --- | --- |
| Deployment frequency | How often you deploy to production | On demand / multiple per day |
| Lead time for changes | Commit to production | < 1 day |
| Change failure rate | % of deploys causing incidents or rollbacks | Low (often cited ~0–15%) |
| Failed deployment recovery time | Time to restore after a failed deploy | < 1 hour |

DORA's research also emphasizes **reliability** as a fifth dimension. Add front end specifics: CI p95 duration, flake rate, PR review turnaround, and preview environment usage.

## Rolling out pipeline changes as a lead

- Introduce new gates as **warnings first** for 2–4 weeks, publish the violation counts, then make them blocking.
- Fix the existing violations yourself (or with codemods) before blocking, so teams don't inherit a wall of red.
- Explain the *why* in an ADR and team demo.
- Provide an **escape hatch** with accountability (labelled override + follow-up ticket), audited monthly.

## Sample ADR: "Block merges on new axe violations"

- **Context:** 42 a11y bugs reported last quarter; 70% detectable by automated checks.
- **Decision:** Run `@axe-core/playwright` on smoke routes; block on new serious/critical violations; existing ones baselined.
- **Consequences:** +90 s CI time; a11y regressions caught pre-merge; baseline burn-down tracked weekly.
- **Review trigger:** if false positives exceed 5% of blocks in a month.

## Interview framing

> "Our CI took 35 minutes and was flaky, so people batched huge PRs. I moved us to pnpm and Turborepo with remote caching and affected-only tests, sharded Playwright, and quarantined 23 flaky tests with owners. p95 CI dropped to 9 minutes, and median PR size fell by 40%. Then we added bundle budgets and axe checks, warnings for a month, then blocking. Deploy frequency went from twice a week to eight times a day, with change failure rate flat at about 4%."
