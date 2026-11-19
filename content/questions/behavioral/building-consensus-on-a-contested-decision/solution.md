## How to structure your answer

Use **STAR**, and make the Action describe the *process* you designed.

1. **Situation**: the decision, the camps, and the cost of not deciding.
2. **Task**: your role. Facilitator, decider, or both?
3. **Action**: agreeing criteria first, gathering evidence, giving everyone a voice, making the call, and handling those who disagreed.
4. **Result**: the decision, how well it held up, and how the relationships ended up.

Consensus does not mean everyone agrees. It means everyone understands the decision and can support it.

## Model answer

**Situation.** I was the front-end lead for a B2B analytics product with three teams. We needed a charting approach for a new dashboard builder. One camp, led by two senior engineers, wanted to standardise on a high-level charting library because it was fast to build with. Another camp wanted to build on D3 primitives with our own React components for full control over interaction and accessibility. The debate had run for three weeks in Slack threads and two meetings, and the dashboard project was blocked.

**Task.** As the lead across the teams, I owned getting to a decision. My manager made clear that if we could not agree, I should decide.

**Action.** First, I stopped the debate about solutions and moved it to criteria. I ran a 45-minute session where we listed what mattered and weighted it together: rendering 50,000 points smoothly, keyboard and screen reader support, custom interactions like brushing and linked cursors, bundle size, and time to first dashboard. Agreeing the weights before scoring any option took the heat out of the conversation.

Second, I replaced opinions with evidence. Each camp got four days to build the same test chart: a 50,000-point time series with brushing, a keyboard-navigable tooltip and a data table fallback. We measured frame time with the Performance panel, checked accessibility with NVDA, and measured gzipped bundle size.

Third, I made sure quieter voices were heard. I asked everyone to score the prototypes independently in a shared sheet before discussion, so the most senior people did not anchor the room.

The results were mixed. The library was quicker for standard charts and had acceptable accessibility, but it dropped below 30 fps on the large dataset and could not do linked cursors cleanly. I proposed a hybrid: the library for standard charts, wrapped behind our own `Chart` interface, and a canvas-based D3 component for the two high-density chart types. I said explicitly that I was making the call, explained the reasoning in writing, and named what would make us revisit it.

One of the senior engineers still preferred full D3. I asked him to own the high-density component, which used his expertise and gave him a stake in the outcome.

**Result.** We decided within ten days after three weeks of deadlock. The dashboard builder shipped two months later with 14 chart types, and the wrapper meant we later swapped the library version without touching product code. The engineer who had disagreed presented the canvas component at our internal conference.

## Why this answer works

- **Criteria before options**: agreeing weights first is a classic facilitation technique that reduces conflict.
- **Prototypes settle facts**: the same test for both camps makes the comparison fair.
- **Independent scoring** limits anchoring and lets junior people contribute.
- **Clear decision rights**: the candidate made the call openly and explained why.
- **Disagreement handled with respect**: giving the dissenter ownership turned resistance into commitment.
- **Good architecture**: the wrapper interface reduced the cost of being wrong.

## Red flags to avoid

- Waiting for unanimous agreement and letting the decision drift.
- Using seniority to end the debate without a process.
- Presenting a compromise that nobody actually wanted just to avoid conflict.
- Ignoring or sidelining the people who lost the argument.
- No outcome for the relationships, only for the code.

## Likely follow-up probes

- **"What if the prototypes had been equally good?"** Pick the cheaper, more reversible option and set a review date.
- **"How do you know when to stop seeking consensus and decide?"** When the cost of delay is greater than the cost of a possibly suboptimal choice, and when new information is no longer arriving.
- **"What if the dissenting engineer had kept arguing after the decision?"** A private conversation: acknowledge the disagreement, explain what commitment looks like, and set expectations.
- **"How do you handle decisions where you are one of the camps?"** Declare your bias, let someone else facilitate, or ask a neutral person to decide.
- **"What decision framework do you use?"** Mention ideas like reversible vs irreversible decisions, and roles such as decider, consulted and informed.
