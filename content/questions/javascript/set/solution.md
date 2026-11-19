## Approach

1. **Guard**: return early for a nullish `object`, an empty path, or any unsafe key.
2. **Parse** the path into string keys (same `[x]` → `.x` trick as `get`).
3. **Walk all keys except the last.** At each step, if `current[key]` is not an object, create one. Peek at the *next* key to decide the container type: an index-looking key means `[]`, anything else means `{}`.
4. **Assign** the last key and return the original `object`.

The look-ahead is the only interesting design decision. `set({}, 'a[0]', 1)` should give `{ a: [1] }`, not `{ a: { 0: 1 } }`, because the caller is clearly describing a list.

## What counts as an index?

The regex `^(0|[1-9]\d*)$` accepts canonical non-negative integers. `'01'` is rejected because `arr['01']` is a plain property, not an element; treating it as an index would create an array with a weird string key. `'-1'` and `'1.5'` are rejected for the same reason. lodash uses a similar rule.

## Prototype pollution

If paths come from a query string or JSON body (`?filter[__proto__][isAdmin]=true`), a naive `set` does:

```js
obj['__proto__'].isAdmin = true; // writes to Object.prototype!
```

Now *every* object in the process has `isAdmin === true`. This class of bug has hit lodash, jQuery's `extend`, and many query-string parsers (several CVEs). Blocking `__proto__`, `constructor` and `prototype` closes the common vectors. Alternatives: build containers with `Object.create(null)`, or check `Object.prototype.hasOwnProperty.call(current, key)` before descending.

## Complexity

O(k) time for k keys (plus O(L) to parse a string path), O(k) space for the key list.

## Edge cases

- Intermediate primitives (`{ a: 5 }` then `set(obj, 'a.b', 1)`) are replaced. Silently replacing user data is a trade-off; some libraries throw instead. Mention it.
- Writing a sparse index (`set({}, 'a[3]', x)`) creates an array of length 4 with holes, which is how JS arrays behave.
- Functions are objects, but this implementation treats them as "not object-like" and would replace them. Use `typeof v === 'object' || typeof v === 'function'` if you want to set properties on functions.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Always creating `{}` | `set({}, 'a[0]', 1)` produces an object instead of an array |
| Checking only `current[key] === undefined` | Primitive intermediates (`5`, `'x'`) are kept, then writing a property on a primitive throws a `TypeError` in strict mode (module code is strict) |
| Looping over all keys, including the last | You create a container for the leaf and lose the value |
| Returning a new object while also mutating | Callers can't tell which one to trust; pick one contract |
| No prototype-pollution guard | Security vulnerability whenever paths are user-controlled |

## Follow-ups interviewers ask

- **Immutable `setIn`:** recurse and shallow-copy each level on the way back up: `{ ...obj, [key]: setIn(obj[key], rest, value) }` (or `[...arr]` for arrays). Unchanged branches stay shared, which is what makes `React.memo` / selector equality cheap. This is what Immer and Redux Toolkit do for you.
- **`unset` / `delete`:** walk to the parent and `delete parent[last]`; for arrays decide between leaving a hole and `splice`.
- **Performance:** parsing is the hot part for repeated calls; memoise parsed paths.
