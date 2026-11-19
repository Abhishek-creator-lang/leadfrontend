---
title: Mapping stories to leadership principles
description: How to research a company's values or leadership principles, map your story bank to them, and adapt your answers, with examples for common value frameworks and front end-specific angles.
source: original
---
Many companies score behavioral interviews against **published values or leadership principles**. Amazon is the best-known example, but most mature tech companies have some equivalent, from explicit principle lists to internal competency rubrics. Mapping your story bank to the target company's framework is one of the highest-return prep activities, because it lines your evidence up with the interviewer's scoring sheet.

## How companies use values in interviews

| Practice | What it looks like |
| --- | --- |
| Assigned principles | Each interviewer is assigned 2–3 principles to probe (common at Amazon) |
| Competency rubrics | Scores for collaboration, ownership, communication, etc., tied to the level |
| Culture/values round | A dedicated round on how you work (sometimes called "values" or "culture add") |
| Bar raiser / independent assessor | An interviewer from outside the team focused on the long-term hiring bar |

Ask your recruiter: "Are behavioral rounds based on specific values or principles? Is there a document I can read?" Most will tell you.

## Research the framework

1. Read the company's careers page, values page, and engineering blog.
2. Look for public material on their engineering culture (talks, handbooks, ladder documents some companies publish).
3. Note recurring words in job descriptions ("bias for action", "craft", "ownership", "customer obsession").
4. Talk to current or former employees if you can: "Which values actually drive decisions day to day?"

Then translate each value into **observable behaviors** that an interviewer could note down.

## Common value themes and what they mean behaviorally

Most value lists, whatever their wording, reduce to a familiar set of themes:

| Theme | Common names | Observable behaviors | Front end story angles |
| --- | --- | --- | --- |
| Customer focus | Customer obsession, user first, focus on impact | Decisions driven by user data; advocating for users against internal convenience | Performance for low-end devices; accessibility; fixing a confusing flow using session data |
| Ownership | Ownership, act like an owner, accountability | Owning outcomes beyond your remit; long-term thinking; no "not my job" | Owning a cross-team incident; fixing a neglected build pipeline |
| Bias for action | Move fast, bias for action, ship it | Deciding with incomplete info; reversible bets; avoiding analysis paralysis | Shipping behind a flag to learn; time-boxed spike |
| High standards | Craft, insist on high standards, quality | Raising bars and keeping them; refusing to ship known defects without a plan | Introducing a11y gates, perf budgets, test strategy |
| Dive deep | Dive deep, curiosity, rigor | Investigating to root cause; knowing details; skepticism of metrics | Tracking an INP regression to a third-party script |
| Simplicity / invention | Invent and simplify, think big | Novel solutions; removing complexity | Replacing a bespoke state system with a query cache |
| Disagree and commit | Have backbone, candor, respectful challenge | Challenging decisions with data; committing fully after the decision | Pushing back on a launch date; then supporting the outcome |
| Deliver results | Deliver results, get things done, impact | Hitting goals despite setbacks; prioritization | Launching on time with negotiated scope |
| Earn trust | Earn trust, transparency, humility | Admitting mistakes; candid communication; listening | Owning a mistake in a postmortem; changing your mind |
| Develop people | Hire and develop, grow others, mentorship | Mentoring, raising the hiring bar, sponsorship | Growing an engineer; redesigning the interview loop |
| Frugality / efficiency | Frugality, do more with less | Achieving outcomes with constrained resources | Delivering a migration with a small team via codemods |
| Learn and be curious | Learning, growth mindset | Seeking new knowledge; applying lessons | Learning RSC; applying a postmortem lesson org-wide |

## Example: Amazon's Leadership Principles

Amazon publishes 16 Leadership Principles (including Customer Obsession, Ownership, Invent and Simplify, Are Right A Lot, Learn and Be Curious, Hire and Develop the Best, Insist on the Highest Standards, Think Big, Bias for Action, Frugality, Earn Trust, Dive Deep, Have Backbone; Disagree and Commit, Deliver Results, and the two added in 2021: Strive to be Earth's Best Employer and Success and Scale Bring Broad Responsibility). Interviewers are typically assigned specific principles and ask for multiple stories.

Practical implications:
- Expect **two stories per principle** in some rounds, and deep follow-ups ("What data did you look at?", "What would you do differently?").
- Use precise data. "Dive Deep" interviewers will probe the metrics.
- "Are Right A Lot" doesn't mean always being right. It means good judgment, seeking diverse perspectives, and working to disconfirm your own beliefs.
- Stories should be recent and **yours**. Bar raisers are quick to notice borrowed credit.

## Example: values with a craft or product emphasis

Companies that emphasize craft and product quality (common among design-led and developer-tool companies) look for:
- Attention to detail in UX, motion, accessibility, and performance
- Opinions about product direction, backed by user insight
- Shipping polished work in small increments

Front end engineers have an advantage here. Prepare stories where you improved user-facing quality through technical decisions.

## Example: values with a scale or impact emphasis

Large consumer platforms tend to emphasize impact at scale, moving quickly, and directness:
- Quantified impact on many users
- Speed with safety: experiments, flags, rollbacks
- Direct feedback and disagreement handled constructively

## Build your mapping table

Combine your story bank with the company's principles:

| Principle (target company) | Primary story | Backup story | Key evidence to emphasize |
| --- | --- | --- | --- |
| Customer focus | Dashboard perf rescue | Accessibility remediation | Real user data; low-end devices; renewal outcome |
| Ownership | Safari checkout outage | Build pipeline overhaul | Took IC role; drove postmortem actions to completion |
| Bias for action | Flagged launch to learn | Spike to unblock vendor choice | Reversible decision; time-boxed |
| High standards | Design system a11y gates | Performance budgets in CI | Raised bar systemically, with metrics |
| Dive deep | INP regression investigation | Hydration mismatch hunt | Specific tools, data, root cause |
| Disagree and commit | PM launch disagreement | Next.js vs SPA debate | Data-backed challenge; committed after decision |
| Develop people | Growing Arjun to senior | Interview loop redesign | Specific coaching, promotion outcome |
| Deliver results | Search launch with scope cuts | Monorepo migration | Hit date by negotiating scope |

Check:
- Every principle has at least two stories.
- No single story is your primary for more than two principles.
- Stories span different projects and years.

## Tuning the same story for different principles

Take an incident story and adjust what you emphasize:

| Principle | Opening line | Emphasis |
| --- | --- | --- |
| Ownership | "Even though the bug came from another team's API change, I took incident command…" | Accountability beyond your remit |
| Dive deep | "The error rate pointed to Safari, but the stack traces were minified and inconsistent…" | Investigation, data, tools |
| Earn trust | "In the postmortem I started by describing my own part: I'd approved the release without WebKit coverage…" | Candor, blamelessness |
| Insist on high standards | "Afterwards, I pushed for progressive rollouts with automatic halts as a standard for all teams…" | Systemic bar-raising |

## Front end-specific angles interviewers appreciate

Front end engineers sometimes struggle to show business impact. Use these angles:

- **Performance → revenue/engagement:** tie vitals improvements to conversion or retention.
- **Accessibility → customers and compliance:** markets reached, legal risk reduced, audit results.
- **Design systems → velocity and consistency:** time to build features, defect reduction.
- **Developer experience → delivery speed:** CI time, deploy frequency, onboarding time.
- **Reliability → trust:** crash-free sessions, incident reduction, support tickets.
- **Experimentation → product decisions:** A/B test infrastructure enabling faster learning.

## Preparing for the bar raiser or values round

- Expect **longer follow-up chains** on fewer stories. Be ready for five or six levels of "why".
- Show **long-term thinking:** decisions that held up, or that you'd revisit.
- Show **self-awareness:** weaknesses you're working on, with evidence.
- Expect questions about **hiring and raising the bar** at lead level.

## Avoiding the trap of "performing values"

Interviewers can tell when candidates name-drop principles ("This shows my customer obsession…"). Don't label your stories. **Let the behaviors speak**, and the interviewer will map them. The work of mapping is preparation for you, not a script for the interview.

## Checklist

- [ ] I know which values or principles the company scores against
- [ ] Each principle has a primary and backup story
- [ ] Stories are distributed across projects and years
- [ ] Each story includes data and follow-up depth for "dive deep"-style probing
- [ ] I can tell a failure story and a disagreement story for any principle that involves judgment
- [ ] I can link front end work to business outcomes
