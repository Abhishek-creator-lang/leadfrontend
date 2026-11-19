## How to structure your answer

Use **STAR**, with a clear measure, diagnose, fix, prove and protect sequence in the Action.

1. **Situation**: the product, the metric that was bad, and why it mattered.
2. **Task**: what you owned and what success meant in numbers.
3. **Action**: how you measured (field data first), what you found, the two or three biggest fixes, and how you proved the business impact.
4. **Result**: the vitals change *and* the business change, plus the guardrails you added.

Keep the technical part concrete but short; the interviewer will ask for more if they want it.

## Model answer

**Situation.** I led the web platform team at an online travel company. Our hotel details page was the main landing page from paid search, and Google Search Console showed most of its URLs as "poor" on mobile. Our RUM data, collected with the `web-vitals` library, showed p75 LCP at 4.6 seconds and p75 INP at 380 ms on mobile. Marketing was also seeing quality-score penalties on paid search.

**Task.** I proposed a six-week performance push for the page, with a goal of "good" Core Web Vitals at p75 on mobile and a measurable conversion effect.

**Action.** First, I built the business case. I bucketed real sessions by LCP and showed that sessions with LCP under 2.5 seconds booked at a 23% higher rate than those above 4 seconds. Correlation is not proof, so I committed to an A/B test to show causation. That got the product director to give us two engineers for six weeks.

Second, I diagnosed using field data broken down by element and device. The LCP element was the hero photo, but it was rendered by client-side JavaScript after a gallery bundle loaded. I moved the first image into the server-rendered HTML, added `fetchpriority="high"` and a responsive `srcset` with AVIF, and lazy-loaded the rest of the gallery. That alone took about 1.6 seconds off p75 LCP.

Third, for INP, a long-task profile showed that the date picker re-rendered the whole page on every hover because availability state lived at the top of the tree. We moved that state into the picker, memoised the room list, and split a 90 KB analytics bundle so it loaded after first interaction.

Fourth, I ran a two-week A/B test: half of mobile traffic got the optimised page.

**Result.** p75 mobile LCP went from 4.6 to 2.1 seconds, and INP from 380 to 160 ms; the page moved to "good" in CrUX within the 28-day window. The experiment showed a 4.2% increase in mobile booking conversion, worth about $5M a year, and marketing saw cost per click fall by roughly 7%. To protect it, I added Lighthouse CI budgets for the page's JavaScript size and LCP in pull requests, plus a RUM alert if p75 LCP rose by more than 15% week over week. A year later the page was still in the "good" range.

## Why this answer works

- **Field data first**: RUM and CrUX at p75, not a single Lighthouse score.
- **Business case before the work**, and an experiment to prove causation instead of relying on correlation.
- **Specific, correct fixes**: server-rendered hero image with `fetchpriority`, state colocation for INP, deferring non-critical bundles.
- **Two kinds of impact**: conversion and paid search cost.
- **Guardrails**: budgets in CI and an alert, so the win lasts.
- **Lead behaviours**: getting headcount by showing data, and owning the outcome rather than just the code.

## Red flags to avoid

- Quoting only a Lighthouse score from your laptop.
- "We improved performance and conversion went up" with no experiment or explanation of how you separated the effect.
- Listing generic best practices (minify, compress, use a CDN) with no diagnosis.
- No plan to stop regressions.
- Taking credit for a team effort without naming who did what.

## Likely follow-up probes

- **"Why p75 and not the median or p95?"** p75 is what Core Web Vitals assessment uses; it reflects most users while not being dominated by outliers. You may still watch p95 for slow devices.
- **"How did you make sure the A/B test was valid?"** Talk about sample size, running for full weeks, and checking that the test did not change anything else.
- **"What did not work?"** For example, a service worker precache that improved repeat visits but not landing pages.
- **"How do you prioritise performance against features long term?"** Budgets as non-functional requirements, a performance owner per area, and a regular review of vitals with product.
- **"How would you approach this on a single-page app with no SSR?"** Discuss preloading the LCP resource, route-level code splitting and moving to streaming SSR if justified.
