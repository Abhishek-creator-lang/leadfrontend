Feature flags let teams ship code dark, turn it on for staff or a country, and ramp it up to a percentage of users. Implement the evaluator that decides what one user gets.

```js
const flag = {
  key: 'new-checkout',
  enabled: true,
  defaultValue: false,
  rules: [
    { conditions: [{ attribute: 'email', operator: 'contains', value: '@acme.com' }], value: true },
    { conditions: [{ attribute: 'country', operator: 'in', value: ['DE', 'FR'] }], value: false },
  ],
  rollout: { percentage: 20, value: true },
};

evaluateFlag(flag, { userId: 'u_1', email: 'dev@acme.com' }); // true  (rule 1)
evaluateFlag(flag, { userId: 'u_2', country: 'DE' });         // false (rule 2)
evaluateFlag(flag, { userId: 'u_3', country: 'IN' });         // true for ~20% of user ids, always the same answer for u_3
```

## `bucket(seed, id)` (named export)

Returns a stable integer in `[0, 100)`: the **32-bit FNV-1a** hash of the string `` `${seed}:${id}` `` (over its UTF-16 code units), as an unsigned integer, modulo 100.

FNV-1a: start with `hash = 0x811c9dc5`; for each code unit, `hash ^= code`, then `hash = hash * 0x01000193` (32-bit multiplication, see `Math.imul`). Finish with `hash >>> 0`.

## `evaluateFlag(flag, context = {})` (default export)

Evaluate in this order and return the first applicable value:

1. **Kill switch.** If `flag.enabled` is falsy, return `flag.offValue` (default `false`).
2. **Rules,** in order. A rule applies if **all** its conditions match; return its `value`.
3. **Rollout.** If `flag.rollout` exists, read the id from `context[rollout.bucketBy ?? 'userId']`. If the id is present and `bucket(flag.key, String(id)) < rollout.percentage`, return `rollout.value`.
4. Otherwise return `flag.defaultValue` (default `false`).

### Conditions

`{ attribute, operator, value }` compares `context[attribute]` (the actual value) with `value`:

| Operator | Matches when |
|---|---|
| `eq` / `neq` | `actual === value` / `actual !== value` |
| `in` / `notIn` | `value` (an array) includes / doesn't include `actual` |
| `gt`, `gte`, `lt`, `lte` | Numeric comparison `actual > value` etc. |
| `contains` | `actual` is a string that includes `value` |

- If the attribute is **missing** (`undefined` or `null`), the condition does **not** match, for every operator including `neq` and `notIn`.
- An unknown operator throws an `Error` that names it.

## Follow-up

- Why hash `flagKey:userId` instead of just `userId`?
- Why is `Math.random()` unacceptable for rollouts?
- Where should flags be evaluated: client, server or edge? What about flicker on first render?
