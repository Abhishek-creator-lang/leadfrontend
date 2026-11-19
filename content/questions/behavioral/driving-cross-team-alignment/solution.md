## How to structure your answer

Use **STAR**, and make the Action show three phases: **understand, decide, deliver**.

1. **Situation**: how many teams, what was shared, and the cost of being misaligned.
2. **Task**: your role and the limits of your authority.
3. **Action**: understanding each team's position, structuring the decision, making adoption cheap, and tracking it to completion.
4. **Result**: adoption numbers, the business outcome, and the relationship outcome.
5. **Learning**: what you would repeat as a pattern.

Name at least one team that pushed back and explain how you addressed their real concern.

## Model answer

**Situation.** I was the front-end lead for the platform team at a SaaS company with six product teams sharing a single customer-facing web app. Each team had added its own analytics calls over the years: three different SDKs, inconsistent event names, and roughly 1,100 distinct events, many duplicates. Product leadership could not trust funnel data, and the three SDKs together added about 140 KB of JavaScript to every page.

**Task.** Leadership asked my team to unify analytics in one quarter. I owned the plan, but every event lived in code owned by the product teams, each with its own roadmap.

**Action.** I started with one-on-ones with each team's tech lead and product manager. Their concerns were different. Growth feared losing historical data mid-experiment. Billing had compliance rules about what could be logged. Two teams simply had no spare capacity.

I wrote a short proposal with a single typed event schema, a thin wrapper library over one SDK, and three explicit decisions needing agreement: naming convention, who approves new events, and the migration deadline. I ran one 45-minute decision meeting with the leads, sent the options two days in advance, and agreed beforehand with our VP that if we could not reach consensus, our director would decide. We reached agreement in the meeting, with one change from Growth: a dual-write period so old and new events ran in parallel for four weeks to protect their experiments.

To make adoption cheap, my team wrote a codemod that converted about 70% of existing calls automatically and opened the PRs ourselves. The wrapper's TypeScript types made invalid events a compile error, and billing's compliance rules became a lint check rather than a review burden. For the two teams with no capacity, we did the migration for them and they only reviewed.

I tracked progress on a public dashboard showing each team's remaining legacy calls, and posted a short weekly update in the shared channel.

**Result.** All six teams migrated in 11 weeks. Events dropped from about 1,100 to 340 well-defined ones. Removing two SDKs cut 95 KB of JavaScript, and p75 Total Blocking Time fell by about 120 ms. The data team said funnel reports went from taking two days to reconcile to being self-serve. The event-approval process we agreed is still used two years later.

## Why this answer works

- **Understands incentives**: each team's real concern is named and addressed individually.
- **Structured decision**: pre-read, clear options, a fallback decision-maker agreed in advance.
- **Makes yes cheap**: codemods, PRs written for teams, types and lint rules instead of documents.
- **Visibility without blame**: a dashboard everyone could see, weekly updates.
- **Business and technical outcomes**: trustworthy data, less JavaScript, better TBT.
- **Durable process** that outlived the project.

## Red flags to avoid

- "I escalated to leadership and they told everyone to do it." Authority is not alignment.
- Treating other teams' concerns as obstacles rather than valid constraints.
- Endless meetings with no decision owner or deadline.
- A standard announced with no migration support, leaving teams to absorb the cost.
- Declaring success at agreement, before anything shipped.
- Naming and shaming teams who were slow.

## Likely follow-up probes

- **"What if one team had refused?"** Explain that you would understand the blocker, offer more help, and only escalate the trade-off to the shared manager with clear cost data.
- **"Why a dual-write period?"** It protected running experiments and allowed comparing old and new data before cutting over.
- **"How did you decide on the approval process for new events?"** Lightweight: a schema PR reviewed by the data team, with an SLA so it did not become a bottleneck.
- **"How did you prioritise which teams to migrate first?"** Start with a willing team to prove the codemod, then the highest-traffic areas for the performance win.
- **"What would you do differently?"** Mention involving the data team earlier in schema design, or something similar you genuinely learned.
