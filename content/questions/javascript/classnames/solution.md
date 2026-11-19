## Approach

Collect class names into one array with a recursive helper, then `join(' ')` once at the end.

```js
function collect(value, out) {
  if (!value) return;                       // null, undefined, false, '', 0, NaN
  const type = typeof value;
  if (type === 'string' || type === 'number') out.push(String(value));
  else if (Array.isArray(value)) value.forEach((item) => collect(item, out));
  else if (type === 'object') {
    for (const key of Object.keys(value)) if (value[key]) out.push(key);
  }
  // booleans (true), functions, symbols, bigints: ignored
}
```

The early `if (!value) return` handles every falsy input in one place: `null`, `undefined`, `false`, `''`, `0` and `NaN`. After that, only truthy values remain, so `true` falls through every branch and is ignored.

`Object.keys` returns only **own enumerable** string keys, which satisfies the "ignore inherited keys" rule without a `hasOwnProperty` check.

Using one shared output array (instead of joining recursively and concatenating strings) avoids empty fragments such as `'a  b'` when a nested array produces nothing.

## Complexity

O(n) time and space, where n is the total number of strings, array items and object keys visited.

## Edge cases

- **Nested arrays** of any depth, including empty arrays, contribute nothing extra.
- **Falsy object values** (`0`, `''`, `null`) exclude the key. Truthy non-booleans (`1`, `'yes'`) include it.
- **Numbers:** `0` is ignored because it is falsy, while `-1` and `1.5` become `'-1'` and `'1.5'`.
- **Other objects:** the spec says "plain object". In practice the `classnames` package also honours a custom `toString` on objects, and you can mention that.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `if (typeof value === 'object')` before the array check | Arrays are treated as objects and their indexes become class names (`'0 1'`) |
| `if (value === null) return` only | `0`, `''` and `false` leak through as `'0'`, `''` and `'false'` |
| `for...in` without an own-property check | Inherited (prototype) keys leak in |
| Joining at each level of recursion | Double spaces when a nested array is empty |
| De-duplicating without being asked | Behaviour differs from the library people expect |

## Follow-ups

- **De-duplication:** use a `Map<className, boolean>`, set `true` for strings and object keys with truthy values, and `false` for falsy object keys, then output the keys that are still `true`. That lets `classNames('a', { a: false })` produce `''` (the `classnames/dedupe` variant).
- **Iterative version:** use an explicit stack of pending values. Push array items in reverse so that order is preserved.
- **Performance:** `clsx` avoids allocating an intermediate array and builds the string directly with `+=`, which is cheaper for the typical 2–5 short arguments. In hot React render paths this matters slightly. Memoizing the class string is usually unnecessary.
- **TypeScript:** type the input as a recursive union: `type ClassValue = string | number | null | undefined | boolean | ClassValue[] | Record<string, unknown>`.
