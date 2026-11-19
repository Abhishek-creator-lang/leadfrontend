## Approach

1. Normalise `iteratee` into a function. If it's a string, wrap it as `(el) => el[iteratee]`. Doing this once, before the loop, keeps the loop body simple and avoids a type check per element.
2. Walk the array, compute the key, and increment `result[key]`, starting from `0` when the key is new.

The interesting part is "is this key new?". The tempting `result[key] = (result[key] || 0) + 1` breaks for keys that exist on `Object.prototype`. With a plain `{}`, `result['constructor']` is the `Object` function, and `Object + 1` is the string `"function Object() { [native code] }1"`.

Two robust fixes:

- Use `Object.hasOwn(result, key)` (or `Object.prototype.hasOwnProperty.call`) to test for an own key.
- Or accumulate into `Object.create(null)`, which has no prototype at all. If you do, copy into a normal object at the end if callers expect `toEqual({...})` or methods like `hasOwnProperty`.

The reference solution uses `Object.hasOwn` on a normal object.

## Complexity

- **Time:** O(n) iteratee calls plus O(1) average work per element.
- **Space:** O(k) where k is the number of distinct keys.

## Edge cases

- Numbers, `null`, `undefined` and booleans as keys become `'4'`, `'null'`, `'undefined'` and `'true'`.
- `'__proto__'` as a key: assigning `obj['__proto__'] = 1` on a normal object hits the inherited setter and is ignored. If that matters in your domain (user-supplied keys), use a `Map` or `Object.create(null)`.
- A string iteratee on a missing property groups those elements under `'undefined'`.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `result[key] = (result[key] \|\| 0) + 1` | Garbage values for `'constructor'`, `'toString'`, … |
| `if (key in result)` | `in` also checks the prototype chain, same bug |
| Calling `iteratee(el, i, arr)` with `Array.prototype.map` semantics, then passing `parseInt` | `parseInt` receives the index as the radix. The prompt says the element only |
| Re-checking `typeof iteratee` inside the loop | Works, but is noisier and slower than normalising once |

## Follow-ups interviewers ask

- **`Map` version:** `map.set(key, (map.get(key) ?? 0) + 1)` keeps `1` and `'1'` as separate keys and has no prototype problems.
- **Built-ins:** `Object.groupBy(array, fn)` (ES2024) groups into arrays. `countBy` is the same idea with a counter instead of an array.
- **Sum by:** replace `+ 1` with `+ valueOf(el)`, and you have a generic "aggregate by" helper. That generalisation (key function + reducer) is what a senior candidate should point out.
