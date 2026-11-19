## Approach

Split the work into two small steps:

1. **Normalise the path** into an array of keys. Arrays are used as they are. For strings, rewrite every `[x]` as `.x`, split on `.`, and drop empty segments (they come from a leading bracket like `'[0].a'` or from `''`).
2. **Walk** the keys. Before each step, check whether the current value is `null` or `undefined`; if so, bail out with `defaultValue`. After the loop, swap a final `undefined` for `defaultValue`.

The `null`/`undefined` check (rather than `typeof current === 'object'`) is deliberate: primitives can still have properties (`'abc'.length`, `(5).toFixed`), and property access on them works through auto-boxing.

## Complexity

- Parsing: O(L) for a string path of length L.
- Walking: O(k) for k keys. Space O(k) for the key array.

## Edge cases

- `get(obj, 'a.b', d)` where `a.b` is `null` returns `null`, not `d`. lodash behaves the same: only `undefined` triggers the default.
- `get(null, 'x', d)` returns `d`; the source itself can be nullish.
- Numeric keys come out as strings (`'0'`), which is fine because property keys are strings anyway (`arr['0'] === arr[0]`).
- Empty path returns `defaultValue`. Some implementations return the object itself; state your choice.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `path.split('.')` only | `'a[0].b'` looks up the key `'a[0]'` |
| `current[key] \|\| defaultValue` | `0`, `''` and `false` are replaced by the default |
| Checking `if (!current)` before stepping | Can't read `''.length` or properties of `0` |
| Using `in` / `hasOwnProperty` for each step | Breaks inherited lookups like `length` on strings and arrays |
| Using `eval` or `new Function('return obj.' + path)` | Code injection risk and breaks on bracket syntax variations |

## When to use it today

Optional chaining (`user?.roles?.[1]?.id ?? 'n/a'`) is the right tool when the path is known at author time: it's faster, type-checked in TypeScript, and readable. `get` is useful when the path is **a runtime string**: table column configs, form field names (`'address.city'` in Formik / react-hook-form), i18n keys, or JSON-pointer-like selectors.

## Follow-ups interviewers ask

- **Quoted keys:** write a small tokenizer instead of a regex: walk characters, handle `.` separators, `[` + digits + `]`, and `["..."]` with escape handling.
- **Memoise path parsing:** a `Map<string, string[]>` cache with a size cap (lodash caps its cache at 500 entries) avoids re-parsing hot paths.
- **Typed `get` in TypeScript:** template literal types can split `'a.b.c'` into a tuple and index into the object type, giving `Get<T, 'address.city'>` = `string`.
- **`set`:** the mirror operation, which must create missing intermediate objects or arrays depending on whether the next key is an index.
