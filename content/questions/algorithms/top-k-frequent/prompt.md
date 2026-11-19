An analytics widget shows the most-used emoji reactions in a chat. Write `topKFrequent(items, k)`, which returns the `k` values that occur **most often** in `items`.

```js
topKFrequent(['👍', '🎉', '👍', '❤️', '🎉', '👍', '😂'], 2);
// ['👍', '🎉']   (👍 ×3, 🎉 ×2)

topKFrequent([4, 4, 1, 1, 1, 9], 1); // [1]
topKFrequent([7], 1);                // [7]
```

## Requirements

- Items are strings or numbers, compared with `===`. A number `1` and a string `'1'` are different values.
- The answer is guaranteed to be **unique**: there's never a tie at the k-th place.
- Return the `k` values in **any order**.
- `1 ≤ k ≤` the number of distinct values.

## Constraints

- Up to 10⁵ items.
- Aim for better than O(n log n) when k is small compared with the number of distinct values.

## Follow-up

- How would you keep a live "top 3" while reactions stream in?
- What would you do if the stream were too large to count exactly?
