## How to structure your answer

Use **STAR-L**, but describe the document's own structure inside the Action. Interviewers like hearing the shape of a good RFC.

1. **Situation**: the pain that made a written decision necessary.
2. **Task**: why you wrote it and who had to agree.
3. **Action**: the problem statement, options and recommendation; the review process; the strongest objection and how you handled it; how the decision was made and recorded.
4. **Result**: what was built, the measured outcome, and how the decision aged.
5. **Learning**: what you now do differently when writing proposals.

## Model answer

**Situation.** I was a staff front-end engineer at a fintech company with about 40 front-end engineers across eight teams. Each team fetched data differently: some used Redux with thunks, some used SWR, and two had their own fetch wrappers. Caching bugs were common, for example a balance that did not refresh after a transfer, and engineers moving between teams needed weeks to relearn data patterns.

**Task.** My director asked me to propose a single approach for server state. Any choice needed agreement from eight team leads, several of whom had built the existing solutions.

**Action.** I wrote an RFC with a fixed structure: problem, goals and non-goals, options, recommendation, migration plan and open questions. The problem section included numbers: 23 cache-related bugs in six months and four different patterns for the same thing. Non-goals mattered: I said explicitly that client UI state, like modals and form drafts, was out of scope, which removed a whole category of argument.

I compared four options: keep the status quo with guidelines, standardise on Redux Toolkit Query, standardise on TanStack Query, or write our own wrapper. For each I scored cache invalidation, TypeScript support, bundle size, DevTools, SSR support and migration cost, and I built a small spike of the transfer flow with the two leading options.

I shared the draft with the team leads before posting it widely, and booked a 45-minute review. The strongest objection came from the lead of the largest Redux team: migration would stall their roadmap. That was fair. I changed the plan to "new code uses TanStack Query; existing Redux data code migrates only when a team touches that area", with a lint rule warning on new thunk-based fetching. I also added an ADR template entry so the decision, the rejected options and the review date were recorded in the repository next to the code.

The decision was made by the front-end architecture group, with that lead's explicit agreement.

**Result.** Within nine months, about 70% of server-state code used TanStack Query. Cache-related bugs dropped from 23 to 5 over the next two quarters, and new joiners told us data fetching was the easiest part of the codebase to learn. When we moved to server components a year later, we revisited the ADR as planned and updated it rather than starting a new debate.

**Learning.** Sharing the draft privately with the most affected people first was the most important step. Now I always do a pre-review round before any public RFC.

## Why this answer works

- **Clear problem with data**: bug counts and pattern counts make the need obvious.
- **Non-goals reduce conflict**: limiting scope is a sign of experience.
- **Fair options**: including "status quo" and "build our own", plus a spike to back up claims.
- **Objection changed the plan**: the incremental migration shows the candidate listened.
- **Decision recorded**: the ADR with a review date means the decision can be revisited calmly.
- **Outcome measured and revisited**: the story continues past the decision.

## Red flags to avoid

- An RFC that was really a presentation of a decision you had already made.
- Options set up to lose, such as obviously weak alternatives.
- "Everyone agreed" with no description of disagreement.
- No mention of who had decision rights.
- Ending at "the RFC was approved" with no outcome.

## Likely follow-up probes

- **"What is the difference between an RFC and an ADR?"** An RFC is a proposal used to get feedback before a decision; an ADR is a short, permanent record of a decision, its context and its consequences.
- **"What if the architecture group had picked a different option?"** Disagree and commit, and ask for the success criteria to be written down so the decision can be reviewed.
- **"How long should an RFC be?"** As short as possible; often two to five pages, with detail in appendices.
- **"How do you stop RFCs from becoming endless discussions?"** A comment deadline, a named decider and a clear "what would change my mind" section.
- **"Which decision of yours aged badly?"** Have a second, shorter example ready.
