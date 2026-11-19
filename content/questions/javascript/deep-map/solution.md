## Approach

Recursive descent with the path threaded through:

- **Array:** `node.map((item, i) => walk(item, [...path, i]))`.
- **Plain object:** create `{}` and fill it with `walk(node[key], [...path, key])` for each own key.
- **Anything else:** it's a leaf, so return `fn(node, path)`.

Because the result is built bottom-up from new containers, the input is never touched and the output never shares containers with it.

## Design choices worth saying out loud

- **What is a leaf?** Anything that isn't an array or plain object. Recursing into a `Date` or `Map` would destroy it (`Object.keys(new Date())` is `[]`), so they are handed to `fn` whole. That lets `fn` do things like `v instanceof Date ? v.toISOString() : v`.
- **Path type:** numbers for array indexes make `path` directly usable with `get`/`set`, and distinguish `['a', 0]` (array) from `['a', '0']` (object key).
- **Fresh path arrays:** `[...path, key]` creates a new array per level, so a callback that stores `path` doesn't see it mutated later. A shared mutable path with push/pop is faster but leaks if `fn` keeps a reference.

## Complexity

O(n) leaves and containers visited. Path copying adds O(d) per node for depth d, so O(n · d) worst case; with push/pop it's O(n). Stack depth is O(d).

## Edge cases

- Root primitive: `fn(value, [])`.
- `null`/`undefined` leaves are passed to `fn`, which must handle them (a common bug in the trim example: `v.trim()` on `null` throws).
- Empty containers survive as empty containers.
- Sparse arrays: `map` skips holes, so holes stay holes.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Using `typeof v === 'object'` to detect containers | `null` crashes; `Date` becomes `{}` |
| `Object.entries(arr)` for arrays | Arrays come back as objects with `'0'`, `'1'` keys |
| Mutating the input in place | Callers' state changes; breaks React's reference-equality assumptions |
| Calling `fn` on containers too | Double transformation or `fn` receives objects it can't handle |
| Sharing one mutable `path` array with `fn` | Stored paths change after the fact |

## Follow-ups interviewers ask

- **Map keys too:** accept `{ mapKey, mapValue }`, and use `result[mapKey(key, path)] = …`. That's essentially `camelCaseKeys` for API responses.
- **Skip subtrees:** let `fn` return a sentinel, or accept a `shouldDescend(node, path)` predicate.
- **Cycles:** a `WeakMap` from source container to its new copy, consulted before recursing.
- **Iterative version** with an explicit stack for very deep inputs.
