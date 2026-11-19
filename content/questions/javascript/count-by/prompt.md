Implement `countBy(array, iteratee)`. It runs every element of `array` through `iteratee` to get a key, and returns an object that maps each key to the **number of elements** that produced it.

```js
countBy([6.1, 4.2, 6.3], Math.floor); // { '4': 1, '6': 2 }
countBy(['one', 'two', 'three'], 'length'); // { '3': 2, '5': 1 }

const orders = [
  { id: 1, status: 'paid' },
  { id: 2, status: 'pending' },
  { id: 3, status: 'paid' },
];
countBy(orders, (o) => o.status); // { paid: 2, pending: 1 }
```

## Requirements

- `iteratee` is either:
  - a **function**, called with the element only (`iteratee(element)`), or
  - a **string**, in which case the key is the element's property with that name (`element[iteratee]`).
- Keys are object keys, so they are converted to strings (`4` becomes `'4'`, `undefined` becomes `'undefined'`).
- Only keys that occur appear in the result. Every count is at least `1`.
- An empty array returns `{}`.
- Keys such as `'constructor'` or `'toString'` must be counted correctly, starting from `1`. They must not collide with properties inherited from `Object.prototype`.

## Follow-up

- How would you return a `Map` instead, so keys keep their original type?
- What changes if you need to sum a field (for example total revenue per status) instead of counting?
