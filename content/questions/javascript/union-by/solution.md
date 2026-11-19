## Approach

1. **Split the arguments.** Take all arguments with a rest parameter, then `const iteratee = args.pop()` (or `args.at(-1)` and `args.slice(0, -1)` to avoid mutating the rest array). Everything left is the list of arrays.
2. **Normalise the iteratee** into a function: a string becomes `(el) => el[key]`.
3. **Scan with a `Set` of seen keys.** For each array in order, for each element: compute the key; if the set doesn't have it, add it and push the element.

Using a `Set` for keys (instead of an object) is what gives SameValueZero semantics: `1` and `'1'` stay separate and `NaN` matches `NaN`. An object lookup would stringify keys.

## Complexity

O(N) time on average for N total elements, with exactly N iteratee calls. O(u) extra space for u unique keys.

## Edge cases

- Duplicates inside one array are removed (it's a union of *sets*).
- Elements whose key is `undefined` (missing property) all share one key, so only the first survives. That's correct per the spec, but surprising in practice. If it matters, validate the data first.
- Only an iteratee: no arrays, so the result is `[]`.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Object as the seen-map | `1` and `'1'` collide; object keys all become `'[object Object]'` |
| Returning the keys instead of the elements | Loses the data you were trying to merge |
| Concatenating everything, then calling a generic `uniqBy` | Works, but allocates an extra combined array; fine to mention as the simple version |
| Treating the first argument as the iteratee | Breaks the documented call shape |
| Calling the iteratee twice per element (once to check, once to add) | Double work and wrong results for impure iteratees |

## Iteratee-last signatures

lodash puts the iteratee last so the call reads like the data flows: arrays first, then "by what". The cost is that a variadic-then-trailing signature can't be expressed with a simple rest parameter, so implementations must `pop` the last argument, and TypeScript needs overloads. A modern API would take `unionBy(arrays, iteratee)` or `unionBy(iteratee)(...arrays)` instead.

## Follow-ups interviewers ask

- **Fresh data wins:** iterate the arrays in reverse order and keep the first per key, or use a `Map` and overwrite (`map.set(key, el)`) so the last one wins. Watch the resulting order: a `Map` keeps the position of the key's first insertion.
- **`union` without an iteratee:** the identity function as the iteratee. That's a nice way to show the generalisation.
- **Normalised stores:** in Redux-style state, merging lists by id is usually better done with an `entities` object keyed by id plus an `ids` array, so a merge is O(1) per item.
