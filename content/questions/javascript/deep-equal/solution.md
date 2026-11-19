## Approach

Work from cheapest to most expensive check:

1. **`a === b`** → `true`. Handles equal primitives and identical references (a big win on large structures that share subtrees).
2. **If either side is not an object** (primitive or `null`), the only remaining way to be equal is both being `NaN`. `x !== x` is the classic NaN test.
3. **Array-ness must match.** `[1]` and `{ 0: 1 }` have the same keys and values but are different shapes.
4. **Arrays:** compare lengths, then recurse element by element.
5. **Objects:** compare key counts, then for each key in `a`, check that `b` owns it and recurse on the values.

### Why the key count + `hasOwnProperty` check?

Checking only `deepEqual(a[key], b[key])` for keys of `a` misses two bugs:

- `b` has extra keys → equal key counts catch it.
- `a` has `{ x: undefined }` and `b` has `{ y: undefined }` → counts match, and `b.x` is `undefined` too! The explicit `hasOwnProperty` check catches it.

## Complexity

O(n) time where n is the total number of values compared, with early exit on the first difference. O(d) stack depth. `Object.keys` allocates an array per object, O(n) extra space in total.

## Equality semantics

| Algorithm | `NaN` vs `NaN` | `0` vs `-0` | Used by |
|---|---|---|---|
| `===` | false | true | most code |
| SameValueZero | **true** | true | `includes`, `Map`/`Set` keys, lodash `isEqual` |
| `Object.is` (SameValue) | true | **false** | React's `useState` bail-out, `useEffect` deps |

State which one you're implementing; the prompt asks for SameValueZero.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `JSON.stringify(a) === JSON.stringify(b)` | Key order matters; `undefined` keys and `NaN` are lost (`{ a: NaN }` equals `{ a: null }`) |
| `typeof a === 'object'` without a `null` check | `Object.keys(null)` throws |
| Only iterating keys of `a` | `{}` equals `{ extra: 1 }` |
| No array/object shape check | `[]` equals `{}` |
| Using `==` for primitives | `1` equals `'1'`, `null` equals `undefined` |

## Follow-ups interviewers ask

- **More types:** `Date` → compare `getTime()`; `RegExp` → `source` and `flags`; `Map` → same size and every key maps to a deep-equal value; `Set` → same size and every element of one is in the other (for object elements this needs an O(n²) deep search, which is a good discussion point). Also compare prototypes (`Object.getPrototypeOf`) so a class instance isn't equal to a plain object.
- **Cycles:** keep a `Map` of `a`-objects to the `b`-objects they're being compared with. If you see the same pair again, assume `true` (co-inductive equality).
- **React:** `React.memo` and `useMemo` use **shallow** `Object.is` comparisons because they're O(keys) and predictable. Deep equality on every render can cost more than the re-render it avoids. Prefer stable references (`useMemo`, `useCallback`, normalised state) over deep comparisons.
