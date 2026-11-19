A news site's homepage is a single column of ad slots. Each slot `i` would earn `revenue[i]` if filled, but the design team forbids ads in **two adjacent slots** (it feels spammy). Write `maxRevenue(revenue)`, which returns the highest total revenue achievable by filling some set of non-adjacent slots.

> This is the classic "house robber" problem: you can't rob two houses next to each other.

```js
maxRevenue([4, 1, 2, 9, 1]);    // 13  (slots 0 and 3: 4 + 9)
maxRevenue([5, 1, 1, 5]);       // 10  (slots 0 and 3)
maxRevenue([2, 7, 9, 3, 1]);    // 12  (slots 0, 2 and 4: 2 + 9 + 1)
maxRevenue([]);                 // 0
maxRevenue([6]);                // 6
```

## Constraints

- Up to 10⁵ slots; every revenue is a non-negative integer.
- Trying every subset is exponential. Aim for O(n) time and O(1) space.

## Follow-up

- Which slots should be filled? Return the indices too.
- What if the slots were arranged in a **circle** (a carousel), so the first and last are adjacent?
