A usability study wants to show dashboard widgets to participants in **every possible order** to cancel out ordering bias. Write `permutations(items)`, which returns all orderings of `items`.

All items are **distinct**.

```js
permutations(['chart', 'table', 'map']);
// [
//   ['chart', 'table', 'map'],
//   ['chart', 'map', 'table'],
//   ['table', 'chart', 'map'],
//   ['table', 'map', 'chart'],
//   ['map', 'chart', 'table'],
//   ['map', 'table', 'chart'],
// ]

permutations([1]); // [[1]]
permutations([]);  // [[]] (one ordering of nothing)
```

## Requirements

- Return each permutation exactly once, as a new array.
- The order of the permutations in the result **doesn't matter**.
- Don't mutate `items`.

## Constraints

- `0 ≤ items.length ≤ 8` (8! = 40,320 permutations).

## Follow-up

- What changes if `items` can contain duplicates and you must not return duplicate orderings?
- How would you produce the *next* permutation in lexicographic order without generating them all?
