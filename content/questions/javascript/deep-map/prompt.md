Implement `deepMap(value, fn)`. It walks a nested structure of plain objects and arrays and returns a new structure of the **same shape**, where every **leaf** has been replaced by `fn(leaf, path)`.

Think of it as `Array.prototype.map` for trees. Typical uses: trimming every string in a form payload, converting every ISO date string to a `Date`, or masking values in a config for display.

```js
const input = { name: ' Ada ', tags: [' a', 'b '], meta: { age: 36 } };

deepMap(input, (v) => (typeof v === 'string' ? v.trim() : v));
// { name: 'Ada', tags: ['a', 'b'], meta: { age: 36 } }

deepMap({ a: [1, { b: 2 }] }, (v, path) => path.join('.'));
// { a: ['a.0', { b: 'a.1.b' }] }
```

## Signature

```js
deepMap(value, fn) // fn: (leaf, path: Array<string|number>) => any
```

## Requirements

- **Containers** are arrays and plain objects (prototype `Object.prototype` or `null`). They are rebuilt (never mutated or shared) with the same keys/indexes.
- **Leaves** are everything else: primitives, `null`, `undefined`, functions, `Date`, `Map`, class instances, etc. `fn` is called once per leaf.
- `path` is the array of keys from the root to the leaf. Array indexes are **numbers**, object keys are strings. For a root leaf, `path` is `[]`.
- Empty objects and arrays are kept as empty containers; `fn` is not called for them.
- Only own enumerable string keys are visited. The input is acyclic.
- Do not mutate the input.

## Follow-up

- How would you let `fn` also transform **keys** (e.g. snake_case → camelCase)?
- How would you skip recursion into certain subtrees?
