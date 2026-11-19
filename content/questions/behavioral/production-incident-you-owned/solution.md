## How to structure your answer

Use **STAR-L**, with the Action following the incident timeline:

1. **Detect**: how you found out and how long it took (and whether that was good enough).
2. **Mitigate**: stop the bleeding first, usually a rollback or flag flip.
3. **Communicate**: who you told, how often.
4. **Diagnose**: root cause, with enough technical detail to be credible.
5. **Prevent**: postmortem actions that fix the class of problem.

Give approximate timestamps; they make the story concrete and show you think in terms of time to detect and time to mitigate.

## Model answer

**Situation.** I was the front-end lead for a consumer banking web app. One Friday afternoon we deployed a release that included a dependency upgrade and a refactor of our login flow. About 40 minutes later, our customer support lead posted in Slack that calls about "the login button doing nothing" were spiking.

**Task.** I was the on-call lead for web that week, so I took the incident commander role.

**Action.** At minute zero I opened an incident channel, paged the engineer who wrote the login refactor, and posted a first status for support: "We're aware of login issues on web, investigating, next update in 15 minutes."

Our error tracker showed nothing unusual, which was confusing. But RUM data split by browser showed the login success rate on Safari 15 and older had dropped from about 97 percent to near zero, about 8 percent of our sessions. Other browsers were fine.

At minute 12 I decided to roll back rather than debug live, since we had a one-click rollback to the previous build on our CDN. By minute 20 Safari login rates were recovering. I updated support and our status page.

Then we looked for the root cause calmly. The upgraded dependency had shipped code using `Array.prototype.at()`, which older Safari versions did not support. Our Babel config transpiled syntax but we relied on a browserslist-based polyfill setup that did not include that dependency, because we excluded `node_modules` from transpilation. The error was thrown inside a promise in the click handler, and our global error handler did not capture unhandled rejections in that path, which is why the error tracker stayed quiet.

**Result.** Total customer impact was about 60 minutes, with roughly 2,300 failed login attempts. I ran a blameless postmortem on Monday. Actions, which I owned or assigned with dates: add `unhandledrejection` reporting to our error tracker; run our end-to-end login test on the oldest supported Safari in CI using a cloud browser grid; add a build step that checks the output bundle against our browserslist targets with an ES-compatibility linter; and alert automatically on per-browser drops in login success rate. Within a month, the bundle check caught two more incompatible dependencies before release. Time to detect for similar issues went from 40 minutes to under 5 with the new alert.

**Learning.** Our monitoring was built around errors, but the most important signal was a business metric: successful logins. I now push for alerts on key user journeys segmented by browser and device, not just on error counts.

## Why this answer works

- **Mitigate first**: rolled back at minute 12 instead of debugging live.
- **Structured communication**: a status cadence for support and a status page.
- **Credible technical root cause**: untranspiled dependency, missing polyfill, unhandled rejection not reported.
- **Explains the detection gap**, which is often the most important lesson.
- **Systemic fixes**: CI on old browsers, a bundle compatibility check, rejection reporting, journey alerts.
- **Blameless**: no mention of who wrote the bug; the system allowed it.

## Red flags to avoid

- Blaming the engineer who shipped the change.
- Heroic all-night debugging while users stayed broken.
- No communication to support or stakeholders during the incident.
- A postmortem with only "be more careful" as the action.
- Vague technical detail ("there was a bug in the code").

## Likely follow-up probes

- **"Why not just hotfix forward?"** Rollback is faster and lower risk when the previous version is known good; fix forward when rollback is impossible, for example after a data migration.
- **"How do you run a blameless postmortem?"** Timeline, contributing factors, focus on why the system allowed it, actions with owners and dates.
- **"How do you make sure postmortem actions actually get done?"** Track them in the backlog with owners, review them in a weekly ops meeting.
- **"Should you deploy on Friday afternoon?"** Discuss deploy confidence, progressive rollout and good observability rather than a blanket rule.
- **"How would canary releases have helped?"** A 5 percent rollout with per-browser success metrics would have limited impact and caught it sooner.
