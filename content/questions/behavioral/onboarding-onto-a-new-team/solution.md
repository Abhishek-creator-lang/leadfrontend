## How to structure your answer

Use **STAR**, with the Action organised by **time phases**: roughly the first 30, 60 and 90 days.

1. **Situation**: the team you joined, its state and any known problems.
2. **Task**: what you were expected to do, and what you deliberately chose not to do immediately.
3. **Action**: learn (people, code, product, data), then propose (a short written assessment), then act (one or two focused changes).
4. **Result**: concrete outcomes by the end of the period and beyond, including team sentiment.
5. **Learning**: what you would repeat in every new role.

## Model answer

**Situation.** I joined an online education company as the front-end lead for the learner experience team: five engineers, a product manager and a designer, responsible for the course player and progress tracking. The previous lead had left two months earlier. The team was shipping, but incidents were frequent, about three user-facing ones a month, and the last engagement survey showed low confidence in technical direction.

**Task.** My manager's expectation was simple: stabilise the team and set a direction. I set myself a personal rule of no significant changes in the first month.

**Action.** In the first 30 days I focused on learning. I had one-on-ones with each engineer, asking what they were proud of, what frustrated them and what they would change if they were me. I met the PM, designer, support lead and the two teams we depended on. In the code, I took small bugs from the backlog to learn the build, deploy and test flow, and I read the last six months of incident reviews.

Patterns appeared quickly. Most incidents came from the video progress sync, where client and server state drifted when learners switched devices. Engineers said the same thing in different words: no one owned that code, and changes there felt dangerous. Pull requests also sat for days because everyone waited for one senior engineer to review.

In week five I wrote a two-page "what I've heard" document summarising the themes in the team's own words, with three proposed priorities, and reviewed it with the team before sharing it with my manager. They changed one priority, which mattered for buy-in.

From day 60, we acted. I paired with the engineer who knew the progress sync best to write an ADR for a single source of truth: the server owns progress, the client sends idempotent events with timestamps, and a reconciliation step handles offline updates. We shipped it behind a flag over three sprints. In parallel, I set up a review rotation and a CODEOWNERS file so review load was shared.

**Result.** By the end of my first quarter, user-facing incidents went from about three a month to one, and the next quarter had zero linked to progress sync. Support tickets about lost progress fell by 70%. Median PR review time dropped from 2.5 days to under one. In the next engagement survey, confidence in technical direction rose from 48% to 81% favourable.

**Learning.** Writing back what I heard, in the team's language, was the most useful thing I did. People trusted the plan because they recognised themselves in it.

## Why this answer works

- **Listen before acting**: a deliberate no-big-changes rule and structured one-on-ones.
- **Learns the code by doing**: small bugs and incident reviews, not just reading docs.
- **Synthesises and reflects back**: a written document the team shaped.
- **Focus**: two high-leverage changes, not a list of ten.
- **Measured results** in reliability, speed and team confidence.
- **Builds credibility through technical leadership**: pairing on an ADR with the team's expert rather than taking over.

## Red flags to avoid

- Arriving and immediately rewriting, re-platforming or changing every process.
- Criticising the previous lead or the team's past decisions.
- Only learning the code and ignoring people, or only meeting people and never touching the code.
- Vague results like "the team got better".
- Taking credit for work the team was already doing.
- A plan that is the same for every company, with no sign you adapted to the context.

## Likely follow-up probes

- **"What if you had found a serious problem in week one?"** Explain that you would act quickly on genuine risks (security, data loss) while still waiting on opinions and style changes.
- **"How did you handle the senior engineer who was the review bottleneck?"** Frame it as relieving them, not taking power away, and give them ownership of mentoring the rotation.
- **"How do you learn a large codebase quickly?"** Trace a key user flow end to end, read the build and deploy pipeline, look at the most-changed files and the incident history.
- **"What would you do differently at a much larger company?"** More stakeholder mapping, more time reading existing strategy docs, and longer listening periods.
- **"How did you build trust with your manager?"** Weekly written updates and early agreement on what success at 90 days looked like.
