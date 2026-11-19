A layout tool snaps component heights to a spacing scale, for example `[4, 8, 12]` pixels. To fill a gap of exactly `target` pixels, a designer can stack spacers of any of those sizes, **reusing a size as often as needed**. Write `combinationSum(sizes, target)`, which lists every distinct way to do it.

Two ways that use the same sizes the same number of times count as the **same** combination, whatever the order.

```js
combinationSum([4, 8, 12], 16);
// [[4, 4, 4, 4], [4, 4, 8], [4, 12], [8, 8]]

combinationSum([3, 5], 11); // [[3, 3, 5]]
combinationSum([6], 4);     // []
combinationSum([5, 2], 0);  // [[]] (an empty stack fills a zero gap)
```

## Requirements

- `sizes` are distinct positive integers, in any order.
- The order of combinations, and of values inside each, doesn't matter.
- No duplicate combinations (`[4, 8]` and `[8, 4]` are the same).

## Constraints

- `1 ≤ sizes.length ≤ 30`, each size `≥ 2`, `0 ≤ target ≤ 60`.
- Prune branches that can't succeed.

## Follow-up

- What if each size could be used **at most once**, and `sizes` might contain duplicates?
- If you only need the **number** of combinations, what's a faster approach?
