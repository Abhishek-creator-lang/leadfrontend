## How to structure your answer

Use **STAR-L**, and inside Action follow the arc of a good strategy: **diagnosis, guiding principles, coherent actions**.

1. **Situation**: the business context and why the current direction was not working.
2. **Task**: your role. Usually nobody asked you to write a vision; you saw the need.
3. **Action**: how you gathered input, what the core bets were, how you wrote and socialised it, and how you converted it into a roadmap.
4. **Result**: adoption and business outcomes 6–18 months later.
5. **Learning**: what you got wrong and adjusted.

Be ready to say the vision in two sentences. If you cannot, it was not clear enough.

## Model answer

**Situation.** At a travel booking company I was a staff engineer across four front-end teams: search, listing pages, booking and account. Each team had grown its own stack: two on an older Create React App setup, one on Next.js with the pages router, and one on a custom Express SSR server. The business wanted to expand into 12 new markets in 18 months, which meant localisation, SEO and performance in emerging markets with slower phones. Our listing pages had a p75 LCP of 4.1 seconds on mobile, and adding a locale took about six weeks across all teams.

**Task.** No one asked for a vision document, but the expansion plan assumed timelines our architecture could not support. I proposed to my director that I spend about half my time for six weeks writing one.

**Action.** I interviewed every tech lead and the product leads for the expansion, and I audited bundle sizes, render strategies and how each team handled i18n. The diagnosis came down to one sentence: four stacks meant every cross-cutting need, like locales or performance, was paid for four times.

The vision had three bets. One: a single rendering platform on Next.js with server-rendered, cache-friendly pages for SEO-critical routes. Two: shared foundations owned by a small platform group, covering i18n, design tokens, analytics and performance budgets. Three: a performance budget per route enforced in CI, because emerging markets would not forgive heavy JavaScript.

I wrote it as a six-page narrative with a clear "what we are not doing" section: no micro-frontends and no big-bang rewrite. Teams would move route by route as they touched them. I shared an early draft with the two most sceptical leads first, and one of them reshaped the migration order, which made him a co-author rather than a critic.

Then I translated it into a quarterly roadmap with an owner and exit metric for each milestone, and reviewed progress monthly with the directors.

**Result.** Within 15 months, 85% of traffic was served by the shared platform. Adding a locale went from six weeks to under one, and we launched 10 of the 12 markets on schedule. Mobile p75 LCP on listing pages fell to 2.2 seconds, and organic traffic in the new markets beat the forecast by 18%.

**Learning.** I initially underestimated the platform team's support load. We added an office-hours rotation and docs in quarter two; I would plan for that from the start now.

## Why this answer works

- **Tied to business strategy**: market expansion drove the vision, not a desire for new technology.
- **Sharp diagnosis**: "every cross-cutting need is paid for four times" is memorable and true.
- **Explicit non-goals** show judgement and reduce fear.
- **Influence through inclusion**: turning the sceptic into a co-author.
- **From vision to execution**: roadmap, owners, exit metrics and a regular review.
- **Long-horizon results** measured in business and user terms.

## Red flags to avoid

- A vision that is really "adopt framework X" with no link to user or business outcomes.
- Writing it alone and announcing it, with no input from the teams who must do the work.
- No path from today to the target, or a path that requires stopping product work.
- Claiming everyone agreed immediately. Real visions meet resistance.
- No measurement of whether it worked.
- Confusing a vision (direction and principles) with a detailed design spec.

## Likely follow-up probes

- **"How did you handle a team that didn't want to migrate?"** Explain the incentives: they migrated when they touched a route, platform features only available on the shared stack, and directors agreeing priorities.
- **"Why not micro-frontends?"** Talk about the cost of runtime composition, shared dependency issues and the fact that team autonomy was not the main problem.
- **"How did you keep the vision alive after the launch excitement?"** Monthly reviews, a progress dashboard and updating the document when assumptions changed.
- **"What would make you abandon the vision?"** Name signals, such as migration cost per route not dropping or a shift in business strategy.
- **"How do you write for executives vs engineers?"** A one-page summary with outcomes and costs, and appendices with technical detail.
