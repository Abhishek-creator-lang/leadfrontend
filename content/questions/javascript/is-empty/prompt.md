Implement `isEmpty(value)`. "Empty" means different things for different types, so the rules are listed below. Follow them exactly.

```js
isEmpty(null); // true
isEmpty(''); // true
isEmpty('abc'); // false
isEmpty([]); // true
isEmpty([undefined]); // false  (length is 1)
isEmpty({}); // true
isEmpty({ a: undefined }); // false (it has a key)
isEmpty(new Map()); // true
isEmpty(new Set([1])); // false
isEmpty(0); // true   (numbers have no contents)
isEmpty(true); // true
```

## Rules

| Value | Empty when |
|---|---|
| `null`, `undefined` | always |
| strings | `length === 0` (`' '` is **not** empty) |
| arrays, typed arrays, `arguments` objects | `length === 0` |
| `Map`, `Set` | `size === 0` |
| any other object (plain objects, class instances, `Date`, functions, `Object.create(null)` objects) | it has no **own enumerable string keys** |
| numbers, booleans, symbols, bigints | always (they're not collections) |

- Inherited properties don't count: an object whose prototype has keys, but which has no own keys, is empty.
- Non-enumerable own properties and symbol keys don't count.

## Follow-up

- `isEmpty(0)` and `isEmpty(42)` are both `true`. Is that a sensible API? What would you do instead in application code?
- Why is `JSON.stringify(obj) === '{}'` a poor emptiness check?
