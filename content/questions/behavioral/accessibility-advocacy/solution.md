## How to structure your answer

Use **STAR-L**, and make the Action cover three layers: persuading people, fixing the foundations, and changing the process.

1. **Situation**: the product, who was excluded, and how you found out.
2. **Task**: whether this was your remit or something you took on.
3. **Action**: the case you made, the systemic changes, and how you built habits.
4. **Result**: compliance or audit results, plus a user-facing outcome.
5. **Learning**: what you would do sooner.

## Model answer

**Situation.** I was a senior front-end engineer on a citizen-facing portal for a regional government, where people applied for permits and benefits. A blind user emailed the service desk saying she had given up on a housing benefit form halfway through because the date fields and error messages were silent in her screen reader. When I tested the form with NVDA, I could not complete it either. Nobody had raised accessibility in our backlog, and our next external audit was a year away.

**Task.** I was not the team lead, but I had built a lot of our shared components, and I decided to take this on.

**Action.** First, I made the problem visible. I recorded a three-minute video of me trying to complete the form with NVDA and showed it at our sprint review, alongside the user's email with her permission. I also noted that public-sector sites in our jurisdiction were legally required to meet WCAG 2.1 AA. The video did more than the legal point; the product owner asked for a plan the same day.

Second, I fixed the foundations rather than the one form. I ran axe on our twenty most-used pages, then grouped the issues: 70% traced back to five shared components (date input, error summary, modal, select and tabs). I rebuilt those in our component library with proper labels, `aria-describedby` for hints and errors, focus moving to an error summary on submit, and keyboard support for the modal and tabs.

Third, I changed the process. I added jest-axe to component tests and an axe scan of key journeys to our Playwright suite in CI, and wrote a one-page checklist for design reviews covering focus order, contrast and error states. I ran two lunch sessions on screen reader basics and set up a monthly session where we paid users of assistive technology, recruited through a disability charity, to try new features.

**Result.** Within four months, automated violations on the top twenty pages dropped from 312 to 14, and the external audit later found no AA blockers. The completion rate of the housing benefit form rose from 61% to 74%, partly because clearer errors helped everyone. I also contacted the user who wrote in; she completed her application online.

**Learning.** I relied too much on automated tools at first. They catch perhaps a third of issues; the user sessions found problems like confusing reading order that axe never flagged. I now plan for manual and user testing from the start.

## Why this answer works

- **Real user, real impact**: the story starts with a person who was excluded, which creates urgency.
- **Showing beats telling**: the screen reader video persuaded faster than citing regulations.
- **Systemic fix**: tracing most issues to shared components gives the highest leverage.
- **Process change**: CI checks, design checklist and training make accessibility part of normal work.
- **Leadership without the title**: the candidate drove this as a senior IC.
- **Knows the limits of automation**: a mature, accurate point.

## Red flags to avoid

- Treating accessibility as only ARIA attributes or only a Lighthouse score.
- Saying "we made it fully accessible", which is rarely true and suggests limited knowledge.
- Only citing legal risk, with no user perspective.
- Fixing bugs one by one without changing components or process.
- Talking about disabled users in a pitying or abstract way.

## Likely follow-up probes

- **"What if the product owner had said no?"** Quantify the risk (legal, users affected), propose a small time-boxed start, and build allies in design and support.
- **"How did you handle focus management in the modal?"** Move focus into the dialog on open, keep it inside while open, return it to the trigger on close; or use the native `<dialog>` element with `showModal()`.
- **"What can automated tools not catch?"** Meaningful alt text, logical reading order, understandable error messages, and whether a flow makes sense with a screen reader.
- **"How do you keep accessibility from regressing?"** Component-level tests, CI scans, design review checklist and regular manual audits.
- **"How would you prioritise a backlog of 300 issues?"** By severity and journey importance: blockers on critical journeys first, then shared components.
