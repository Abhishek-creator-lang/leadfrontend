## Brute force

Check every pair:

```js
for (let i = 0; i < n; i++)
  for (let j = i + 1; j < n; j++)
    if (prices[i] + prices[j] === target) return [i, j];
```

O(n²) time and O(1) space. At 10⁵ items that's about 5 × 10⁹ additions, which takes too long.

## Optimal: one pass with a hash map

For each price `p` at index `j`, the partner we need is `target - p`. Instead of searching for it, **remember every price we've already seen** in a `Map` from value to index:

1. Compute `need = target - prices[j]`.
2. If `seen` has `need`, return `[seen.get(need), j]`. The earlier index comes first automatically.
3. Otherwise store `seen.set(prices[j], j)` and continue.

Checking **before** inserting is what stops an item pairing with itself (`target = 1000`, one item at 500). Duplicate prices still work: the first 500 is stored, and the second one finds it.

Why a `Map` rather than a plain object? Keys stay numbers (an object would coerce them to strings, which happens to work here but is a habit worth avoiding), and there's no prototype to collide with.

## Complexity

- **Time:** O(n). Each lookup and insert is O(1) on average.
- **Space:** O(n) for the map.

## Edge cases

- Same value used twice by two different items.
- Negative numbers and zero.
- The pair is the first two elements, or the last two.
- If no pair existed (not possible here), you'd return `null` or throw. Mention it.

## Talking through it in an interview

Say the brute force out loud with its complexity, then ask: "what am I repeatedly searching for?" That leads to the complement lookup. Write the six-line solution, then trace the duplicate case to show you've thought about self-pairing.

## Follow-ups

- **Sorted input:** two pointers at both ends. If the sum is too small, move left inward; if too big, move right inward. That's O(n) time and O(1) space.
- **All pairs / 3Sum:** sort, then for each element run the two-pointer scan on the rest, skipping duplicates. That's O(n²).
- **Floating-point prices:** never compare float sums with `===`. Work in integer cents, as the prompt does.
