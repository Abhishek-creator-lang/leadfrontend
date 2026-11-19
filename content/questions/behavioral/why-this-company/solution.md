## How to structure your answer

STAR does not fit here. Use a three-part **Mission – Match – Momentum** structure and keep it to about 90 seconds:

1. **Mission (why them)**: one or two specific things about the product, users or engineering problems, showing research. Mention something you could only know by using the product or reading their engineering blog, talks or job description carefully.
2. **Match (why you)**: one or two experiences that map directly to those problems. Use a number.
3. **Momentum (why now)**: what you want to learn or do next, and why this role is the place to do it.

How to prepare:

- Use the product as a real user for at least an hour. Run Lighthouse or look at the network tab, and note anything that hints at their stack or challenges. Be tactful: observations, not criticism.
- Read the engineering blog, recent conference talks, open-source repos and the job description. Lead job descriptions usually name the problem they are hiring for ("scale our design system", "own web performance").
- Find the company's stage: hypergrowth, mature, turnaround. Each wants different things from a lead.

## Model answer

*Context: a lead front-end role at a fictional company, "Ledgerly", that makes accounting software for small businesses.*

"There are three reasons, and they are specific.

First, the product problem. I signed up for a trial last week and went through invoicing and bank reconciliation. Reconciliation is basically a large, editable data grid where people spend hours each month, so its responsiveness directly affects how users feel about the product. Your engineering blog post on moving to a virtualised grid said you are now working on keyboard-first workflows and offline drafts. That is exactly the kind of front-end problem I enjoy: dense, stateful UI where performance and accessibility are product features.

Second, the match with what I have done. At my current company I led the rebuild of our reporting table, which renders up to 50,000 rows. We moved to row and column virtualisation, moved sorting into a web worker, and added full keyboard navigation following the ARIA grid pattern. p75 Interaction to Next Paint on that screen went from about 450 to 160 milliseconds, and support tickets about the table dropped by half. I also helped set up our design system's data components, which seems relevant since the job description mentions unifying three product areas onto one component library.

Third, timing. I have spent the last two years as a lead for one team of six. The description says this role leads front-end architecture across three squads and works closely with design leadership. That is the next step I want: more cross-team influence, while still staying close to the code on hard problems. I would rather do that at a company where the front end *is* the product, as it is for an accounting tool people use all day, than somewhere it is a thin layer over an API."

## Why this answer works

- **Proves research with specifics**: used the product, read the blog, read the job description closely.
- **Frames the company's problem in front-end terms**: dense data UI, responsiveness, keyboard workflows.
- **Concrete, quantified match**: virtualisation, web worker, ARIA grid pattern and an INP improvement.
- **Clear growth motive** that matches the scope of the role rather than just the title.
- **Positive throughout**: no complaints about the current employer.
- **Structured and short**: three numbered reasons make it easy to follow.

## Red flags to avoid

- Generic praise that fits any company: "innovative", "great culture", "fast-growing".
- Talking only about what you get (salary, remote work, brand name) and nothing about what you bring.
- Criticising the product harshly to show insight. Offer observations and curiosity, not a teardown.
- Getting basic facts wrong, such as the main product or who the customers are.
- Reciting the company's mission statement back to them.

## Likely follow-up probes

- **"What would you work on first?"** Talk about listening first: meet the squads, read recent incidents and RFCs, look at RUM data. Then name one or two hypotheses from your research that you would want to test.
- **"What concerns do you have about joining us?"** Name one honest, thoughtful question, such as how the three squads share ownership of the design system. This shows judgement, not doubt.
- **"What else are you considering?"** Be truthful but brief. Say you are being selective and explain what makes this role stand out.
- **"What did you notice when using our product?"** Have two positive observations and one respectful question ready, for example about how they handle offline edits.
