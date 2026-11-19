## How to structure your answer

Use **STAR-L**, with the Action split into three parts:

1. **The decision**: why this work, why this person, and what you gave up by not doing it yourself.
2. **The setup**: how you handed off context, constraints and success criteria.
3. **The support**: how you stayed close enough to catch problems without taking the work back.

Make the stakes real. Delegating a lint rule upgrade is not a lead story. Delegating something leadership was watching is.

## Model answer

**Situation.** I led a team of six front-end engineers on a B2B analytics product. We had committed to adding real-time updates to our dashboards for a large customer renewal, using server-sent events instead of the 30-second polling we had. I had built the original data layer, so everyone assumed I would build this too.

**Task.** I was also running hiring for two roles and writing our half-year roadmap. If I took the streaming work, it would sit on my desk in 30-minute gaps. I decided to give it to Priya, a mid-level engineer who had told me she wanted to own something architectural.

**Action.** I wrote a one-page brief rather than a design: the customer outcome (updates visible within 2 seconds), constraints (no new infrastructure, must degrade to polling, our TanStack Query cache stays the single source of truth), and what I needed to approve (the reconnection strategy and the cache integration). Everything else was her call.

We agreed on two checkpoints: a design review after a week and a demo behind a feature flag after three. Between those, I told her I would only look at her pull requests if she asked.

At the design review, she proposed a custom event bus that bypassed the query cache. My first instinct was to rewrite her design. Instead I asked her what happens when a stale refetch lands after a streamed update. She found the race herself and switched to writing streamed events into the cache with `setQueryData` and a version check. That was the moment I knew she owned it.

Two weeks in, she was stuck on proxies closing idle connections. I paired with her for an hour, pointed her at heartbeat comments in the event stream, and left the fix with her.

**Result.** She shipped in four weeks against a five-week estimate. Median update latency was 1.2 seconds, server load from polling fell by about 60%, and the customer renewed. Priya presented the design at our engineering all-hands, and it became part of her promotion case six months later. Meanwhile I closed both hires.

**Learning.** I nearly delegated too late. I had sat on the work for a week "to think about the design", which was really me holding on. I now decide who owns a piece of work in the same meeting that we commit to it.

## Why this answer works

- **Real stakes**: a renewal depended on it, so this was not a low-risk chore.
- **Clear reasoning**: the lead's time was better spent on hiring and roadmap, and the engineer had a growth goal.
- **Delegating the outcome, not the steps**: the brief gives goal, constraints and approval points, and leaves the design to her.
- **Coaching instead of correcting**: asking a question that exposed the race condition rather than rewriting her design.
- **Proportionate support**: one pairing session on a hard infrastructure issue, then stepping back.
- **Credit given visibly**: she presented the work and it helped her promotion.
- **Self-aware learning** about the lead's own tendency to hold on.

## Red flags to avoid

- Delegating only work you did not want ("I gave the junior the tests").
- Describing delegation as assigning tickets with step-by-step instructions.
- Taking the work back the moment it got hard, then presenting that as "stepping up".
- Blaming the person when delegated work went badly, with no mention of how you set them up.
- Keeping the credit, or presenting the result yourself.
- A story with no check-ins at all. Hands-off is not the same as delegating well.

## Likely follow-up probes

- **"What if her design had been worse than yours but still workable?"** Say that you would accept it if it met the constraints. Ownership matters more than your preferred pattern, and you can raise concerns as suggestions in review.
- **"When would you not delegate?"** When the deadline leaves no room for learning, when the work needs context only you have and cannot quickly share, or during an incident. Even then, pair someone with you so the knowledge spreads.
- **"How did you know she was ready?"** Mention signals: quality of her previous designs, how she handled ambiguity, and that you sized the safety net to the risk.
- **"Tell me about a delegation that failed."** Have a second, shorter story ready where you gave too little context, and what you changed.
- **"How do you keep quality high without reviewing everything?"** Clear acceptance criteria, automated checks in CI, a review at the design stage when changes are cheap, and trusting the team's code review process.
