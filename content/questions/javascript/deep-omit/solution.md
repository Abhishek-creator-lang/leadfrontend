## Approach

A recursive `walk(node)` with three cases:

1. **Array** → `node.map(walk)`. Elements are kept; each one is cleaned.
2. **Plain object** → build a new object from `Object.keys(node)`, skipping excluded keys and walking each kept value.
3. **Anything else** → return it unchanged.

The excluded keys go into a `Set` once, outside the recursion, so each lookup is O(1).

## Why only plain objects?

Recursing into "any object" sounds more thorough but breaks things:

- A `Date` copied key by key becomes `{}` (dates have no own enumerable properties).
- A `Map`'s entries aren't properties at all, so it also becomes `{}`.
- A class instance loses its prototype and methods.

Restricting recursion to JSON-shaped data (plain objects and arrays) keeps the function predictable. `isPlainObject` checks the prototype: `Object.prototype` (literals, `JSON.parse` output) or `null` (`Object.create(null)` dictionaries).

## Complexity

O(n) time, where n is the total number of values in the tree, and O(n) space for the copy plus O(d) call-stack depth for nesting depth d.

## Edge cases

- Top-level array or primitive input works because `walk` handles every type.
- Array indexes are never compared against `keys`, so `deepOmit(['a'], ['0'])` keeps `'a'`.
- `undefined` values are kept (only the key name matters).
- Cycles would recurse forever; the prompt rules them out, but see follow-ups.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `typeof v === 'object'` as the recursion test | `null` crashes `Object.keys`; `Date`/`Map` turn into `{}` |
| Treating arrays as objects | `Object.keys` copy returns `{ 0: …, 1: … }` instead of an array |
| `delete` on the input | Mutates caller data (dangerous when scrubbing logs: the real object loses its token too!) |
| Forgetting to recurse into arrays | `sessions[0].token` survives |
| Rebuilding the `Set` on each recursive call | Wasted work proportional to tree size × k |

## Follow-ups interviewers ask

- **Cycles:** keep a `WeakMap<original, copy>`. Before copying a node, check the map; after creating the empty copy, store it so back-references reuse it. Same technique as `deep-clone-ii`.
- **Iterative version:** use an explicit stack of `{ source, target }` pairs. Helpful for very deep (thousands of levels) data where recursion can hit the call stack limit.
- **Omit by path:** walk with the current path (`['user', 'token']`) and compare joined paths, or reuse a `set`-style parser.
- **Predicate version:** `deepOmitBy(value, (val, key, path) => boolean)` is more flexible, e.g. remove every key starting with `_`.
