---
title: Common mistakes
description: The most frequent ways strong engineers underperform in front end system design interviews, why each one hurts, and what to do instead.
source: original
---
Most system design rejections aren't about missing knowledge. They come from *process* mistakes: spending time in the wrong places, not making decisions visible, or answering a different question than the one asked. This chapter lists the patterns interviewers see most often, grouped by RADIO phase, with a concrete fix for each.

## Process and time mistakes

### 1. Running out of time before the deep dives

**Why it hurts:** the optimization phase is where senior signal is strongest. Missing it caps your score.

**Fix:** set time checkpoints (requirements done by minute 8, diagram by 18, API by 30) and say them out loud. If you're behind, compress: "I'll sketch the API briefly so we have time for performance."

### 2. Monologuing

**Why it hurts:** the interviewer can't steer you toward what they want to evaluate, and it reads as poor collaboration.

**Fix:** check in at every phase transition. Ask "Which of these would you like me to go deeper on?" at least twice.

### 3. Waiting for permission

The opposite problem: asking "Should I do X?" before every step. It reads as low ownership.

**Fix:** propose and proceed. "I'll go with cursor pagination because of frequent inserts. Let me know if you'd prefer otherwise."

## Requirements mistakes

### 4. Jumping straight into components

Drawing `<Header>`, `<Sidebar>`, `<Feed>` in the first minute signals that you build before you understand.

**Fix:** always spend at least five minutes on requirements, and write a visible summary.

### 5. Requirements as a 20-question interrogation

**Fix:** propose a scope and ask the interviewer to confirm it. Ask two or three constraint questions at a time, and turn the rest into stated assumptions.

### 6. Ignoring non-functional requirements

A design that never mentions devices, network conditions, scale, or a11y could be for any app.

**Fix:** always cover device mix, data scale, freshness, performance targets, a11y, and SEO, and point to which of them drives your design.

## Architecture mistakes

### 7. Designing the backend

Spending ten minutes on database sharding and Kafka topics in a front end round.

**Fix:** treat the backend as a black box with a clear API. Only go deeper if asked, or if a front end concern depends on it (e.g. how the realtime gateway shapes your reconnect logic).

### 8. A diagram without data flow

Boxes without arrows tell the interviewer nothing.

**Fix:** label arrows with what flows. Walk through one user action end to end.

### 9. No rendering strategy

Candidates often never say whether the app is CSR, SSR, or static, and then struggle when asked about SEO or first load.

**Fix:** state the strategy and justify it in one sentence during the architecture phase.

### 10. One global store for everything

"Everything goes in Redux" is a red flag in 2025.

**Fix:** classify state as server cache, URL, local UI, shared client, or persistent, and pick a tool for each.

## Data and API mistakes

### 11. Vague APIs

"Then we call the API to get the posts" without any fields, pagination, or errors.

**Fix:** write at least one real request/response with fields, a cursor, and an error case.

### 12. Offset pagination for live feeds

Inserts cause duplicated or skipped items.

**Fix:** use cursor pagination and explain why.

### 13. Forgetting failure

No error states, no retries, no plan for a failed optimistic update.

**Fix:** for every mutation, say what happens on failure: roll back, show a toast, offer retry. Name the HTTP statuses you handle differently.

### 14. Untyped or kitchen-sink component APIs

A component API with 40 boolean props.

**Fix:** sensible defaults, composition (sub-components or slots), render props for customization, and both controlled and uncontrolled modes.

## Depth mistakes

### 15. Buzzword lists

"We'd use lazy loading, memoization, CDN, caching, service workers…" with no detail.

**Fix:** pick two or three areas and go deep using symptom → cause → options → choice → cost → measurement.

### 16. Premature or inappropriate optimization

Virtualizing a 50-item list or adding a service worker to an internal dashboard.

**Fix:** tie every optimization to a requirement or metric. Right-sizing is a senior signal.

### 17. Forgetting accessibility

Interviewers increasingly treat missing a11y as a significant gap, especially for component questions.

**Fix:** for any interactive component, cover semantics, keyboard support, focus management, and screen reader announcements. Name the relevant ARIA pattern (combobox, dialog, tabs, grid).

### 18. Outdated knowledge

Talking about FID instead of INP, class component lifecycles as the default, or recommending patterns the ecosystem has moved past.

**Fix:** know the current landscape: INP, React 18/19 concurrency, Server Components, streaming SSR, modern image formats.

## Trade-off mistakes

### 19. Presenting one option as the only option

**Fix:** for every major decision, name at least one alternative and why you rejected it.

### 20. Trade-offs without a decision

Listing pros and cons forever and never choosing.

**Fix:** decide, and say what would change your mind: "SSE for now; if we add typing indicators we'd move to WebSockets."

### 21. Ignoring cost and operations

SSR everywhere with no mention of server cost, caching, or on-call load.

**Fix:** mention the operational cost of server-heavy choices, plus monitoring and rollout.

## Communication mistakes

### 22. Defending a flawed decision

When the interviewer pokes at a weakness, doubling down reads as poor collaboration.

**Fix:** "Good point. That breaks when X. I'd change it to Y."

### 23. Not summarizing

The interview ends mid-sentence in a deep dive.

**Fix:** reserve one or two minutes to recap the key decisions, trade-offs, and what you'd do next.

### 24. Poor use of the whiteboard

Tiny unreadable diagrams, or erasing work the interviewer wanted to refer back to.

**Fix:** use separate regions for requirements, the diagram, the data model, and the API. Keep everything visible.

## Quick reference

| Phase | Top mistake | One-line fix |
| --- | --- | --- |
| Requirements | Skipping or interrogating | Propose scope, confirm, write it down |
| Architecture | No data flow or rendering choice | Labeled arrows plus a one-sentence rendering justification |
| Data model | One global store | Classify state by kind |
| Interface | Vague APIs, no errors | Real payloads, cursor, error contract |
| Optimizations | Buzzword lists | Two or three deep dives with trade-offs and metrics |
| Overall | Running out of time | Visible checkpoints and check-ins |

## Before and after: one exchange, two candidates

**Prompt:** "How would you handle a user liking a post?"

**Weaker answer:** "When they click like we call the API and update the count."

**Stronger answer:** "I'd update the cache optimistically so the heart fills instantly, and send `POST /posts/:id/likes` with an idempotency key so retries don't double-count. On success, I'd reconcile with the server's returned count. On failure, I'd roll back and show a non-blocking toast with a retry. Rapid toggling gets debounced on the client, or the last intent wins. For screen readers, the button uses `aria-pressed` and its accessible name includes the count."

The second answer takes about 30 seconds longer, and it touches four rubric dimensions: data, API, failure handling, and accessibility. That's the habit worth practicing.

## Self-check after every mock

1. Did I reach the deep dives with at least 10 minutes left?
2. Can I name three decisions I made and the alternatives I rejected?
3. Did I mention a11y, error states, and slow networks?
4. Did I write down a real API payload?
5. Did I summarize at the end?

If any answer is no, that's your focus for the next practice session.
