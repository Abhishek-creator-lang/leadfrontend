When a list is re-ordered, a virtual-DOM diff wants to move as few items as possible. The items that can **stay where they are** form the longest subsequence whose old positions are still in increasing order. Everything else has to move.

Write `lisLength(values)`, which returns the length of the longest **strictly increasing subsequence** of `values`. A subsequence keeps the original order but may skip elements.

```js
lisLength([3, 1, 4, 1, 5, 9, 2, 6]); // 4  (e.g. 1, 4, 5, 9 or 1, 4, 5, 6)
lisLength([5, 4, 3, 2]);             // 1
lisLength([2, 2, 2]);                // 1  (strictly increasing, so equal values don't extend)
lisLength([]);                       // 0
lisLength([0, 8, 4, 12, 2, 10, 6, 14, 1, 9]); // 4
```

## Constraints

- Up to 10⁵ values (integers, possibly negative).
- Checking every subsequence is exponential. An O(n²) DP is acceptable as a first step, but the largest tests need **O(n log n)**.

## Follow-up

- Return one actual longest subsequence, not just its length.
- Where does this show up in real front-end code? (Hint: Vue 3's keyed-children diff.)
