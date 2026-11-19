---
title: Day of the interview
description: Logistics, energy management, in-round tactics, and recovery strategies for the day you actually interview.
source: original
---
By interview day the preparation is done, and what's left is execution. Strong candidates lose offers on the day for avoidable reasons: a broken setup, poor pacing, panicking after one bad round, or forgetting to show what they know. This chapter is a field manual for the day itself.

## The day before

- **Confirm logistics:** calendar invites, video links, time zone, names and roles of interviewers, and the coding/whiteboard tools.
- **Prepare your environment:** a quiet room, a neutral background, charged laptop and headphones, a second monitor if allowed, water, and paper and pen.
- **Test tools:** open the coding platform link if you have it, share your screen in a test call, and check the mic level.
- **Light review only:** read your story bank bullets, your system design checklist, and one or two favorite code problems. Don't attempt anything new.
- **Sleep.** Fatigue hurts working memory more than any gap in knowledge will.

## The morning of

- Eat something sustaining. Five back-to-back hours on coffee alone leads to an afternoon crash.
- Do a 15-minute warm-up: one easy JS problem out loud, and one behavioral story out loud. You're warming up your voice and your reasoning, not studying.
- Log in five minutes early, with notifications off and other apps closed.
- Keep your two-minute intro in front of you as a few bullets, not a script.

## Opening any round well

The first 90 seconds set the tone for the interviewer's notes.

1. Greet them and confirm the format: "Is this a coding round in React, about 45 minutes, with time at the end for questions?"
2. If they ask for an intro, give the short version, about 60 seconds, ending with something relevant to this round.
3. Listen to the full prompt without interrupting, then restate it in your own words.

## Coding round tactics

### Clarify before coding (2–5 minutes)

Ask about inputs, outputs, constraints, and edge cases. Write the answers as a comment at the top of the file:

```ts
/**
 * Requirements (confirmed):
 * - Input: array of nested arrays of numbers, any depth
 * - Output: new flat array, original untouched
 * - Depth param optional, default Infinity
 * - No need to handle sparse arrays
 */
```

That comment becomes your shared contract with the interviewer and a checklist for yourself.

### Plan out loud (1–3 minutes)

State the approach and its complexity before typing. "I'll recurse with an accumulator. That's O(n) time in total elements and O(d) stack for depth d. If depth is a concern I can switch to an explicit stack." This gives the interviewer a chance to redirect you early, which is a kindness to both of you.

### Code in checkpoints

Build the smallest version that works, run it, then extend. Say when you hit each checkpoint: "Basic case works. Now adding the depth parameter." If time runs out, the interviewer still has evidence of working code.

### Test deliberately

Walk through at least one normal case and two edge cases by hand or with quick asserts. Name the edge cases out loud even if you don't have time to handle them all.

## System design round tactics

- Keep an eye on the clock. Say your time budget out loud: "I'll spend about five minutes on requirements, then sketch the architecture."
- Draw early. An imperfect diagram at minute 10 beats a perfect explanation at minute 25.
- Check in at each transition: "Does this level of detail work, or should I go deeper on the data model?"
- Save the last 10–15 minutes for deep dives, and offer options: "I could go deeper on offline support, list virtualization, or accessibility. Which is most interesting to you?"

## Behavioral round tactics

- Pause before answering. Three seconds to choose the right story looks thoughtful, not slow.
- Lead with the headline: "This is about the time I convinced three teams to adopt a shared design system."
- Spend most of your time on *your* actions and the *result*, with numbers.
- If a follow-up exposes a weak spot, own it plainly: "In hindsight I should have looped in security earlier. That's now part of my RFC template."

## When things go wrong

| Situation | What to do |
| --- | --- |
| You blank on the approach | Say so and reason from a brute-force version: "Let me start with the naive approach and improve it." |
| A bug you can't find | Narrow it down systematically: log intermediate state, test the smallest input, and explain each step. |
| The interviewer gives a hint | Take it gracefully and build on it. Using hints well is a positive signal. |
| You realize your design is flawed | Name the flaw and the fix. Correcting yourself scores better than defending a mistake. |
| Tech failure (audio drops, editor crashes) | Stay calm, switch to phone audio or a backup editor, and keep a copy of your code in a local file. |
| You ran out of time | Summarize what's left and how you'd do it. Interviewers credit a clear plan. |

### Bounce back between rounds

Rounds are usually scored independently, and one weak round rarely sinks a loop on its own. A visibly shaken performance in the *next* round, though, can. Between rounds:

- Take two minutes away from the screen: stand up, drink water, breathe slowly.
- Write a quick note on the last round for later, then deliberately put it aside.
- Re-read the one-line goal for the next round ("design round: drive structure, draw early").

## Questions at the end

Always have two or three questions ready for each interviewer, matched to their role:

- **Engineer:** "What's the hardest front end problem the team solved this year?"
- **Manager:** "What would make someone in this role clearly successful after six months?"
- **Staff/lead peer:** "How are big technical decisions made and recorded here?"
- **Product/design partner:** "How early do engineers get involved in shaping work?"

Good questions show you're evaluating the job seriously, and the answers help you negotiate later.

## Energy management for long loops

- Hydrate and eat in every break longer than ten minutes.
- If you get a lunch break, don't spend it reviewing. Rest.
- Watch your voice. Speaking for five hours is tiring, so slow down instead of speeding up as you tire.
- If a loop is split across days, sleep matters more than extra review.

## After the interview

- **Same day:** write down every question and your answers while they're fresh. This is useful for other loops and for a possible re-interview.
- **Thank-you notes:** optional at most tech companies. A short note to the recruiter is enough.
- **Follow up:** if the promised timeline passes, a polite check-in with the recruiter is expected.
- **If rejected:** ask for feedback. Many companies give little, but some share level calibration ("strong at senior, not yet at staff"), which is valuable.
- **Reflect:** add the gaps to your practice log. Every loop is practice for the next one.

## One-page day-of checklist

- [ ] Links, times, and time zone confirmed
- [ ] Camera, mic, and screen share tested; notifications off
- [ ] Water, food, notepad, pen
- [ ] Intro bullets and story bank bullets visible
- [ ] Warm-up done (one problem, one story)
- [ ] For every round: restate, clarify, plan, build in checkpoints, test, summarize
- [ ] Two questions ready per interviewer
- [ ] Post-loop notes written the same day
