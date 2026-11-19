## How to structure your answer

Use **STAR**, with a clear shape for the disagreement itself:

1. **Situation**: the feature and why it mattered to the PM. State their goal fairly.
2. **Task**: your role and what specifically you disagreed with.
3. **Action**: how you understood their position, what evidence you gathered, the options you offered, and how the decision got made.
4. **Result**: what shipped, the measured outcome, and the state of the relationship.

Pick a disagreement where both sides had a point. If the PM was simply wrong and you were simply right, the story shows little.

## Model answer

**Situation.** I was the front-end lead on a fintech app's web onboarding. Our PM had a quarterly goal to raise signup completion, and she wanted to replace our three-step form with a single long page using an infinite-scroll style layout, plus autoplaying explainer animations. She had seen a competitor do it and had a launch date tied to a marketing campaign five weeks out.

**Task.** I disagreed with two parts: the animations would have hurt performance on the low-end Android devices that were 35 percent of our traffic, and a single page with 22 fields would have made validation errors and screen reader navigation much harder. I owned the implementation and the quality bar.

**Action.** First, I asked to understand what she was really optimising. It turned out the core problem was drop-off at step two, where we asked for income details, and she believed fewer page transitions would help. That was a fair hypothesis, so I stopped arguing about the layout and focused on the drop-off.

Second, I brought data instead of opinions. I pulled our analytics funnel and session replays, and I built a quick prototype of her design. On a throttled mid-range Android profile in WebPageTest, the animated version had an LCP of 4.8 seconds versus 2.3 for ours, and our accessibility tester found that error messages were announced out of order.

Third, I proposed an experiment rather than a winner. Option A: her single page without autoplaying animation. Option B: keep three steps but move the income questions later and add inline validation. Both could ship behind a feature flag in four weeks. She agreed, on the condition that the marketing date held, so I moved one engineer from a lower-priority task to protect it.

**Result.** We ran a two-week 50/50 test. Option B raised completion by 9 percent; Option A by 3 percent and slightly increased errors on mobile. She shipped B and presented the experiment at the product review herself. Afterward we agreed that any feature affecting a core funnel would include a performance and accessibility check in the spec, which she added to her template. We worked together for another two years and she became one of my strongest advocates.

## Why this answer works

- **Fair to the PM**: her goal and hypothesis are treated as legitimate.
- **Finds the real problem**: shifts from arguing about layout to the drop-off at step two.
- **Evidence-based**: WebPageTest numbers, real device mix, accessibility testing, a prototype.
- **Options and an experiment**: removes ego from the decision and lets users decide.
- **Protects the PM's constraint**: kept the marketing date by moving staffing, showing partnership.
- **Lasting change**: a process improvement that the PM owned.

## Red flags to avoid

- Portraying the PM as incompetent or "not technical".
- Winning by escalating to your manager or theirs as the first move.
- "I just built what they asked" with no pushback, or refusing to build it at all.
- No data, only "best practice says".
- An ending where you were right and nothing else changed. Interviewers look for relationship and process outcomes.

## Likely follow-up probes

- **"What if the experiment had shown her version winning?"** Say you would ship it, then work on its performance issues. Disagree and commit is the expected answer.
- **"What if there was no time for an experiment?"** Explain how you would make a reversible decision, ship the lower-risk option, and agree on a metric to revisit.
- **"When would you escalate?"** Only for user harm, legal or security risk, or when you are truly stuck after trying to align. Do it together with the PM rather than behind their back.
- **"How do you build trust with a new PM?"** Regular one-on-ones, sharing engineering constraints early, and helping them hit their goals.
- **"Who makes the final call on product decisions?"** Usually the PM; you own the how and the quality bar, and you make the cost of choices visible.
