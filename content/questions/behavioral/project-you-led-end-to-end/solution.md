## How to structure your answer

Use **STAR-L** (Situation, Task, Action, Result, Learning) and spend most of your time on Action and Result.

1. **Situation (15%)**: the product, the team, and the problem in user or business terms. One number that shows the pain.
2. **Task (10%)**: what *you* owned. Be precise: "I was the tech lead for four engineers and accountable for the launch date."
3. **Action (50%)**: three or four decisions, each with the alternative you rejected and why. Mix technical decisions with people decisions.
4. **Result (15%)**: hard numbers, plus a second-order outcome (a reusable pattern, a promoted engineer).
5. **Learning (10%)**: one honest thing you would change.

Pick a project where the outcome depended on you. If the story would have gone the same way without you, choose another one.

## Model answer

**Situation.** At a mid-size e-commerce company, our checkout was a five-year-old Angular.js app embedded in a React storefront. Checkout conversion on mobile was 2.1 points lower than desktop, and our RUM data showed a p75 Interaction to Next Paint of 480 ms on the payment step. Every checkout change also needed a separate release train, so experiments took weeks.

**Task.** I proposed and then led the rewrite of checkout into the main Next.js app. I had four front-end engineers, a designer and a part-time back-end engineer, and I was accountable for both the migration and not losing revenue on the way.

**Action.** First, I refused a big-bang rewrite. I wrote a short RFC proposing a step-by-step migration: one step at a time (address, shipping, payment, review) behind a feature flag, with the old app still serving the remaining steps through a shared session. Leadership liked that it let us stop at any point without stranding work.

Second, I set measurable exit criteria before writing code: each step had to match or beat the old step's conversion in a 50/50 experiment, keep INP under 200 ms at p75, and pass an axe-core plus manual screen reader check. That turned "is it done?" into a dashboard instead of a debate.

Third, I split ownership by step rather than by layer, so each engineer owned a step end to end. I kept the cross-cutting pieces myself: the session bridge between the two apps and the form validation library, since those were the riskiest parts.

Fourth, when payment-step INP came in at 310 ms, I traced it to a third-party fraud script running synchronously on every keystroke. I worked with the vendor to load it after the first interaction and debounce its field listeners.

**Result.** We shipped all four steps in 14 weeks against a 16-week plan. Mobile conversion rose by 1.4 points, which finance valued at about $3.2M a year. p75 INP on payment dropped to 140 ms. Checkout experiments went from about three weeks to three days because they rode the main deploy pipeline. Two engineers who owned steps went on to lead their own projects.

**Learning.** I underinvested in analytics parity. Our event names changed and the data team spent two weeks reconciling funnels. Now I put analytics contracts in the definition of done from day one.

## Why this answer works

- **Business framing first**: a conversion gap and slow experiments, not "the code was old".
- **Clear ownership**: the candidate separates what they did (RFC, exit criteria, risky pieces) from what the team did.
- **Trade-offs are explicit**: incremental migration vs big-bang, ownership by step vs by layer.
- **Measurable done**: exit criteria defined up front is a strong lead signal.
- **Deep enough technically**: the INP debugging shows the candidate still goes hands-on when it matters.
- **People outcome**: growing two engineers shows leadership beyond delivery.
- **Honest learning** that is specific and already changed their process.

## Red flags to avoid

- Saying "we" for everything so the interviewer cannot tell what you did, or "I" for everything so it sounds like you did not lead anyone.
- Results with no numbers, or numbers with no baseline ("performance improved a lot").
- A project that was really a single feature. At lead level, the scope should involve several people or teams.
- Skipping the risks. A story where nothing went wrong sounds made up or small.
- A long technical tour with no mention of stakeholders, timeline or people.

## Likely follow-up probes

- **"What would have happened if the experiment for a step had lost?"** Explain the rollback plan (flag off, root-cause, re-run) and how you protected the timeline with buffer.
- **"How did you decide on 14–16 weeks?"** Talk about estimating by step, spikes for the session bridge, and adding a contingency for unknowns.
- **"Who disagreed with you?"** Have a real example ready, such as a product manager wanting a big-bang launch for marketing reasons, and how you reached agreement.
- **"How did you keep leadership informed?"** Weekly written updates with a red/amber/green status, the metric dashboard, and early escalation of risks.
- **"What did you personally code?"** Be concrete about the riskiest pieces you kept, and why a lead keeps some of them.
- **"How would you run it differently with twice the team?"** Discuss coordination cost, parallel steps, and when more people would not help.
