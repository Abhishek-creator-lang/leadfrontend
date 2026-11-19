## How to structure your answer

Use **STAR-L**, and frame the design system as a **product**: users, problem, MVP, adoption, metrics.

1. **Situation**: the inconsistency or duplication, measured (number of button variants, accessibility defects, design-to-dev time).
2. **Task**: your role and the partnership with design.
3. **Action**: how you chose the first scope, the key technical decisions, the adoption strategy and the governance model.
4. **Result**: adoption numbers plus outcomes for users and teams.
5. **Learning**: what you would do differently.

Avoid spending the whole answer on component architecture. Interviewers care at least as much about adoption.

## Model answer

**Situation.** I was a senior front-end engineer at a fintech company with five product teams building a consumer banking web app and an internal back-office tool. An audit I did with our lead designer found 23 button styles, 9 modal implementations and 4 date pickers. An external accessibility audit had flagged 140 issues, and about 60% of them came from those duplicated components. Designers estimated they spent a third of their time redlining spacing and colours.

**Task.** I pitched a design system to our head of engineering and head of design together, and was asked to lead the engineering side with one other engineer, while the lead designer owned the design side.

**Action.** We treated it as a product. I interviewed engineers on every team and asked which components caused the most rework. The answer was form controls, modals and tables, so our MVP was tokens plus those three families, not 60 components.

Technically, we started with design tokens in a single JSON source, built with Style Dictionary into CSS custom properties and a Figma variables library, so design and code shared one source of truth and dark mode came almost free. Components were built in React on top of headless accessible primitives, with keyboard and screen reader behaviour tested with Testing Library and axe in CI, plus visual regression tests in Chromatic. We published with semantic versioning and changelogs, and provided codemods for breaking changes.

For adoption, I avoided a mandate. I picked the team with the worst accessibility debt, paired with them for two sprints to swap their forms over, and published the before-and-after audit results. That case study did more than any announcement. We also added a lint rule that warned when a team imported a raw `<button>` or a known legacy modal, and an adoption dashboard based on import analysis.

For sustainability, we set up a contribution model: teams could propose components through an RFC template, and we held weekly office hours with design. Components contributed by teams went through the same accessibility and visual tests.

**Result.** In a year, 82% of UI imports across the five teams came from the design system. Accessibility issues found in the follow-up audit dropped from 140 to 19. Designers reported that the time to hand off a new screen dropped by about 40%, and a full dark mode shipped in three weeks instead of the estimated quarter. Teams contributed 11 of the system's 45 components.

**Learning.** We underinvested in documentation early; engineers kept asking the same questions. Adding live examples and "do and don't" guidance in Storybook cut support questions roughly in half.

## Why this answer works

- **Quantified starting point**: variant counts, audit findings, designer time.
- **Product mindset**: user interviews, an MVP based on pain, and an adoption metric.
- **Strong technical foundation**: tokens as a single source, headless accessible primitives, automated a11y and visual tests, semver with codemods.
- **Adoption through proof**: a case study with a team, lint nudges and a dashboard instead of a mandate.
- **Sustainable governance**: contribution model and office hours.
- **Equal partnership with design**, which is essential for design systems.

## Red flags to avoid

- Building 60 components before any team used one.
- A design system run only by engineers, or only by designers.
- Forcing adoption by mandate with no migration help.
- Measuring success by number of components rather than adoption and outcomes.
- No versioning strategy, so every release breaks consumers.
- Ignoring accessibility, which is one of the main reasons design systems exist.

## Likely follow-up probes

- **"How did you handle a team that needed a variant the system didn't support?"** Explain escape hatches (composition, slots, tokens), and the path to contribute the variant back.
- **"How do you version and release without breaking teams?"** Semver, deprecation warnings for a release cycle, codemods and a changelog.
- **"Monorepo package or separate repo?"** Discuss trade-offs: atomic changes and easier testing in a monorepo vs independent release cadence.
- **"How did you get funding for the team?"** The accessibility audit results and design time savings made the business case, with a six-month checkpoint.
- **"How would you do this at 50 teams?"** A dedicated team, federated contributors, tiered support and stronger tooling for automated migrations.
