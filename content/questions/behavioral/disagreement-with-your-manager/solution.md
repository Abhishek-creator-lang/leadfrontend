## How to structure your answer

Use **STAR-L**:

1. **Situation**: what the manager decided and the pressure they were under.
2. **Task**: why you disagreed and what was at stake for your team or users.
3. **Action**: how and where you raised it, the alternative you proposed, how the decision was made, and how you behaved afterward.
4. **Result**: the outcome, with numbers, whether or not you "won".
5. **Learning**: what you learned about influencing upward.

Stories where the decision went against you and you committed anyway are often stronger than ones where you won.

## Model answer

**Situation.** I led a team of five front-end engineers at a media company that ran a large news site. Our engineering director, my manager, decided that to cut costs and hiring needs we would move all three web properties onto a single micro-frontend shell within one quarter, with each team shipping its own fragment through Module Federation.

**Task.** I agreed with the long-term goal of a shared platform, but I thought the timeline and the micro-frontend approach would hurt our article pages. Those pages drove most ad revenue and depended on very fast LCP. I needed to raise this without looking like I was resisting the direction.

**Action.** I asked for a one-on-one rather than objecting in the planning meeting where it was announced. I opened by restating the goal as I understood it: fewer duplicated systems and faster shared features. Then I shared a one-page write-up. I had run a spike: a federated article page added about 140 KB of JavaScript for the shell and shared dependencies, and in lab tests p75 LCP went from 1.8 to 2.6 seconds. Our ad team's own data suggested every 100 ms of LCP was worth roughly 1 percent of ad viewability.

I proposed an alternative: a shared monorepo with a common design system and build tooling first, keeping article pages server-rendered and separately deployed, and using micro-frontends only for the logged-in account area where independent deploys mattered more.

My manager listened, but he had already committed the one-quarter plan to the CTO and was worried about losing momentum. We agreed on a compromise: proceed with the shell, but article pages would be last in the migration order and would have a hard performance budget enforced in CI, with my data presented at the next architecture review.

I told my team the plan as our plan, not as "the director's idea". I put the budget gate in place and helped the other teams migrate first.

**Result.** The account area migrated smoothly. When article pages came up, the CI budget failed repeatedly, which made the trade-off visible without anyone arguing. At the review, my manager himself proposed keeping article pages outside the shell. We shipped the shared design system to all properties, and article LCP stayed under 2 seconds.

**Learning.** I learned to separate the goal from the plan when disagreeing upward, and to turn my concern into a guard rail that would surface the problem with data rather than relying on winning the argument in the room.

## Why this answer works

- **Right setting**: private one-on-one first, not public pushback.
- **Shared goal acknowledged**: disagrees with the plan, not the intent.
- **Evidence**: a spike with bundle size, LCP and revenue impact.
- **Realistic outcome**: a compromise rather than a total win, plus visible commitment to the team.
- **Clever mechanism**: a CI performance budget that let the data decide later.
- **No gloating**: the manager got to make the final call himself.

## Red flags to avoid

- Arguing in front of the team or going over your manager's head first.
- Complying silently and complaining later.
- Telling your team "I disagree with this but we have to do it", which damages trust in leadership.
- A story where your manager was obviously foolish.
- Disagreements about personal matters (pay, schedule) rather than work decisions.

## Likely follow-up probes

- **"What if he'd said no to the compromise?"** You would commit, document the risk in writing, and track the metric so it could be revisited.
- **"When would you go over your manager's head?"** Only for ethical, legal, security or safety issues, and ideally after telling your manager you are going to.
- **"How did the other teams feel?"** Talk about helping them migrate first, which built goodwill.
- **"How do you tell your team about decisions you disagree with?"** Explain the reasoning behind the decision, be honest that you raised concerns if asked, and focus on how you will make it succeed.
- **"Did this affect your relationship with your manager?"** Ideally it improved it: he learned you raise concerns with data and then commit.
