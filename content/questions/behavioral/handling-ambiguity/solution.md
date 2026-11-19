## How to structure your answer

Use **STAR-L**, and make the Action show a loop: **frame, assume, test, narrow**.

1. **Situation**: the vague goal, who gave it, and why it was ambiguous.
2. **Task**: what you decided to own, including the task of defining the problem.
3. **Action**: how you framed it, which assumptions you wrote down, the cheapest ways you tested them, and how you got agreement on scope.
4. **Result**: what shipped and the measured outcome.
5. **Learning**: how you approach ambiguity now.

Show you were comfortable moving without full certainty, but not reckless.

## Model answer

**Situation.** At a property management SaaS company, our CEO came back from customer visits and told the product group: "Landlords say our app is too hard on mobile. Fix mobile." There was no spec, no metric, and it was not clear whether that meant our responsive web app, a native app or something else. I was the senior front-end engineer on the landlord dashboard team, and my manager asked me to figure out what this meant.

**Task.** I took ownership of turning the request into a plan the leadership team could approve within three weeks.

**Action.** I started by framing questions instead of solutions: who uses us on mobile, for which tasks, and where do they fail? Our analytics showed 38% of landlord sessions were on phones, but mobile users completed only 22% of the tasks they started, compared with 61% on desktop. That gave me a measurable problem.

I wrote a one-page doc listing my assumptions explicitly: that a native app was not needed, that most mobile tasks were a small set of quick actions, and that our layout, not performance, was the main issue. I shared it with the PM, designer and CEO, and asked them to tell me which assumptions they disagreed with. The CEO challenged the native-app one, so we agreed to test it.

To test assumptions cheaply, I worked with the designer on five remote sessions with landlords and looked at session replays with personal data masked. Four of the top five mobile tasks were quick actions: approving maintenance requests, messaging tenants, checking rent status. The failures were dense tables that did not fit small screens and modals that trapped scroll on iOS. Performance was fine. None of the five landlords asked for an app store app, though two wanted push notifications.

From that, I proposed a narrow scope: a mobile-first "today" view for the top four tasks, responsive card layouts replacing the worst tables, and web push notifications via the PWA install path, which also answered the CEO's native-app question. We shipped in two-week increments behind a flag and set one success metric: mobile task completion rate.

**Result.** In ten weeks, mobile task completion rose from 22% to 49%. Maintenance requests were approved a median of 5 hours faster, and push notifications reached 31% of active landlords. Leadership dropped the native app idea, saving an estimated two engineer-quarters.

**Learning.** Writing assumptions down and inviting people to attack them turned a vague demand into a shared plan quickly. I now do this at the start of every unclear project.

## Why this answer works

- **Turns vagueness into a metric**: task completion rate on mobile vs desktop.
- **Explicit, testable assumptions** shared with stakeholders, including the CEO.
- **Cheap learning first**: analytics, interviews, session replays before building.
- **Narrow, incremental scope** with a clear success metric.
- **Handles the senior stakeholder respectfully** by testing their idea rather than dismissing it.
- **Big outcome**, including a costly project avoided.

## Red flags to avoid

- Waiting for a spec, or complaining that requirements were unclear.
- Building the first idea immediately without checking it solved the problem.
- Making assumptions silently and being surprised later.
- Turning ambiguity into endless research with nothing shipped.
- Ignoring the senior person's suggestion, or following it blindly.
- No definition of success, so nobody could say whether it worked.

## Likely follow-up probes

- **"What if the research had shown a native app was needed?"** Explain that you would have presented that honestly with a cost estimate; the goal was the right answer, not your preferred one.
- **"How did you handle privacy in session replays?"** Masking inputs and personal data by default, limited retention and access controls.
- **"How do you decide when you have enough information?"** When the remaining uncertainty is cheaper to resolve by shipping a small increment than by more research.
- **"How did you keep stakeholders updated?"** Weekly short updates and a demo every two weeks.
- **"What if requirements had changed halfway?"** Revisit the assumptions doc, check against the success metric, and adjust the next increment rather than the whole plan.
