## How to structure your answer

Use **STAR-L** with a clear before-and-after:

1. **Situation and your original position**: state it firmly and give the reasoning that made it sensible. A straw-man position you obviously should not have held makes the story weak.
2. **What challenged it**: who, what evidence, and how you reacted in the moment.
3. **The change**: how you tested the new view and communicated the reversal.
4. **Result and learning**: outcome, plus how you now look for disconfirming evidence earlier.

The best stories involve someone with less authority than you, because that shows the team can safely push back.

## Model answer

**Situation.** I was the lead for the web app of a personal finance product. We were starting a new transactions area with heavy filtering and real-time balance updates. I argued strongly for putting all server data in Redux Toolkit with normalised slices, because that is what the rest of the app used and I valued consistency. I wrote it into our kick-off doc as the approach.

**Task.** Ana, an engineer who had joined four months earlier, commented on the doc that we should use RTK Query or TanStack Query for server state instead. My first reaction, honestly, was that this was churn: a second pattern in the codebase for a team of five to maintain.

**Action.** Instead of overruling her in the comment thread, I asked her to build the transactions list both ways in a two-day spike, with the same features: filtering, pagination, optimistic updates when re-categorising a transaction, and refetch on window focus. I asked her to measure lines of code, and to list bugs she hit along the way.

The spike was hard to argue with. The hand-written Redux version was about 640 lines including thunks, loading flags and cache invalidation, and it had a stale-data bug when two filters were changed quickly. The RTK Query version was about 210 lines, handled request deduplication and cache invalidation through tags, and stayed inside the Redux Toolkit we already used, which answered most of my consistency concern.

I changed my position in the same doc, wrote down why, and credited Ana's spike. In the next team meeting I said plainly, "I was wrong about this, and here is what convinced me." We agreed a rule: server state goes in RTK Query, and Redux slices are only for client state like UI preferences and draft forms. Ana wrote the ADR.

**Result.** The transactions area shipped two weeks earlier than the original estimate. Over the next six months, we moved the five most bug-prone legacy screens to RTK Query, and data-staleness bugs reported by support fell from about 12 a month to 3. Ana became the go-to person for our data layer.

**Learning.** My mistake was treating consistency as the goal instead of asking what consistency was protecting, which was maintainability. Now, when I feel strongly about a decision, I ask someone to argue the other side with a small spike before we commit.

## Why this answer works

- **A reasonable original position**: consistency is a valid value, so the change shows real reflection.
- **Evidence over authority**: the lead asked for a spike instead of winning by seniority.
- **Comparable measurement**: same feature set, lines of code, bugs found.
- **Public reversal with credit**: saying "I was wrong" in a team meeting builds trust.
- **Turns the lesson into a rule**: a clear boundary between server and client state, captured in an ADR.
- **Technically sound**: separating server cache from client state is a widely accepted pattern.

## Red flags to avoid

- A trivial example ("I changed my mind about tabs vs spaces").
- A story where you only changed your mind because your manager told you to.
- Describing the other person as having been lucky, or quietly taking credit for their idea.
- Never admitting you were wrong, only that "new information emerged".
- Changing your mind so easily that it sounds like you have no convictions.

## Likely follow-up probes

- **"When do you not change your mind?"** When the counter-argument is preference without evidence, or when the cost of switching outweighs the benefit at this stage. Explain how you would still record the dissent.
- **"How do you make it safe for people to disagree with you?"** Ask for dissent explicitly in design docs, respond to challenges with questions, and change your mind visibly when it is warranted, like here.
- **"What would you have done if the spike was inconclusive?"** Pick the reversible option, set a review date, and define the signal that would trigger a rethink.
- **"How did you handle code already written the old way?"** Migrate opportunistically, starting with the screens with the most bugs, rather than rewriting everything at once.
