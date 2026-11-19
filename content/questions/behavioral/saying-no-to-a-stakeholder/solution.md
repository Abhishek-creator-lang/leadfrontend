## How to structure your answer

Use **STAR**, with extra weight on *how* you said no.

1. **Situation**: who asked, what they asked for, and why it mattered to them. Show you understood their goal.
2. **Task**: what you were responsible for protecting (a launch, quality, the team's capacity).
3. **Action**: how you gathered evidence, framed the trade-off, offered alternatives and communicated the decision.
4. **Result**: what shipped instead, how the stakeholder reacted, and the measurable outcome.
5. **Optional learning**: what you now do earlier so a hard "no" is needed less often.

The strongest stories are "no to the solution, yes to the problem". Pick one where you found another way to meet the underlying need.

## Model answer

**Situation.** I led the web team for a B2B analytics product. Three weeks before our annual customer conference, the VP of Sales asked us to add a "live demo mode" to the dashboard: real-time streaming charts with simulated data, on the production app, ready for the keynote. A large prospect had seen a competitor's demo and he felt we looked static.

**Task.** My team of five was mid-way through moving our chart rendering from SVG to canvas to fix a performance problem. Our biggest customers had dashboards with 40+ widgets and p75 INP above 400 ms. That work was committed to existing customers for the same quarter.

**Action.** Before replying I met with the VP for 30 minutes, just to understand the goal. The real need was a five-minute keynote moment and a story for two prospects, not a permanent feature.

Then I sized it honestly. Building streaming into the production chart layer meant a WebSocket path, a new data contract with the back-end team and changes to the rendering code we were rewriting. That was about four engineer-weeks and would push the canvas migration past the quarter. I wrote a one-page summary with both options and their costs, including the renewal risk: two of the accounts with slow dashboards were up for renewal that quarter, worth about $900K combined.

I said no to building it in production, and proposed an alternative: a standalone demo build on a separate subdomain, using the new canvas charts fed by a scripted local data generator. One engineer for one week, no production risk, and it would actually show off the faster charts. I brought my manager and the VP's chief of staff into the review so the decision was not just me against him.

**Result.** He agreed after seeing a rough prototype two days later. The keynote demo went smoothly, and sales used the demo build in about 20 calls afterwards. We finished the canvas migration on time: p75 INP on large dashboards dropped from 410 ms to 120 ms, and both at-risk accounts renewed. Real-time updates were later scoped properly and shipped the next quarter as a planned feature.

The VP later asked me to join quarterly roadmap reviews with sales, so the next request came to us earlier.

## Why this answer works

- **Understands the need first**: the candidate separates the request (production feature) from the goal (keynote moment).
- **Quantified trade-off**: four engineer-weeks, a delayed migration and $900K of renewal risk, not "we're too busy".
- **Offers a real alternative** that delivers most of the value for a quarter of the cost.
- **Smart escalation**: bringing in the manager and chief of staff as a shared decision, not as a complaint.
- **Prototype over argument**: showing a working demo ends a debate faster than a document.
- **Relationship outcome**: being invited to roadmap reviews is proof that trust grew.

## Red flags to avoid

- Saying no because the request was "not technically interesting" or "not best practice" with no business reasoning.
- Describing the stakeholder as unreasonable or clueless. Interviewers hear how you would talk about them.
- A "no" with no alternative, leaving the stakeholder stuck.
- Going around the stakeholder to their boss without talking to them first.
- A story where you said no and were simply proven right, with no cost or nuance.
- Never having said no. At lead level that suggests you do not protect your team.

## Likely follow-up probes

- **"What if the VP had insisted?"** Explain that you would escalate the trade-off, not the person: make the cost explicit to the person who owns the roadmap and accept their decision, documenting the risk.
- **"How do you decide when to say no versus absorb the work?"** Mention criteria such as reversibility, impact on committed work, risk to users, and whether the request serves a real goal.
- **"How did your team feel?"** Talk about shielding them from churn, and telling them the reasoning so they understood the priorities.
- **"Have you ever said no and been wrong?"** Have a short example ready. Admitting it shows judgement, not weakness.
- **"How do you prevent these last-minute requests?"** Earlier roadmap visibility, regular syncs with go-to-market teams, and a small capacity buffer for opportunistic work.
