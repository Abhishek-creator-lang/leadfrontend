## Approach

The evaluator is a short decision pipeline. The interesting parts are **ordering**, **safe defaults** and **stable bucketing**.

```js
if (!flag.enabled) return offValue;                         // 1. kill switch beats everything
for (const rule of rules)                                    // 2. targeting, first match wins
  if (rule.conditions.every((c) => matches(c, context))) return rule.value;
if (rollout && id != null && bucket(flag.key, String(id)) < rollout.percentage)
  return rollout.value;                                      // 3. percentage rollout
return defaultValue;                                         // 4. fallback
```

### Why this order

- The **kill switch** must win over everything, so that during an incident one toggle turns the feature off for everyone, including staff targeted by rules.
- **Rules before rollout** lets you force a value for specific segments ("always on for employees", "never in the EU until legal signs off") regardless of the random-looking percentage.
- **First match wins** makes rule order meaningful and predictable, like firewall rules.

### Conditions

A lookup table of operator functions keeps `matches` tiny and makes adding operators trivial. An unknown operator **throws** rather than silently returning `false`: a typo like `"gte "` in a config should fail loudly in tests, not silently disable a feature.

Missing attributes never match. Consider `country neq "US"` for a user whose country is unknown: matching would roll the feature out to people you know nothing about, and in regulated contexts that's exactly the wrong failure mode. Requiring the attribute to be present makes rules opt-in.

## Stable bucketing

`Math.random() < 0.2` gives a different answer on every page load: the user sees the new checkout, refreshes, and it's gone. Bucketing must be a **pure function of the user**, so we hash.

- **FNV-1a** is a tiny, fast, non-cryptographic hash with good dispersion for short strings, easy to implement identically in every SDK (JS, Go, Swift...). `Math.imul` performs the 32-bit multiplication that plain `*` can't (doubles lose precision beyond 2^53), and `>>> 0` converts the result to unsigned.
- **`bucket < percentage`** makes rollouts **monotonic**: everyone in the 10% group stays in at 50%. Ramping up only adds users; nobody flips from on to off, which would be a terrible experience.
- **Seeding with the flag key** decorrelates flags. If you hashed only `userId`, the same 10% of users would be the guinea pigs for every experiment, and experiments would interfere with each other statistically.

`% 100` has a tiny modulo bias (2^32 isn't divisible by 100), which is negligible here. Production SDKs often bucket into 10,000 or 100,000 slots for finer-grained percentages like 0.5%.

## Complexity

O(R × C) for R rules with C conditions, plus O(length of the id) for the hash. Evaluation is pure and synchronous, so it can run during render without network calls.

## Edge cases

- `percentage: 0` gives nobody, `100` gives everybody (bucket is always < 100).
- Anonymous users (no id) are excluded from the rollout. A real SDK would generate and persist an anonymous id (cookie or `localStorage`) so they're stable too.
- `contains` on non-strings returns `false` rather than throwing.
- Numeric comparisons with strings coerce; a typed schema for attributes avoids surprises.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `Math.random()` for rollouts | Users flip between variants on every load |
| Hashing only the user id | The same users are in every experiment |
| `bucket > 100 - percentage` or re-hashing per percentage | Ramping up moves users in **and out** |
| Plain `*` for the FNV multiply | Precision loss gives different buckets on different platforms |
| Missing attributes treated as matches for `neq` | Feature leaks to unknown users |
| Rules evaluated before the kill switch | Can't turn the feature off in an incident |

## Real-world connection

- **LaunchDarkly, Statsig, Unleash, GrowthBook** all evaluate local rules plus a hashed percentage rollout. Unleash uses MurmurHash of `groupId:userId`; LaunchDarkly hashes `flagKey.salt.userKey`. OpenFeature standardises the client API (`getBooleanValue(flagKey, default, context)`).
- **Client vs server evaluation:** evaluating on the server (or at the edge) avoids shipping all rules to the browser (which can leak unreleased features) and prevents **flicker**, where the page renders the default and then swaps after the flag SDK loads. Common fixes: bootstrap evaluated flags into the HTML, or evaluate in middleware and render the right variant from the start.
- **Hygiene:** flags are tech debt. Teams track flag age and remove fully rolled-out flags.

## Follow-ups

- **Multivariate experiments:** split the bucket range into weighted variants (`A: 0–49`, `B: 50–99`) and log an exposure event when a variant is served.
- **Per-rule rollouts:** "20% of users in India".
- **Prerequisites:** a flag that only evaluates if another flag is on.
- **Sticky assignment:** persist the first assignment so changing rules mid-experiment doesn't reshuffle users.
