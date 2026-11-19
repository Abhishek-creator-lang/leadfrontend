Implement `intersection(...arrays)`. It returns an array of the **unique** values that are present in **every** input array. The result is ordered by where each value first appears in the **first** array.

```js
intersection([1, 2, 3], [2, 3, 4], [3, 2, 9]); // [2, 3]
intersection(['a', 'b', 'a'], ['a']); // ['a']   (no duplicates in the result)
intersection([1, 2], [3, 4]); // []
intersection([NaN, 1], [NaN]); // [NaN]
intersection([1, 2, 2]); // [1, 2]   (a single array is just de-duplicated)
intersection(); // []
```

## Requirements

- Accept any number of arrays. With no arguments, return `[]`.
- Compare values with **SameValueZero** (the rule `Set` uses): `NaN` matches `NaN`, `0` matches `-0`, objects match by reference.
- The result has no duplicates and follows the order of the first array.
- Don't mutate any input. Don't use `Set.prototype.intersection`.
- Aim for roughly linear time in the total number of elements.

## Follow-up

- Which array would you choose to iterate, and which would you turn into sets, if one array has 10 elements and the others have a million?
- How would you write `intersectionBy(arrays, iteratee)` to intersect lists of objects by `id`?
