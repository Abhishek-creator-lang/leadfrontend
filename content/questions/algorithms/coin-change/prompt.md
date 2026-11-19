An API platform sells usage credits in fixed pack sizes, for example packs of 1, 5 and 12 credits. A customer wants **exactly** `amount` credits and the checkout should suggest the fewest packs. Write `minPacks(packSizes, amount)`, which returns that minimum number of packs, or `-1` if no combination adds up exactly.

Any pack size can be bought any number of times.

```js
minPacks([1, 5, 12], 15); // 3   (5 + 5 + 5), even though greedy would pick 12 + 1 + 1 + 1
minPacks([4, 6], 7);      // -1  (only even totals are possible)
minPacks([3], 0);         // 0   (nothing to buy)
minPacks([2, 7], 11);     // 3   (7 + 2 + 2)
```

## Constraints

- `1 ≤ packSizes.length ≤ 20`; sizes are distinct positive integers.
- `0 ≤ amount ≤ 10⁴`.
- Exploring every combination recursively is exponential; aim for O(amount × packSizes.length).

## Follow-up

- Return the actual packs, not just the count.
- Count the number of *different* combinations that reach `amount`.
