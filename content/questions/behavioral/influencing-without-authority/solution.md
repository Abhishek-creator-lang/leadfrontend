## How to structure your answer

Use **STAR-L**, and in the Action section walk through an adoption sequence:

1. **Understand**: why others were not doing it already (cost, priorities, fear).
2. **Prove**: a pilot with numbers that matter to the other teams.
3. **Make it easy**: tooling, docs, pairing, doing the first piece of work for them.
4. **Build momentum**: champions, visible metrics, a sponsor for the last holdouts.

Close with adoption numbers and what happened after you stepped back.

## Model answer

**Situation.** I was a senior front-end engineer on the platform team at a company with nine product teams shipping into one large React app. Our error tracking showed that roughly 40 percent of production front-end errors came from unhandled API response shapes: fields that were null, renamed or missing. Each team wrote its own fetch wrappers with hand-typed TypeScript interfaces that drifted from the backend.

**Task.** I wanted every team to generate API types and clients from our OpenAPI specs and validate responses at runtime in development. I had no authority over the product teams, and their roadmaps were full.

**Action.** I started by talking to tech leads on four teams. The common objections were "we don't have time for a migration" and "generated code is ugly and hard to debug". So I designed for those objections.

I built a small generator on top of openapi-typescript that produced typed hooks matching the patterns teams already used, plus a dev-only Zod validation layer that logged mismatches to the console and to Sentry with the endpoint name. Then I migrated my own team's most error-prone area first. Within a month, that area's API-shape errors dropped by about 80 percent, and the dev-mode warnings caught two backend breaking changes before they reached production.

I presented those numbers at the front-end guild, framed around what teams cared about: fewer pages at night and fewer bug tickets, not type purity. I wrote a codemod that converted the most common hand-written fetch patterns and offered "migration office hours" twice a week. Two tech leads volunteered as early adopters, and I paired with an engineer from each team on their first endpoint so they would own it after.

I also added a dashboard showing errors per team caused by response-shape mismatches. I did not shame anyone with it; I shared it privately with each lead and offered help.

For the last two teams, the blocker was roadmap priority, not willingness. I worked with my director to get a two-week platform-quality slot added to the next quarterly plan for every team, which gave them permission.

**Result.** After about five months, eight of nine teams had adopted the generated clients for over 90 percent of their endpoints. API-shape errors in production fell by about 65 percent overall. The backend teams started running the generator in their CI to catch breaking spec changes, which I had not even planned. The two early adopters now maintain the generator with me.

**Learning.** I learned to treat adoption as a product: research the users, reduce friction, show value in their terms, and only use top-down pressure for priority conflicts, not for convincing people.

## Why this answer works

- **Starts by listening**: the solution was shaped by other teams' objections.
- **Proves value first**: a pilot on their own team with clear numbers.
- **Removes friction**: codemod, matching existing patterns, office hours, pairing.
- **Builds ownership**: early adopters became co-maintainers.
- **Uses escalation correctly**: only to resolve a priority conflict, not to force agreement.
- **Measurable adoption**: eight of nine teams, 90 percent of endpoints, 65 percent fewer errors.

## Red flags to avoid

- "I got my VP to mandate it" as the main mechanism.
- Blaming other teams for being slow or resistant.
- A tool that you built and announced, with no evidence of real adoption.
- Using metrics to shame teams publicly.
- Leaving out what happened to holdouts.

## Likely follow-up probes

- **"What about teams that refused?"** Understand why; sometimes a team has a legitimate reason to differ, and an exception is fine if it is documented.
- **"How did you keep it maintained after the push?"** Shared ownership, a CODEOWNERS entry, and a roadmap for the tool.
- **"How do you choose which battles to fight across teams?"** Pick problems with measurable, shared pain; avoid style preferences.
- **"What if your own manager didn't see it as a priority?"** Show how the work connects to reliability goals and start small within your own team's time.
- **"How do you know they adopted it because it was useful, not because of pressure?"** Look at voluntary contributions and teams extending it themselves.
