Implement `compact(array)`. It returns a new array containing only the **truthy** elements of `array`, in their original order.

```js
compact([0, 1, false, 2, '', 3, null]); // [1, 2, 3]
compact(['a', undefined, NaN, 'b']); // ['a', 'b']
compact([[], {}, '0', 'false']); // [[], {}, '0', 'false']
```

## Requirements

- Remove every falsy value: `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined` and `NaN`.
- Keep everything else, including values people often mistake for falsy: `[]`, `{}`, `'0'`, `'false'` and `' '`.
- Return a new array and leave the input unchanged.

## Follow-up

- Why does `arr.filter(Boolean)` work? What does `filter` pass to its callback?
- How would you write a version that removes only `null` and `undefined` and keeps `0` and `''`? When is that the better choice?
