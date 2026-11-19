## How to structure your answer

Use **STAR**, and make the Action section about decisions, not hours worked.

1. **Situation**: why the deadline was fixed. An external reason (a regulation, a partner launch, an event) is more convincing than "my manager wanted it".
2. **Task**: your role and what "done" meant.
3. **Action**: three moves are usually enough. A re-plan, a scope or risk decision, and how you ran the team day to day.
4. **Result**: hit or miss, the quality outcome, and the cost (technical debt, overtime) you then paid down.
5. **Optional learning**: what you would do earlier next time.

## Model answer

**Situation.** I was the front-end lead at a retail bank when a new regulation required us to show a standardised fee summary and a cooling-off cancellation flow in the web banking app. The regulator's date was fixed, and the requirements were only finalised seven weeks before it. Our first estimate, done before I joined the planning, was eleven weeks.

**Task.** I was responsible for the front-end delivery across three squads: accounts, cards and loans. Each product had its own screens and its own legacy components.

**Action.** First, I re-planned from the regulation outward. I sat with our compliance lead for an afternoon and mapped every requirement to the exact screen and wording it needed. That showed that about 30% of the estimated work was "nice to have" redesign the squads had bundled in, such as new illustrations and an animated timeline. I separated it out into a phase two with the product owners' agreement.

Second, I removed duplication. Instead of three squads building three fee summaries, I had one engineer build a single `FeeSummary` component and a schema-driven cancellation form in our design system in the first two weeks, while the squads built the API integration in parallel against a mocked contract. That took the critical path from eleven weeks down to about six.

Third, I protected the things we could not get wrong. Accessibility and the exact legal copy were non-negotiable, so I added an axe check and a copy-snapshot test to CI for those screens, and booked an external accessibility audit for week five rather than the end.

Fourth, I ran a fifteen-minute daily cross-squad check-in with a single risk board, and sent a short written status to the steering group every Friday with a clear red/amber/green status.

**Result.** We went live five days before the deadline with zero compliance findings in the regulator's review and no accessibility blockers from the audit. Overtime was limited to two evenings in the final week. Phase two shipped six weeks later. The shared `FeeSummary` component was later reused for two other disclosures, saving an estimated three weeks each time.

**Learning.** I would now insist on a requirement-to-screen mapping with compliance at the very start of any regulated project; it found more scope than any estimate session.

## Why this answer works

- **A believable fixed deadline** with an external cause.
- **Scope was cut with stakeholders**, not quietly. The must-have/nice-to-have split was agreed with product owners.
- **Architecture as a schedule lever**: building one shared component turned three parallel efforts into one.
- **Quality was protected explicitly**: accessibility and legal copy were guarded by automated checks, and the audit was moved earlier.
- **Mature communication**: a weekly written status and a single risk board.
- **Team health is mentioned** with specifics, not as an afterthought.

## Red flags to avoid

- "We all worked weekends and got it done." Heroics are not a plan, and they tell the interviewer you will burn out your team.
- Quietly cutting quality (tests, accessibility, security) and presenting it as a win.
- Blaming whoever set the deadline.
- No mention of how stakeholders were kept informed.
- A story where the deadline was not really tight or the stakes were low.

## Likely follow-up probes

- **"What if compliance had said everything was a must-have?"** Explain the next levers: adding people to parallel work, reducing polish, or escalating early with a written trade-off.
- **"How did you get the squads to accept one shared component?"** Talk about showing the timeline maths and offering them review rights on the API.
- **"What technical debt did you take on?"** Be specific, for example a mocked contract that drifted, and how you paid it back.
- **"When would you tell leadership a deadline cannot be met?"** As soon as the data says so, with options attached, never on the day before launch.
- **"How did you know you were on track?"** Describe the burn-up of must-have requirements and the risk board.
