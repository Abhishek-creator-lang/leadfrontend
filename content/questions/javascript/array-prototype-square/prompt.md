Add a method `square()` to **all arrays**. Calling `arr.square()` returns a new array where every element is multiplied by itself. The original array is left unchanged.

The starter defines the function, attaches it to `Array.prototype`, and default-exports it. You fill in the body.

```js
[1, 2, 3].square(); // [1, 4, 9]
[-2, 0.5].square(); // [4, 0.25]
[].square(); // []
['3'].square(); // [9] (normal `*` coercion applies)
```

## Requirements

- Return a **new** array with the same length. Do not mutate `this`.
- Use the `*` operator semantics, so numeric strings are coerced and non-numeric values give `NaN`.
- Keep holes: `[1, , 3].square()` has length 3 and no element at index 1, like `map` would produce.
- The method must work when the array is `this`, so think about which kind of function you define.

## Follow-up

- Why is adding methods to built-in prototypes usually discouraged in application code?
- If you had to ship it anyway, how would you make it safer?
