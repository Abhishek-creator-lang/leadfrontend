Implement `groupBy(array, iteratee)`. It runs every element of `array` through `iteratee` to get a key and returns an object that maps each key to an **array of the elements** that produced it, in their original order.

```js
groupBy([6.1, 4.2, 6.3], Math.floor);
// { '4': [4.2], '6': [6.1, 6.3] }

groupBy(['one', 'two', 'three'], 'length');
// { '3': ['one', 'two'], '5': ['three'] }

const tasks = [
  { id: 1, owner: 'ana', done: false },
  { id: 2, owner: 'ben', done: true },
  { id: 3, owner: 'ana', done: true },
];
groupBy(tasks, (t) => t.owner);
// { ana: [{ id: 1, … }, { id: 3, … }], ben: [{ id: 2, … }] }
```

## Requirements

- `iteratee` is either:
  - a **function**, called with the element only (`iteratee(element)`), or
  - a **string**, in which case the key is `element[iteratee]`.
- Keys are converted to strings (`4` becomes `'4'`, `undefined` becomes `'undefined'`).
- Elements in each group keep their original relative order, and are the **same references** as in the input (no cloning).
- Only keys that occur appear in the result. An empty array returns `{}`.
- Keys such as `'constructor'`, `'toString'` or `'hasOwnProperty'` must produce normal groups. They must not collide with properties inherited from `Object.prototype`.
- Don't use `Object.groupBy` or `Map.groupBy`.

## Follow-up

- ES2024 added `Object.groupBy` and `Map.groupBy`. What does `Object.groupBy` return that's different from a normal `{}`, and why?
- How would you group by more than one level (for example by owner, then by status)?
- In a React list with thousands of rows, where would you run `groupBy` so it doesn't run on every render?
