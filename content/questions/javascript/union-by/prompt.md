Implement `unionBy(...arrays, iteratee)`. It combines all the arrays, in order, into a single array of unique elements. Two elements count as duplicates when `iteratee` returns the same key for both. The **last** argument is always the iteratee.

```js
unionBy([2.1], [1.2, 2.3], Math.floor); // [2.1, 1.2]

unionBy([{ x: 1 }], [{ x: 2 }, { x: 1 }], 'x'); // [{ x: 1 }, { x: 2 }]

const cached = [{ id: 1, name: 'Ada (cached)' }, { id: 2, name: 'Bo' }];
const fresh = [{ id: 1, name: 'Ada' }, { id: 3, name: 'Cy' }];
unionBy(cached, fresh, (u) => u.id);
// [{ id: 1, name: 'Ada (cached)' }, { id: 2, name: 'Bo' }, { id: 3, name: 'Cy' }]
```

## Requirements

- The last argument is the iteratee. It is either a function called as `iteratee(element)`, or a string meaning `element[iteratee]`. Every earlier argument is an array.
- When several elements share a key, keep the **first** one encountered (scanning the arrays left to right, each from start to end). Return the original elements, not the keys.
- Compare keys with **SameValueZero**: keys are *not* converted to strings, so `1` and `'1'` are different keys, and `NaN` equals `NaN`.
- The result order is the order in which each kept element was first encountered.
- Duplicates *within* a single array are removed too.
- With only an iteratee and no arrays, return `[]`. Don't mutate any input.

## Follow-up

- Why does lodash put the iteratee last? What does that cost in terms of the function signature and TypeScript types?
- In the example, the stale cached user wins. How would you make the **fresh** data win instead?
