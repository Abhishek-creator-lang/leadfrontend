## How to structure your answer

Use **STAR-L**, and give the Learning more weight than usual.

1. **Situation**: the context and constraints at the time. Make clear the decision was reasonable then.
2. **Task**: that you were the decision maker, or the one who recommended it.
3. **Action**: what you decided and why, then how the problems showed up and what you did to fix them.
4. **Result**: the cost of the mistake and the outcome of the fix, both quantified.
5. **Learning**: the specific change in your decision process, ideally with an example of using it since.

Choose a decision with real consequences, but one you recovered from. Avoid tiny choices ("I picked the wrong date library") and disasters you never fixed.

## Model answer

**Situation.** Three years ago I was the front-end lead at a SaaS company building a project-management app. We were about to start a large new area, a reporting module with a lot of shared state between filters, charts and tables. Global state libraries were in fashion, and our app already used Redux for authentication and settings.

**Task.** I made the call on the state architecture for the new module, and five engineers would build on it.

**Action.** I decided to put everything in Redux, including server data. We wrote thunks to fetch data, normalised it into slices, and tracked loading and error flags by hand. My reasoning was consistency: one place for all state, good devtools, and a pattern the team already knew.

About eight months later the cost was clear. Around 70 percent of our Redux code was hand-written caching: invalidation after mutations, refetching on focus, stale flags. We had a recurring class of bugs where a chart showed old numbers after a user edited a filter preset, because one mutation forgot to invalidate a slice. New engineers took about three weeks to become productive in the module.

I wrote a short decision record that admitted the original call was wrong for server data, and proposed separating server state from client state. We adopted TanStack Query for server data and kept Redux only for true client state such as the report builder's draft. We migrated one screen at a time, starting with the screen that had the most stale-data bugs, and added a lint rule that blocked new fetch thunks.

**Result.** The migration took about ten weeks, alongside feature work. The reporting module's state code shrank by roughly 5,000 lines, stale-data bug reports went from about six a month to fewer than one, and onboarding to the module dropped to about a week.

**Learning.** My mistake was optimising for consistency instead of asking what kind of state we had. I now classify state explicitly, as server cache, URL state, form state or shared UI state, before picking a tool. I also write a "what would make us reverse this" line in every ADR, with a metric. For this decision, that would have been "time spent on cache invalidation bugs", and we would have caught it in three months instead of eight.

## Why this answer works

- **Real ownership**: "I decided" and "I wrote a decision record that admitted the call was wrong".
- **Fair to the past self**: explains why the decision was reasonable at the time, which shows maturity rather than self-flagellation.
- **Concrete symptoms**: a recurring bug class, a share of code that was plumbing, onboarding time.
- **Measured fix**: incremental migration ordered by pain, plus a guard rail (a lint rule) to stop regression.
- **Process learning**: classifying state types and adding reversal criteria to ADRs is a reusable habit, not just "I learned about TanStack Query".

## Red flags to avoid

- A fake weakness: "I chose a tool that was too good" or a decision that was not really yours.
- Blaming others: "Product forced us to" or "the team didn't follow the pattern".
- No recovery: you left the problem for someone else.
- Only a technical lesson ("Redux is bad"). Tools change; interviewers want a lesson about judgement.
- Trashing a technology dogmatically. Redux was not wrong in general; it was wrong for server cache in this context.

## Likely follow-up probes

- **"How did you tell the team you'd been wrong?"** Describe the written record and the conversation. Admitting mistakes openly makes it safe for others to do the same.
- **"Why not rewrite everything at once?"** Talk about risk, feature work continuing, and ordering by pain so value arrives early.
- **"How do you know you're not making the same mistake now with TanStack Query?"** Mention the reversal criteria and that you would review the decision against them.
- **"What signals should you have noticed earlier?"** Bug categories in the tracker, PR sizes for simple features, onboarding feedback. Explain how you now track some of these.
- **"Tell me about a decision you'd make the same way even though it went badly."** Shows you can separate outcome from process.
