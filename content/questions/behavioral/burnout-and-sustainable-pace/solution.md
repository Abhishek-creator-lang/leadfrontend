## How to structure your answer

Use **STAR-L**. A story about your team usually works better than one only about yourself, but including your own part (and your own limits) makes it more believable.

1. **Situation**: what the overload looked like and how long it had been going on.
2. **Task**: why it was your problem to solve.
3. **Action**: how you diagnosed it, the structural changes, how you dealt with leadership, and what you changed in your own habits.
4. **Result**: wellbeing signals *and* delivery metrics.
5. **Learning**: the early warning signs you now watch.

## Model answer

**Situation.** I was the front-end lead for a team of five on a music streaming company's web player. Over two quarters we had shipped a lyrics feature, a redesign of the queue and a podcast player, each with a hard marketing date. We also handled front-end on-call for the web player. In one-to-ones, two engineers mentioned trouble sleeping before on-call weeks, our best engineer had started answering Slack at midnight, and our team health survey score for "sustainable pace" had dropped from 4.1 to 2.6 out of 5. I was also working most evenings.

**Task.** I could not change the roadmap alone, but I owned how we planned and ran the team, and I could make the case to my manager.

**Action.** First, I gathered data instead of only reporting feelings. Over the previous quarter, about 30% of our time had gone to unplanned work: on-call pages, urgent bug fixes and requests from other teams. Our plans assumed almost none. About 40% of pages came from one noisy alert on audio buffering that rarely needed action.

Second, I fixed the noise. I spent a week with one engineer rewriting our alerts around user-facing service levels, for example alerting when playback-start failure rate stayed above 1% for ten minutes rather than on individual errors. Pages dropped from around 25 a week to 6.

Third, I changed planning. We started planning to 70% of capacity, with the remaining 30% reserved for unplanned work, and we made one person each sprint the "interrupt handler" who protected everyone else's focus. On-call moved to a shared rotation with the back-end player team, so each person was on call once every eight weeks instead of every five.

Fourth, I took this to my manager and product director with the data, and proposed that the next marketing launch use a date range instead of a single fixed day. They agreed for the next feature.

Fifth, I changed my own behaviour. I stopped sending messages after 7 pm, using scheduled send instead, and said in our team meeting that I expected the same from others.

**Result.** Over the next two quarters, the sustainable-pace score went back up to 4.0, and nobody left the team, though we had been worried about two people. Delivery predictability actually improved: we hit 85% of sprint commitments, up from about 55%, because plans now matched reality. We still shipped the next major feature, offline playlists, within its date range.

**Learning.** I had been treating evening work, including my own, as a short-term fix. Now I watch unplanned-work percentage and after-hours activity as early warning signs, and I raise them before they show up in surveys.

## Why this answer works

- **Concrete signals**: survey scores, one-to-ones and after-hours activity, noticed by the lead.
- **Root cause with data**: unplanned work percentage and noisy alerts, not just "too much work".
- **Structural fixes**: better alerting, capacity buffers, interrupt rotation, a broader on-call rota.
- **Managing up**: using data to change how launch dates are set.
- **Modelling the behaviour**: the lead changes their own habits and admits being part of the problem.
- **Delivery improved**: predictability went up, which counters the idea that pace and output conflict.

## Red flags to avoid

- "I just push through" or presenting long hours as a badge of honour.
- Saying you protected the team by doing all the extra work yourself.
- Only suggesting time off or wellness perks, with no change to the cause.
- Blaming leadership without any attempt to influence them.
- Sharing private health details about specific people.

## Likely follow-up probes

- **"What if leadership had refused to move the date?"** Make the trade-off explicit in writing (scope, quality or people), cut scope, and protect recovery time after the launch.
- **"How do you spot burnout in remote team members?"** Changes in activity patterns, quieter one-to-ones, shorter messages, and asking directly.
- **"How did you decide on 70% capacity?"** It was based on the measured unplanned-work share, reviewed each quarter.
- **"What do you do when someone on your team is burned out right now?"** Reduce their load immediately, talk to their manager, and point to support resources while respecting privacy.
- **"How do you handle a crunch that really is unavoidable?"** Make it time-limited, agree the end date, share the load fairly and give recovery time afterwards.
