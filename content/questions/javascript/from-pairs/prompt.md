Implement `fromPairs(pairs)` without using `Object.fromEntries`. It takes an array of `[key, value]` pairs and returns a plain object with one property per pair.

```js
fromPairs([
  ['a', 1],
  ['b', 2],
]); // { a: 1, b: 2 }

fromPairs([]); // {}

fromPairs([
  ['x', 1],
  ['x', 2],
]); // { x: 2 }  (later pairs win)

fromPairs([[1, 'one']]); // { '1': 'one' }
```

## Requirements

- Return a **new plain object** (its prototype is `Object.prototype`).
- Keys are used as object property keys: strings stay strings, symbols stay symbols, anything else is converted to a string.
- When the same key appears more than once, the **last** pair wins.
- A pair with a missing value (`['k']`) produces `{ k: undefined }`, and the key is present.
- Keys such as `'constructor'` or `'hasOwnProperty'` are set as own properties like any other key.

## Follow-up

- How is this related to `Object.entries`? Is `fromPairs(Object.entries(obj))` always equal to `obj`?
- When would you build a `Map` from the pairs instead of an object?
