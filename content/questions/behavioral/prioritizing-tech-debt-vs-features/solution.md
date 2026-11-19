## How to structure your answer

Briefly state your general principle, then tell a **STAR-L** story that shows it in action.

A good principle sounds like: "I treat debt like any other investment. I pay it down when its ongoing cost to delivery, reliability or users is higher than the cost of fixing it, and I make that cost visible in terms product cares about."

In the story, show:

1. **Inventory and measurement**: what the debt was and how you measured its cost.
2. **Ranking**: why you chose this debt and not other items.
3. **The deal**: how capacity was agreed with product.
4. **Payoff**: results reported back in the same terms.

## Model answer

**Situation.** I led a team of seven engineers working on the web dashboard of a logistics SaaS product. The roadmap was packed with enterprise features for a big sales push. At the same time, engineers were frustrated: our CI took 38 minutes, about one in five runs failed on flaky end-to-end tests, and a large part of the app still used a home-grown data-fetching layer that nobody fully understood.

**Task.** The team wanted to stop features for a quarter and fix everything. Product wanted every sprint on enterprise features. I needed a plan both sides could support.

**Action.** I started by measuring rather than arguing. I pulled two months of data: engineers spent an average of about four hours a week waiting on or re-running CI. The custom data layer was involved in 14 of the 31 bugs filed that quarter. Changes touching it took roughly twice as long from first commit to merge as other changes.

Then I ranked debt by cost and effort with the team. We had about fifteen items. We agreed to leave most alone, including an old CSS setup that was ugly but stable and rarely changed. Two items stood out: CI speed and flakiness, which taxed every change, and the data layer, which slowed the exact areas the enterprise features needed to touch.

I brought this to our PM and engineering manager as a trade, not a demand. I framed the cost in roadmap terms: "At current speed, the enterprise features need about 11 sprints. If we spend roughly 20 percent of capacity for the next six weeks on these two items, my estimate is that the remaining work drops to around 8 sprints, and we ship with fewer bugs." We agreed on 20 percent capacity for six weeks, with a checkpoint at week three.

For CI, we split end-to-end tests into shards, quarantined flaky tests with an owner and a deadline for each, and cached dependencies and builds. For the data layer, we migrated only the modules the enterprise features touched, using TanStack Query, rather than the whole app.

**Result.** CI dropped from 38 to 11 minutes, and the flaky failure rate fell to under 3 percent. The enterprise features shipped in about eight and a half sprints. Bugs in the migrated modules fell by more than half the following quarter. I reported these numbers back to product, and we agreed to keep 15 percent capacity for engineering health permanently, with the team choosing items from a ranked list.

**Learning.** Debt conversations go better when you pick a few items, measure their cost in delivery time, and attach them to a roadmap goal. The team got less than "a quarter to fix everything", but more debt got paid down in the end because of the trust it built.

## Why this answer works

- **Principle plus evidence**: a clear framework, then a story that applies it.
- **Measured cost**: CI wait time, bugs linked to the data layer, cycle time.
- **Ruthless ranking**: explicitly chose not to fix some debt.
- **Framed as a trade** in roadmap terms the PM cares about, with a checkpoint.
- **Targeted execution**: migrated only the modules the roadmap touched.
- **Closed the loop**: reported results and turned a one-off into a lasting agreement.

## Red flags to avoid

- "We should always fix tech debt first" or "debt can wait until after launch" as absolutes.
- Asking for a big rewrite with no measured case.
- Treating product as the enemy.
- Hiding refactoring inside feature estimates without telling anyone. Some padding is normal, but systematic hiding breaks trust.
- No follow-up showing whether the investment paid off.

## Likely follow-up probes

- **"What if product said no?"** Reduce the ask, target the debt that blocks the next feature, and track cost so the case grows stronger.
- **"How do you decide when a rewrite is justified?"** Rarely. Only when incremental change costs more than replacement and you can migrate in steps.
- **"How do you stop new debt from building up?"** Definition of done, lint rules, ADRs, and capacity for health work.
- **"When have you deliberately taken on debt?"** A good example is a launch where you shipped with a known shortcut and a ticket with a date to fix it.
- **"How do you prioritise debt across several teams?"** Shared scoring by cost and blast radius, and a platform team for cross-cutting items.
