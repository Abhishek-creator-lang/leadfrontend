Implement `uniqueArray(array)`. It returns a new array with duplicates removed. Each value appears once, at the position of its **first** occurrence.

```js
uniqueArray([1, 2, 1, 3, 2]); // [1, 2, 3]
uniqueArray(['b', 'a', 'b']); // ['b', 'a']
uniqueArray([NaN, NaN, 0, -0]); // [NaN, 0]
uniqueArray([1, '1']); // [1, '1']   (different types are different values)

const a = { id: 1 };
uniqueArray([a, a, { id: 1 }]); // [a, { id: 1 }]  (objects by reference)
```

## Requirements

- Compare with **SameValueZero**: `NaN` equals `NaN`, `0` equals `-0`, and no type coercion (`1` and `'1'` are different). Objects and arrays are equal only if they're the same reference.
- Keep the first occurrence and the original relative order.
- Return a new array. Don't mutate the input.
- Aim for O(n) time.

## Follow-up

- Solve it **without** `Set`, `Map` or a lookup object. What's the complexity now? (This variant has been reported in real interviews.)
- If the array is already sorted, how can you do it in O(n) time and O(1) extra space?
- How would you de-duplicate a list of objects by `id`, keeping the **last** occurrence?
