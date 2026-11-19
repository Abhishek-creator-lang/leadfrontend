Implement `mean(array)`. It returns the arithmetic mean (average) of the numbers in `array`.

```js
mean([4, 2, 8, 6]); // 5
mean([1, 2]); // 1.5
mean([-3, 3]); // 0
mean([7]); // 7
mean([]); // NaN
```

## Requirements

- The array contains only numbers.
- The mean is the sum divided by the number of elements.
- An empty array returns `NaN` (there is no meaningful average, and `0 / 0` is `NaN`).
- If any element is `NaN`, the result is `NaN`. Don't skip it.
- Don't mutate the input.

## Follow-up

- `mean([0.1, 0.2, 0.3])` doesn't print exactly `0.2`. Why, and does it matter?
- How would you keep a running average over a stream of numbers without storing them all?
- When would you report the median instead of the mean (for example, page load times)?
