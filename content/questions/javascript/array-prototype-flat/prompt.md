Implement `Array.prototype.myFlat(depth)`, a polyfill for the native [`Array.prototype.flat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat). It returns a new array with nested arrays spread into it, up to `depth` levels deep.

The starter attaches the function to `Array.prototype` and default-exports it.

```js
[1, [2, [3, [4]]]].myFlat(); // [1, 2, [3, [4]]] (depth defaults to 1)
[1, [2, [3, [4]]]].myFlat(2); // [1, 2, 3, [4]]
[1, [2, [3, [4]]]].myFlat(Infinity); // [1, 2, 3, 4]
[1, [2]].myFlat(0); // [1, [2]] (a shallow copy)
[1, , [2, , 3]].myFlat(); // [1, 2, 3] (holes are removed)
```

## Requirements

- `depth` defaults to `1` when it is `undefined`. Otherwise it is converted like the native method does: `Number(depth)`, `NaN` becomes `0`, truncated toward zero. A depth of `0` or below flattens nothing.
- `Infinity` flattens completely.
- Only real arrays (`Array.isArray`) are flattened. Array-like objects, strings and objects with `Symbol.isConcatSpreadable` are kept as single elements.
- **Holes are removed** at every level that is being flattened, including the top level.
- Return a new array. Do not mutate `this` or any nested array.
- Do not use the native `flat`, `flatMap` or `concat`.

## Follow-up

- Write an iterative version that cannot overflow the call stack.
- Implement `flatMap` on top of your helper. Why does `flatMap` only flatten one level?
