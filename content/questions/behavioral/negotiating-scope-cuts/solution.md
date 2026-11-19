## How to structure your answer

Use **STAR**, with the Action focused on *how* you negotiated.

1. **Situation**: the feature, the constraint (time, people, risk) and why the original scope did not fit.
2. **Task**: your role in the decision.
3. **Action**: how you broke the scope down, the data you used, the options you offered, and how you handled the disagreement.
4. **Result**: what shipped, how it performed, and what happened to the cut items.

Show that the negotiation made the product better, not just smaller.

## Model answer

**Situation.** I was the lead front-end engineer on search for a second-hand marketplace. Product and design had a new search results experience planned for a spring campaign: faceted filters with live counts, a map view, saved searches with alerts, infinite scroll and a redesigned listing card. We had eight weeks and three front-end engineers. My breakdown came to roughly fourteen weeks.

**Task.** I needed to get to a plan we could actually ship for the campaign while keeping the partnership with our PM and designer intact. They had already shown the full design to the marketing team.

**Action.** I did not open with "we can't". I first broke the design into eleven slices, each estimated in days, and put them on one page with three columns: user value, effort and risk. For user value I pulled data: 71% of searches used at most two filters, the existing map toggle was used in under 3% of sessions, and saved-search requests were a top-five support theme.

Then I booked an hour with the PM and designer and asked them to rank the slices before I showed my estimates. Their ranking was close to the data, which made the conversation much easier. We agreed on three options: ship everything late, ship a core on time, or ship the core plus saved searches with one extra engineer borrowed for four weeks.

The hard disagreement was the map view; the designer saw it as the signature feature. I suggested we keep it behind a feature flag and launch it to 10% of users after the campaign, so we could measure engagement instead of arguing about it. I also proposed replacing infinite scroll with a "load more" button, which is cheaper and easier to make accessible and keeps the footer reachable.

**Result.** We picked option three. We shipped faceted filters, the new listing card, "load more" and saved searches in seven and a half weeks. Searches leading to a listing view rose by 12%, and saved-search alerts brought back 8% of weekly active buyers. The map shipped four weeks later at 10%; it moved no metric, so we kept it as an optional toggle and never expanded it. The designer later told me the ranking exercise was something she wanted to reuse with other teams.

## Why this answer works

- **Data-driven cuts**: usage numbers, not personal preference, decided what moved out.
- **Partners rank first**: asking product and design to prioritise before seeing estimates builds shared ownership.
- **Options instead of "no"**: three concrete plans with different costs.
- **Experiments settle disagreements**: the feature flag turned an opinion fight into a measurement.
- **Technical judgement in the cut**: "load more" over infinite scroll is cheaper and better for accessibility.
- **Follow-through**: the cut items had a real outcome, and one was proven not to matter.

## Red flags to avoid

- Cutting scope unilaterally, or presenting the cut as something you "won" against product.
- Treating quality (tests, accessibility, error states) as the first thing to cut.
- No data, only engineering effort.
- Cut items that disappeared without anyone telling stakeholders.
- Damaging the relationship and not noticing.

## Likely follow-up probes

- **"What if the PM had insisted on everything?"** Explain escalating with a written trade-off (date vs scope vs people) to the person who owns the date, and accepting their decision.
- **"How confident were you in the fourteen-week estimate?"** Talk about ranges, spikes for unknowns like live facet counts, and how confidence affects the conversation.
- **"How do you stop scope creeping back in during the project?"** A change log, a swap rule ("something in, something out") and a weekly review.
- **"Have you ever cut the wrong thing?"** Have a short example where a cut item turned out to matter, and how you recovered.
- **"How do you handle cuts that affect another team?"** Bring them into the ranking early and agree on the contract before you cut.
