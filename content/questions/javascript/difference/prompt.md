Implement `difference(array, ...others)`. It returns a new array with the elements of `array` that are **not** present in any of the `others` arrays. Order is taken from `array`.

```js
difference([1, 2, 3, 4], [2, 4]); // [1, 3]
difference([1, 2, 3, 4, 5], [1], [5, 6]); // [2, 3, 4]
difference(['a', 'b'], []); // ['a', 'b']
difference([NaN, 1], [NaN]); // [1]
difference([1, 1, 2], [2]); // [1, 1]
```

## Requirements

- Accept any number of exclusion arrays (zero or more).
- Compare with **SameValueZero** (the rule `Set` and `includes` use): `NaN` matches `NaN`, and `0` matches `-0`. Objects match only by reference.
- Duplicates in `array` that are not excluded are **kept** (this is not a set operation on `array` itself).
- Return a new array. Don't mutate any argument.
- Aim for better than O(n × m) time.

## Follow-up

- How would you add a `differenceBy(array, values, iteratee)` that compares by a derived key, such as `id`?
- When is the naive `includes` version actually faster than building a `Set`?
