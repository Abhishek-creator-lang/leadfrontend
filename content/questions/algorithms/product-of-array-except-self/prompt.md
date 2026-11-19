A pricing tool applies a chain of multipliers (discounts, tax, currency conversion) to a basket. For a "what if we dropped this step?" view, it needs, for every step, the combined multiplier of **all the other steps**.

Write `productExceptSelf(factors)`, which returns an array `out` where `out[i]` is the product of every element of `factors` **except** `factors[i]`.

```js
productExceptSelf([2, 3, 4, 5]);   // [60, 40, 30, 24]
productExceptSelf([1, 0, 3, 4]);   // [0, 12, 0, 0]
productExceptSelf([0, 2, 0]);      // [0, 0, 0]
productExceptSelf([-1, 2, -3]);    // [-6, 3, -2]
productExceptSelf([9]);            // [1] (the product of nothing is 1)
```

## Constraints

- **Don't use division.** Dividing the total by `factors[i]` breaks when there are zeros.
- O(n) time. Up to 10⁵ elements.
- O(1) extra space, not counting the output array, is the stretch goal.
- Test values are integers chosen so every product fits safely in a JS number.
- Don't mutate the input.

## Follow-up

- If division *were* allowed, how would you handle zeros correctly?
- How does this relate to prefix sums?
