---
title: Mentoring and team growth
description: How front end leads grow engineers deliberately, with growth plans, delegation, feedback, code review as teaching, onboarding, hiring, and the metrics and stories that show multiplier impact.
source: original
---
The clearest difference between a senior engineer and a lead is **leverage through people**. A lead who ships brilliantly while the team stagnates is a senior engineer with a title. Interviewers probe this with "How have you grown engineers?", "Tell me about someone you mentored", and "How do you handle an underperformer?". This chapter gives you practical methods and the evidence to bring.

## Mentoring vs coaching vs sponsoring

| Mode | What you do | When |
| --- | --- | --- |
| Teaching | Explain how something works | New skill, junior engineers |
| Mentoring | Share experience and advice | Career and technical guidance |
| Coaching | Ask questions so they find the answer | Building judgment, senior engineers |
| Sponsoring | Use your influence to get them opportunities and visibility | Ready for more scope |

Leads overuse teaching and underuse coaching and sponsoring. Sponsoring in particular (putting someone's name forward for a high-visibility project, or crediting them in leadership forums) is often the most valuable thing you can do.

## Growth plans

For each engineer you support, keep a lightweight plan:

| Field | Example |
| --- | --- |
| Current level and strengths | Mid-level; strong UI implementation, fast delivery |
| Target (6–12 months) | Senior: owns features end to end including design and rollout |
| Gaps | Writes few design docs; rarely raises risks early; limited testing strategy |
| Opportunities | Lead the notifications revamp; write its RFC; own its rollout |
| Support | Weekly 30-min pairing on the RFC; review drafts within 24h; intro to SRE lead |
| Evidence to collect | RFC accepted, project shipped on time, incident-free rollout |
| Check-in cadence | Biweekly 1:1, monthly plan review |

Tie plans to your company's career ladder so progress converts into promotion evidence.

## Delegation as a growth tool

Delegate *outcomes*, not tasks, and adjust support to the person's readiness:

| Readiness | Delegation style | Example |
| --- | --- | --- |
| New to the area | Directive: clear steps, frequent check-ins | "Here's the design; implement the API layer; let's review daily." |
| Some experience | Collaborative: agree on approach together | "Draft the approach; we'll review it before you build." |
| Experienced | Supportive: they lead, you advise | "You own the migration plan; loop me in on risks." |
| Expert | Full delegation | "Own it; tell me how it went." |

**The lead's discipline:** resist taking work back when it's done differently than you would. Intervene only for real risks: correctness, security, deadlines with consequences.

## Code review as teaching

Reviews are the highest-frequency teaching moment. Make them count:

- **Explain why**, and link to docs or ADRs. "Prefer deriving this during render. Storing it causes the stale-state bug we had in #1234."
- **Label severity:** `blocking:`, `suggestion:`, `nit:`, `question:`, `praise:`.
- **Ask questions** to build judgment: "What happens if this request resolves after unmount?"
- **Praise specifically:** "Nice use of a discriminated union here. It makes the error state impossible to forget."
- **Rotate reviewers** so knowledge spreads, and pair juniors with seniors on reviews.
- **Review turnaround SLA** (e.g. first response within 4 working hours) so you're not a bottleneck.

## Feedback

Use a simple, specific structure. One common model is **Situation, Behavior, Impact (SBI)**, followed by a request or question:

> "In yesterday's design review (situation), you dismissed the a11y concern before Priya finished (behavior). She told me afterwards she felt it wasn't worth raising issues (impact). Can we talk about how to handle disagreements in reviews?"

Principles:
- Give positive feedback often and constructive feedback promptly, in private.
- Focus on observable behavior, not personality.
- Make it two-way: ask for feedback on your own leadership regularly.

## Handling underperformance (as a tech lead, with the manager)

1. **Clarify expectations:** is the gap skill, will, clarity, or circumstance (health, personal)?
2. **Align with the manager.** Performance management is usually their responsibility. Your role is technical support and honest input.
3. **Set specific, measurable goals** with a timeline (e.g. 6 weeks).
4. **Support:** pairing, smaller scoped tasks, clearer specs.
5. **Document** progress and conversations factually.
6. **Escalate or adjust:** if there's no improvement, the manager takes formal steps; sometimes a role change fits better.

Interviewers want to see empathy *and* accountability. Neither ignoring the problem nor going straight to "managing them out".

## Onboarding

A strong onboarding program is a team multiplier:

| Week | Goals |
| --- | --- |
| 1 | Environment set up in < 1 day; ship a small PR; meet key partners |
| 2–3 | Complete a starter project with a buddy; read architecture docs and ADRs |
| 4–6 | Own a small feature end to end; join on-call shadowing |
| 8–12 | Fully independent on typical work; first design doc for mid+ |

Track **time to first PR** and **time to first independent feature**. Ask every new hire to improve one onboarding doc. They see the gaps best.

## Hiring

Leads shape the team through hiring:

- Design **structured interviews** with rubrics tied to the ladder (consistency, less bias).
- Prefer **realistic exercises** (UI coding, code review, design) over trivia.
- Calibrate interviewers with shadowing and reverse-shadowing; review debrief quality.
- Track pipeline metrics: pass-through rates, offer acceptance, candidate experience scores, diversity at each stage.
- Sell honestly: candidates should know the real challenges.

## Building a learning culture

| Practice | Format |
| --- | --- |
| Tech talks / brown bags | 30 min, rotating presenters, recorded |
| Reading or study groups | e.g. through react.dev or a performance book, one chapter per week |
| Guilds/chapters | Cross-team front end guild for standards and knowledge sharing |
| Blameless postmortems | Learning from incidents, shared widely |
| Pairing and mobbing | For complex work and knowledge transfer |
| Innovation time | Hack days, a percentage of time for exploration |

## Measuring your impact on people

Concrete evidence for interviews and performance reviews:

- Promotions you supported (e.g. "two engineers promoted to senior in 18 months")
- Expanded ownership (e.g. "three engineers now lead their own workstreams")
- Bus-factor improvements (e.g. "every critical system has 2+ owners")
- Onboarding time reduced
- Team engagement/retention scores
- Number of RFCs authored by people other than you

## Story template: "Tell me about someone you grew"

1. **Starting point:** their level, strengths, gaps (with respect).
2. **Diagnosis:** what was holding them back.
3. **Your approach:** the specific opportunities, delegation, feedback, and sponsorship.
4. **Their actions:** they did the work. Give them credit.
5. **Outcome:** promotion, scope, impact, and what they're doing now.
6. **What you learned** about mentoring.

> "Arjun was a strong mid-level engineer who avoided ambiguous work. I noticed he'd always ask for a fully specified ticket. I gave him ownership of our image pipeline migration with a clear outcome but an open approach, and we met weekly to coach him through the RFC rather than me writing it. I made sure he presented it at the architecture review himself. The migration cut LCP by 600ms on product pages, he was promoted to senior six months later, and he's now mentoring two engineers himself. What I learned is that he didn't lack skill. He lacked permission and safety to be wrong, so now I'm explicit about that with everyone I mentor."
