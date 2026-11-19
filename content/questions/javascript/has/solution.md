## Approach

Parse the path into keys (same `[x]` → `.x` normalisation as `get`), then walk it. At each level ask two questions:

1. Is the current value something that can own properties (a non-null object or a function)?
2. Does it **own** the next key?

If either answer is no, return `false`. If the walk finishes, return `true`. The value at the end is irrelevant; that's the whole point of `has` versus `get`.

## Why `Object.prototype.hasOwnProperty.call`?

- `obj.hasOwnProperty(key)` fails on `Object.create(null)` objects (no such method) and can be shadowed by data (`{ hasOwnProperty: () => true }`), which is a real risk when checking JSON from users.
- `Object.hasOwn(obj, key)` (ES2022) is the modern equivalent and reads better. Either is fine.
- The `in` operator walks the prototype chain, so `'toString' in {}` is `true`. That's the semantics of lodash's `hasIn`, not `has`.

## Complexity

O(k) time and space for k keys.

## Edge cases

- `{ b: undefined }` has `b`. `get` can't detect this; `has` can.
- Sparse array holes: `[1, , 3]` does not own index `1`, so `has` returns `false`. `arr.length` is still 3.
- Primitives: `has('abc', 'length')` returns `false` here because strings are not containers. lodash actually returns `true` for this (it boxes the string). The prompt explicitly limits us to object containers; mention the difference if asked.
- Empty path: `false`. There is no key to check.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `get(obj, path) !== undefined` | Reports `false` for keys that exist with value `undefined` |
| Using `in` | Inherited keys (`toString`, `constructor`, `map`) are reported as present |
| `obj.hasOwnProperty(k)` | Throws on null-prototype objects; can be spoofed by data |
| Not checking for `null` before stepping | `hasOwnProperty.call(null, k)` throws a `TypeError` |

## Follow-ups interviewers ask

- **`hasIn`:** replace the own check with `key in Object(current)`; wrapping with `Object()` lets primitives be checked too.
- **Where does this matter in React apps?** Form state (`touched.address.city` vs not yet visited), PATCH semantics (send `null` to clear vs omit to leave alone), and feature-flag configs where `false` and "unset" mean different things.
- **TypeScript:** a type guard `has<T, P extends string>(obj: T, path: P): obj is T & DeepRecord<P>` lets the compiler narrow after the check.
