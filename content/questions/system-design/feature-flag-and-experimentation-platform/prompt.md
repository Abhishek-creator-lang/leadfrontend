Design an internal **feature-flag and experimentation platform** for a consumer company with:

- **30 teams**, web (React, server-rendered with Next.js), iOS, Android and back-end services.
- **20 million** monthly active users, peaks of **50k requests per second** to the web tier.
- Product managers who want to run **A/B tests** with reliable metrics, and engineers who want to **decouple deploy from
  release** (kill switches, percentage rollouts, beta cohorts).

Cover how flags are defined and targeted, how SDKs evaluate them (client and server), how changes propagate, how
experiment exposures are logged and analysed, how you avoid flicker in the UI, and how you keep thousands of flags from
turning into permanent technical debt.

The interviewer may ask you to compare building this with LaunchDarkly, Statsig, Optimizely, Unleash or GrowthBook, and
to discuss what happens when the flag service is down.
