## How to structure your answer

Use **STAR-L**, but shift the weight towards the end. The failure itself should be quick; the interviewer cares most about how you recovered and what changed.

1. **Situation (15%)**: the context and why it mattered.
2. **Task (10%)**: what you were responsible for.
3. **Action (30%)**: what you did, including the mistake. Name the decision that went wrong in one plain sentence.
4. **Result (15%)**: the actual impact, with numbers. Do not minimise it.
5. **Learning (30%)**: what you changed, and proof that the change held up on a later project.

Choose a failure that is real but not catastrophic for trust (no ethics or security negligence stories), and one where the lesson is about judgement rather than a typo.

## Model answer

**Situation.** I was the senior front-end engineer on a video streaming web app. We were replacing our home-grown player UI with a new component built on top of Shaka Player, mainly to support picture-in-picture and better caption styling. The launch was tied to a sports season starting on a fixed date.

**Task.** I owned the player front end and the rollout plan.

**Action.** We had good unit and Playwright coverage on Chrome and Firefox, and our QA team signed off. I knew our Safari and smart-TV browser coverage was thin, but I reasoned that the new component used the same Media Source Extensions path as the old one, so the risk was low. I rolled it out to 100% on day one instead of ramping, because the marketing campaign wanted every user on the new experience. That was my call, and I did not push back.

**Result.** Within two hours, playback-start failures on Safari went from 0.4% to 9%. The new component attached the caption track before the media was ready, and Safari's native HLS handling rejected it. Roughly 60,000 sessions failed to start during the opening match. I rolled back through the feature flag within 25 minutes of the first alert, wrote the incident update myself, and shipped a fix with a Safari-specific test two days later.

**Learning.** My mistake was not the bug; it was treating "low risk" as a reason to skip a ramp on the one surface where we had the least evidence. I changed two things. First, I introduced a staged rollout policy for anything in the playback path: 1%, 10%, 50%, 100%, with automatic halts if playback-start failure rate moved more than 0.5 points for any browser family. Second, I added Safari and a Tizen TV emulator to the nightly test run via a device cloud. Eight months later we launched a new ad-insertion flow; the 1% stage caught a Samsung TV regression that affected only a few hundred sessions instead of hundreds of thousands. I also now say no to "100% on day one" requests and offer marketing a fast ramp instead, which they have always accepted.

## Why this answer works

- **Clear, honest ownership**: "That was my call" is stated plainly, with no blaming of QA or marketing.
- **Real stakes, quantified**: a 9% failure rate and 60,000 sessions makes it a genuine failure.
- **Fast, mature recovery**: rollback in 25 minutes and the candidate wrote the incident update personally.
- **The lesson is about judgement**, not just "write more tests". The candidate identifies the reasoning error (low risk on a low-evidence surface).
- **Evidence the lesson stuck**: a later launch where the new process paid off.
- **Systemic fix**: a rollout policy and test coverage that protect the whole team, not just the candidate.

## Red flags to avoid

- A fake failure ("I work too hard", "I cared too much about quality").
- A failure caused entirely by someone else, where your only role was to notice it.
- Defensiveness or long explanations of why it was not really your fault.
- A lesson that is generic ("communication is important") with no change in behaviour.
- Picking something so serious it raises integrity questions, such as ignoring a known security issue.
- Excessive self-criticism. You want to sound accountable, not shaken.

## Likely follow-up probes

- **"Why didn't you push back on marketing at the time?"** Be honest: you underestimated the risk and wanted to be seen as accommodating. Explain how you now frame the trade-off (fast ramp vs big bang) so the business still gets what it needs.
- **"How did the team react?"** Talk about running a blameless post-incident review and making sure the QA team did not feel blamed for the gap.
- **"How did you decide on the rollout percentages and halt thresholds?"** Show you based them on baseline variance from historical data, not guesses.
- **"What would you do if this happened on your new team?"** Describe the first hour: flag off, communicate, then root cause.
- **"Tell me about another failure."** Have a second, different one ready, ideally about people or planning rather than code.
