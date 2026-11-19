Your QA team wants to test the app under **every combination** of a handful of feature flags being switched on. Write `subsets(flags)`, which returns every subset of `flags`, including the empty set (all flags off) and the full set (all on).

All flags are **distinct**.

```js
subsets(['darkMode', 'beta', 'newNav']);
// [
//   [],
//   ['darkMode'], ['beta'], ['newNav'],
//   ['darkMode', 'beta'], ['darkMode', 'newNav'], ['beta', 'newNav'],
//   ['darkMode', 'beta', 'newNav'],
// ]

subsets([]); // [[]]
```

## Requirements

- Each subset appears exactly once.
- The order of the subsets, and of items **within** a subset, doesn't matter.
- Don't mutate `flags`.

## Constraints

- `0 ≤ flags.length ≤ 16` (2¹⁶ = 65,536 subsets).

## Follow-up

- How would you handle duplicate items (`['a', 'a', 'b']`) without returning duplicate subsets?
- Only return subsets of exactly size k.
