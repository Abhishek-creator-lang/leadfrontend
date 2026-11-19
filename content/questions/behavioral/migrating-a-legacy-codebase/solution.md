## How to structure your answer

Use **STAR-L**. In the Action, cover four themes: **why, how to coexist, how to de-risk, how to finish**.

1. **Situation**: the legacy system, its real costs (bugs, hiring, speed, security), and the size of the codebase.
2. **Task**: your role, the team, and the constraint that features had to keep shipping.
3. **Action**: the migration strategy, the coexistence mechanism, safety nets and how you kept momentum.
4. **Result**: percentage migrated, timeline, and measurable improvements.
5. **Learning**: what you would change.

Interviewers often ask "why not just rewrite?". Address it before they do.

## Model answer

**Situation.** I joined an internal-tools platform team at a logistics company. Our warehouse operations console was about 180,000 lines of Backbone.js and jQuery with Handlebars templates, used by 3,000 warehouse staff daily. Bugs in this code took twice as long to fix as in our newer React apps, two of the three engineers who knew it well had left, and job candidates often turned down the role when they heard about the stack.

**Task.** As the tech lead for a team of six, I was asked to modernise it to React and TypeScript, but operations would not accept a feature freeze; peak season was five months away.

**Action.** I ruled out a rewrite early. The console had years of undocumented edge cases for scanners, printers and offline handling, and a rewrite would have meant months without shipping. Instead I proposed a strangler approach in a two-page plan.

The key piece was coexistence. I built a small bridge that let a Backbone view mount a React component into a DOM node and pass data in through a shared event bus, plus the reverse for a few legacy widgets we could not move yet. That meant we could migrate at component level, starting with leaf components, then whole screens.

We set three rules: new features were React-only; any engineer touching a legacy screen budgeted 20% extra to migrate part of it; and a CI check counted Backbone files and failed if the count went up. That stopped the legacy code from growing.

For safety, every migrated screen went behind a feature flag per warehouse. We rolled out to one pilot warehouse first, compared error rates and task completion times, then expanded. Critical flows like pick-and-pack got Playwright tests against both versions before switching.

To keep momentum, I published a migration burn-down chart in our team channel and pulled two engineers fully onto the hardest screens for the last six weeks, so the final 20% did not drag on.

**Result.** We migrated 94% of the code in nine months. The remaining 6%, a rarely used report builder, was retired instead after product confirmed only 12 users touched it. Median time to fix a bug dropped from 5.5 days to 2 days, and the initial JavaScript bundle fell from 1.9 MB to 640 KB, which mattered on the old warehouse terminals. Peak season ran with zero migration-related incidents, and we hired two engineers in the following quarter who cited the modern stack.

**Learning.** I would set up the burn-down and the CI ratchet in week one. We added them in month three, and the first months moved slower than they needed to.

## Why this answer works

- **Business case**: bug-fix time, knowledge loss and hiring, not "Backbone is old".
- **Rewrite explicitly rejected** with a credible reason (undocumented edge cases).
- **Concrete coexistence mechanism**: a mount bridge and event bus.
- **Ratchet and rules** to stop the legacy code from growing, which many migrations miss.
- **Progressive rollout** by warehouse with real operational metrics.
- **Finishing well**: focused effort at the end and retiring rather than migrating unused features.

## Red flags to avoid

- Justifying the migration with personal preference or trends.
- A big-bang rewrite with no fallback, presented as a success without acknowledging the risk.
- A migration that is still "in progress" years later, told as a success.
- No mention of how users were protected during the switch.
- Ignoring the team's experience of doing repetitive migration work.
- Forgetting performance, accessibility or analytics parity.

## Likely follow-up probes

- **"How did the bridge handle shared state?"** Explain the event bus as a one-way contract, with the legacy model as the source of truth until a whole screen moved.
- **"How did you estimate nine months?"** Sampling migration effort on a few screens of each size, then extrapolating with a buffer.
- **"What would make you choose a rewrite?"** A small codebase, a fundamentally wrong data model, or a platform change (for example, web to native) where coexistence is impossible.
- **"How did you keep engineers engaged?"** Rotating the hardest screens, letting people own whole areas, and celebrating milestones like deleting a dependency.
- **"How did you handle feature requests during the migration?"** Built in React on the new path, and used them as a reason to migrate the surrounding screen.
