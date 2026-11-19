## How to structure your answer

Use **STAR-L**. Show that you listened before acting, and that your fix addressed the cause.

1. **Situation**: who was involved (no names), how the conflict showed up, and its effect on the team.
2. **Task**: your responsibility as lead.
3. **Action**: separate conversations, finding the root cause, a joint conversation, and structural changes.
4. **Result**: what changed in their behaviour and in team outcomes.
5. **Learning**: what you would do earlier.

Be respectful about both people. The interviewer is imagining you talking about them one day.

## Model answer

**Situation.** I led a team of six front-end engineers building a mobile web app for a food delivery company. Two senior engineers, whom I will call A and B, had begun clashing in code reviews. A left long reviews with many change requests on B's pull requests; B started merging small changes without review when A was offline, and called the reviews "gatekeeping" in our team channel. Two junior engineers told me in one-to-ones that they were avoiding A's area of the code. PR cycle time on the team had doubled to about three days.

**Task.** As the tech lead, it was my job to fix this. Their manager was aware, and we agreed I would try first since the conflict was mostly about technical work.

**Action.** First, I met each of them separately and mainly listened. A felt responsible for the checkout flow's reliability after a payment bug the previous year and believed B's changes were risky. B felt A treated him as junior and that review comments were personal preferences presented as rules. Both were partly right: about a third of A's comments were about style, but A had also caught two real bugs.

Second, I looked for the structural cause. We had no written review standards and no clear ownership of the checkout area. So the conflict was partly a process gap.

Third, I brought them together with a specific agenda: agreeing review standards for the team, not discussing past behaviour. I asked each to say one thing the other did well. Then we drafted guidelines together: label comments as "blocking", "suggestion" or "nit"; move style rules into ESLint and Prettier; and require a second reviewer for checkout changes instead of a single owner. I shared the draft with the whole team for feedback so it was not seen as a deal between two people.

Fourth, I gave feedback to each privately. To A, that unlabelled preference comments were slowing the team. To B, that merging without review broke our agreement, whatever the reason, and could not happen again.

**Result.** Within six weeks, PR cycle time fell back to about one day. Review comments labelled as blocking fell by about half, while the number of bugs found in review stayed the same. A and B later co-owned a checkout refactor. The junior engineers' one-to-one feedback improved, and one started contributing to checkout.

**Learning.** I noticed the tension about a month before I acted. I now raise friction in one-to-ones as soon as I see it, while it is still small.

## Why this answer works

- **Listened separately first**, and found that both people had a valid point.
- **Found the structural cause**: missing review standards and unclear ownership.
- **Fixed the system, not just the relationship**: comment labels, linting and a two-reviewer rule.
- **Direct private feedback** to each person, including a clear line on merging without review.
- **Measured outcome**: cycle time, review quality and the effect on junior engineers.
- **Honest learning** about acting too late.

## Red flags to avoid

- Taking one side, usually the more senior or more productive engineer.
- "I told them to sort it out themselves." Avoidance is not leadership.
- Speaking negatively or mockingly about either person.
- Only a joint meeting, with nothing changed structurally.
- Ignoring the effect on the rest of the team.
- Getting into HR territory (harassment, discrimination) without saying you would escalate.

## Likely follow-up probes

- **"When would you have escalated to their manager or HR?"** Immediately for anything involving harassment, discrimination or personal attacks; and if behaviour did not change after clear feedback.
- **"What if one of them had refused to change?"** Document the expectations, involve their manager, and treat it as a performance issue.
- **"How do you prevent this from happening on a new team?"** Written review norms, clear ownership and regular one-to-ones where friction comes up early.
- **"What did you say exactly in the feedback to A?"** Use a situation, behaviour, impact format with a specific example.
- **"How do you handle conflict between you and someone on your team?"** Same principles: listen first, separate facts from interpretations, and agree on a way forward.
