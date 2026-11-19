## How to structure your answer

Use **STAR-L**, but shape the Action as a **detective story**: symptom, hypotheses, evidence, the moment it clicked.

1. **Situation**: the symptom and who it hurt. Why was it hard (intermittent, only in production, only on some devices)?
2. **Task**: why it was yours to solve.
3. **Action**: two or three hypotheses you tested, the tools you used, and the evidence that ruled each in or out.
4. **Result**: the fix, the measured impact, and the guardrail you added.
5. **Learning**: what it changed about how you or the team debug.

Choose a bug whose root cause you can explain clearly in two sentences. A bug that was hard only because the code was messy is a weaker story.

## Model answer

**Situation.** I worked on a patient portal for a healthcare provider. Patients filled out long pre-visit questionnaires, and support started getting reports that answers were "disappearing". It was about 0.5% of submissions, almost all on iOS Safari, and nobody could reproduce it. Clinics were calling patients to re-collect answers, so it was costing staff time and trust.

**Task.** I was the senior engineer on the forms team, and I took ownership after two other attempts had closed it as "cannot reproduce".

**Action.** First I got better data. I added a privacy-safe breadcrumb log to our error tracker: form step changes, autosave requests, visibility changes and page lifecycle events, with no answer content. Within a week the pattern was clear: every affected session had a `visibilitychange` to hidden followed by a full page load, with no `beforeunload` in between.

My first hypothesis was that autosave requests failed when the tab went to the background. The network logs disproved it; requests that ran had succeeded. My second hypothesis was the real one: iOS was discarding the backgrounded tab to save memory, typically when patients switched to their photo app to upload an insurance card. Our autosave was debounced by 3 seconds and also ran on `beforeunload`, which iOS does not reliably fire when it discards a page. Anything typed in the last few seconds before switching apps was lost, and our restore logic then treated the stale draft as the latest.

I reproduced it on a real iPhone by opening a few heavy apps after switching away, which confirmed the theory in an afternoon.

The fix had three parts: flush the autosave on `visibilitychange` to hidden using `navigator.sendBeacon` with a `fetch` keepalive fallback; also persist the draft to IndexedDB on every change, so a reload could recover locally; and add a version number to drafts so restore always picked the newest copy.

**Result.** Lost-answer reports went from about 40 a week to zero over the next two months. I wrote a short internal guide on page lifecycle events, and we added a lint rule flagging new `beforeunload`-only save logic. Two other teams found the same pattern in their own forms.

**Learning.** "Cannot reproduce" usually means "not enough data". Now I instrument first and theorise second.

## Why this answer works

- **Real impact**: lost medical answers and clinic staff time, not just an annoying glitch.
- **Systematic method**: instrument, form hypotheses, rule one out with evidence, confirm on a device.
- **Platform depth**: page discarding on iOS, the unreliability of `beforeunload`, `sendBeacon` and IndexedDB are all accurate and specific.
- **Privacy awareness**: logging events without patient data shows maturity in a regulated domain.
- **Prevention beyond the fix**: guide, lint rule and help for other teams.
- **Clear learning** that applies to future bugs.

## Red flags to avoid

- A bug that was a typo or a missing null check. It does not show depth.
- Taking credit for a fix that a teammate found, or hiding that you asked for help.
- "I tried random things until it worked" with no hypotheses.
- Blaming another team, a library or "bad code" without owning the investigation.
- Stopping at the fix, with no monitoring or test to catch a regression.
- Jargon you cannot explain when asked to go one level deeper.

## Likely follow-up probes

- **"Why not just use `beforeunload`?"** Explain that mobile browsers may discard or freeze pages without firing unload events, and that `visibilitychange` is the recommended last reliable signal.
- **"How did you test the fix?"** Real-device testing, a unit test for draft versioning, and a staged rollout behind a flag while watching the breadcrumb data.
- **"How did you balance this with other work?"** Explain the time-box you set and how you made the case to your manager given the clinic impact.
- **"What if it had been a different root cause?"** Show you had a plan B: more instrumentation, session replay with masking, or asking affected users for device details.
- **"How do you teach debugging to juniors?"** Talk about pairing, writing down hypotheses, and reviewing investigations together afterwards.
