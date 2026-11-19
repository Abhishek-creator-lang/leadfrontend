## Approach

Loop over the **requested keys** (not over the object), and copy each one that the object owns. Iterating the key list means the cost depends on how many keys you ask for, not on the size of the source object.

```js
for (const key of keys) {
  if (Object.prototype.hasOwnProperty.call(object, key)) result[key] = object[key];
}
```

A one-liner alternative is `Object.fromEntries(keys.filter((k) => Object.hasOwn(object, k)).map((k) => [k, object[k]]))`. It's fine, but allocates two intermediate arrays.

## Complexity

O(k) time and space for k requested keys.

## Edge cases

- **Missing vs undefined:** `pick({}, ['a'])` must be `{}`, not `{ a: undefined }`. The difference shows up in `Object.keys`, in `JSON.stringify` (both drop it, fine), and in spreads (`{ ...defaults, ...picked }` would overwrite a default with `undefined`!). That last one is a real bug source.
- **Inherited keys** are skipped. lodash's `pick` actually includes inherited properties (it uses `in`), so state your choice.
- **Shallow copy:** mutating `picked.nested.x` mutates the source too.
- **Order:** keys appear in the order of the `keys` argument (except integer-like keys, which JS always orders numerically first).

## Common mistakes

| Mistake | Consequence |
|---|---|
| `result[key] = object[key]` without an existence check | Missing keys become `undefined` and clobber defaults in later spreads |
| `if (object[key])` as the check | Drops `0`, `''`, `false`, `null` values |
| Using `key in object` | Picks up inherited properties like `toString` if asked |
| Mutating the source with `delete` | Callers' data changes under them |

## Allow-list vs deny-list

`pick` is an **allow-list**: a new `password` or `ssn` field added to the user model later is excluded automatically. `omit` is a deny-list: new fields leak by default. For anything crossing a trust boundary (API responses, logs, analytics), prefer `pick`.

## Follow-ups interviewers ask

- **TypeScript:**
  ```ts
  function pick<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K>;
  ```
- **Deep paths:** combine with `get`/`set` so `pick(obj, ['a.b'])` returns `{ a: { b: … } }`.
- **`pickBy(obj, predicate)`:** iterate `Object.entries(obj)` and keep entries where the predicate passes.
