Implement `deepMerge(...objects)`. It merges any number of plain objects **left to right** into a brand-new object. Nested plain objects are merged recursively instead of being replaced wholesale.

This is how theme systems (`createTheme(base, overrides)`), bundler configs and feature-flag defaults combine layered settings.

```js
const defaults = { theme: { color: 'blue', spacing: { unit: 8 } }, plugins: ['a'], debug: false };
const user = { theme: { spacing: { unit: 4 } }, plugins: ['b'], debug: undefined };

deepMerge(defaults, user);
// {
//   theme: { color: 'blue', spacing: { unit: 4 } },
//   plugins: ['b'],   // arrays are replaced, not merged
//   debug: false,     // undefined in a later object does not overwrite
// }
```

## Signature

```js
deepMerge(...objects) // returns a new plain object
```

## Requirements

- Process the arguments left to right; later values win.
- If **both** the current value and the incoming value are **plain objects** (prototype `Object.prototype` or `null`), merge them recursively.
- Otherwise the incoming value **replaces** the current one. In particular:
  - **Arrays are replaced**, not merged by index or concatenated. (lodash's `merge` merges arrays by index; we deliberately don't.)
  - A plain object replaces a primitive or array, and vice versa.
- An incoming value of **`undefined` is skipped** (the existing value is kept). `null` does overwrite.
- **No mutation:** none of the inputs is modified, and the result shares **no plain objects or arrays** with the inputs (they are copied). Other objects (`Date`, `Map`, class instances, functions) are copied by reference.
- `null`/`undefined` arguments are ignored. With no arguments, return `{}`.
- Only own enumerable string keys are merged. Skip the key `__proto__` (prototype-pollution guard).

## Follow-up

- Allow a custom array strategy (`'replace' | 'concat' | 'byIndex'`).
- How would `deepMerge` behave with circular references, and how would you fix it?
- Why is a naive `merge` a common source of prototype-pollution CVEs?
