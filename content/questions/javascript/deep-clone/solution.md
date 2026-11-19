## Approach

Three cases, applied recursively:

1. **Primitive** (`null` or `typeof !== 'object'`): primitives are immutable, so return the value itself.
2. **Array:** `value.map(deepClone)` gives a new array with each element cloned.
3. **Plain object:** create `{}` and copy each own enumerable key, cloning its value.

The `null` check must come first because `typeof null === 'object'`.

## Complexity

O(n) time and space, where n is the total number of values in the structure. Recursion depth is O(d) for nesting depth d.

## Why not `JSON.parse(JSON.stringify(x))`?

It's the classic shortcut and it's lossy:

| Input | After the JSON round-trip |
|---|---|
| `{ a: undefined }` | `{}` (key dropped) |
| `[undefined]` | `[null]` |
| `NaN`, `Infinity` | `null` |
| `-0` | `0` |
| `10n` (BigInt) | **throws** `TypeError` |
| `new Date()` | an ISO **string** |
| `Map`, `Set` | `{}` |
| circular reference | **throws** `TypeError` |

It's also slower than a direct walk because it serialises to a string and parses it back.

## What about `structuredClone`?

Available in all modern browsers and Node 17+. It handles cycles, `Date`, `Map`, `Set`, `RegExp`, typed arrays, `Error`s and more. But it **throws** on functions and DOM nodes, and it **drops prototypes**: a class instance comes back as a plain object. In production code, it's usually the right answer; interviewers ask you to write the recursion to see that you understand the cases.

## Edge cases

- `undefined` values, `NaN`, `-0` and BigInt all survive, because primitives are returned directly.
- Shared references (`{ x: s, y: s }`) produce **two separate** copies. That's fine for trees; preserving the sharing requires the `WeakMap` technique from `deep-clone-ii`.
- Sparse arrays: `map` preserves holes.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `typeof value === 'object'` without a `null` check | `Object.keys(null)` throws |
| `{ ...value }` or `Object.assign` | Shallow: nested objects are still shared |
| Treating arrays like objects | Copy becomes `{ 0: …, 1: … }`, `Array.isArray` is false |
| `for...in` without an own check | Copies inherited enumerable properties onto the clone |
| Returning `value` for arrays | Arrays are objects; returning them unchanged shares them |

## Follow-ups interviewers ask

- **Cycles and shared references:** keep a `WeakMap<source, clone>`. Register the empty clone *before* recursing into children, so a back-reference finds it.
- **More types:** `Date` → `new Date(d.getTime())`, `RegExp` → `new RegExp(r.source, r.flags)`, `Map`/`Set` → clone entries. That's `deep-clone-ii`.
- **Preserve prototypes:** create the clone with `Object.create(Object.getPrototypeOf(value))`. Trade-off: private fields (`#x`) and internal slots can't be copied this way.
- **Symbol keys and non-enumerable properties:** use `Reflect.ownKeys` and property descriptors.
- **Why does React care?** State updates rely on new references. Deep cloning everything defeats memoisation (every subtree is "changed"). Structural sharing (copy only the path you change) is usually what you want.
