A checkout page offers a "spend exactly your gift card" suggestion: pick two items from the cart whose prices add up to the card's balance. Write `twoSum(prices, target)`, which returns the indices `[i, j]` (with `i < j`) of the two prices that sum to `target`.

Prices are integers in cents. Each input has **exactly one** valid pair, and an item can't be used twice.

```js
twoSum([1299, 450, 2500, 850], 2149); // [0, 3]   (1299 + 850)
twoSum([500, 500, 120], 1000);         // [0, 1]   (two different items with the same price)
twoSum([-200, 700, 300], 100);         // [0, 2]   (a discount line can be negative)
```

## Constraints

- `2 ≤ prices.length ≤ 10⁵`.
- Aim for **O(n)** time. The nested-loop solution is too slow for the largest inputs.
- Don't sort the input, because you have to return the original indices.

## Follow-up

- What if the array were already sorted? Can you do it in O(1) extra space?
- How would you return *all* distinct pairs, or handle "three items" (3Sum)?
