## How to structure your answer

Use **STAR-L**:

1. **Situation**: who gave the feedback and in what context.
2. **Task**: what the feedback said, quoted as close to the original as you can. Include your honest first reaction.
3. **Action**: how you understood it (asking for examples), and the specific changes you made.
4. **Result**: evidence the change worked, ideally from the same person or from data.
5. **Learning**: how you now ask for feedback.

Choose feedback that touched something important for a lead: communication, delegation, decision-making or how you treat people. Avoid fake weaknesses.

## Model answer

**Situation.** About two years ago I had just become tech lead for a team of five building the web app for a travel booking company. In my first 360 review, my manager shared a theme from several teammates: "Decisions get made in your head and announced, not discussed." One engineer had written that they had stopped proposing ideas because "the architecture is already decided by the time we hear about it."

**Task.** My honest first reaction was defensive. I thought I was being efficient: I had moved us to Vite, set up our feature flag approach and picked a form library, all quickly, and all had worked out. But the comment about people stopping proposing ideas bothered me, because that is exactly the opposite of what a lead should cause.

**Action.** I thanked my manager and asked for a day to think before responding. Then I asked two teammates I trusted for specific examples. They pointed to the form library choice: I had posted "We're using React Hook Form going forward" in Slack, while one of them had been prototyping a different approach for a week.

I made three changes. First, for any decision affecting more than one person's work, I started writing a short RFC with options and a recommendation, open for comment for at least two days. Second, I rotated RFC authorship, so engineers wrote proposals and I reviewed them. Third, in design discussions I tried to speak last, asking questions first.

I also told the team directly what I had heard and what I was changing, which felt uncomfortable but made it easier for them to hold me to it.

**Result.** Over the next two quarters, the team wrote eleven RFCs, and seven were authored by engineers other than me. One of them, proposing route-level code splitting with prefetch on hover, came from the engineer who had stopped proposing ideas, and it cut our search page JavaScript by about 35 percent. In the next 360 the theme had flipped; two people mentioned the RFC process as a positive. Decisions took a few days longer, which I think was worth it.

**Learning.** Speed of decision is not the same as speed of the team. I now ask for feedback explicitly every quarter with one question, "What's one thing I do that makes your work harder?", and I share what I change.

## Why this answer works

- **Real, relevant weakness**: a lead behaviour that hurts team ownership.
- **Honest about the defensive reaction**, then shows how they moved past it.
- **Sought specifics** before acting.
- **Concrete changes**: RFCs, rotating authorship, speaking last, telling the team.
- **Verified**: RFC authorship numbers, a strong idea from the disengaged engineer, the next 360.
- **Acknowledges the trade-off**: slower decisions, consciously accepted.

## Red flags to avoid

- Fake weaknesses: "I work too hard" or "I care too much about quality".
- Feedback that is trivial or from long ago with no relevance to leading.
- Explaining why the feedback was wrong.
- No concrete change, or no evidence that the change worked.
- Blaming the person who gave the feedback for how it was delivered.

## Likely follow-up probes

- **"Have you received feedback you decided not to act on?"** Show you can disagree respectfully, explain why, and check with the giver.
- **"How do you get honest feedback from people who report to you?"** Ask specific questions, act visibly on what you hear, and never punish candour.
- **"Do you still slip into the old pattern?"** Be honest; under deadline pressure you might, and you have a signal that catches it.
- **"What's the most recent feedback you received?"** Have something current ready.
- **"How do you decide when a decision needs an RFC?"** Talk about reversibility and the number of people affected.
