Implement `deepClone(value)`. It returns a deep copy of `value`: a structurally equal value in which **no object or array is shared** with the original, so mutating the copy at any depth never affects the original (and vice versa).

```js
const original = { user: { name: 'Ada', tags: ['math'] }, count: 1 };
const copy = deepClone(original);

copy.user.tags.push('code');
original.user.tags; // ['math'] (unchanged)
copy.user === original.user; // false
```

## Signature

```js
deepClone(value)
```

## Scope

The input is **JSON-like data**:

- primitives: `string`, `number` (including `NaN`, `Infinity`), `boolean`, `null`, `undefined`, `bigint`, `symbol`;
- plain objects and arrays, nested to any depth.

## Requirements

- Primitives are returned as they are.
- Arrays are cloned as arrays (`Array.isArray(copy)` is `true`), preserving length and order.
- Objects are cloned as new plain objects with all **own enumerable string keys**.
- Values that `JSON.stringify` would lose must survive: `undefined` values stay present as keys, `NaN`/`Infinity` stay numbers, `-0` stays `-0`.
- No cycles, `Date`, `Map`, `Set`, class instances or functions in the input (see the `deep-clone-ii` question for those).
- Do not use `structuredClone` or `JSON.parse(JSON.stringify(...))`. Write the recursion yourself.

## Follow-up

- What does `JSON.parse(JSON.stringify(x))` get wrong?
- What does `structuredClone` support, and what does it throw on?
- How would you handle circular references?
