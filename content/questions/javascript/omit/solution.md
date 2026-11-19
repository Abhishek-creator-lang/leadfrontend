## Approach

Put the keys to drop in a `Set`, then copy every own enumerable key of the object that isn't in the set.

The `Set` turns each membership check into O(1). Using `keys.includes(key)` inside the loop works but is O(n × k), which an interviewer will usually point out.

`keys.map(String)` normalises numeric keys: `Object.keys` always returns strings, so `omit({ 1: 'a' }, [1])` should still remove `'1'`.

## Complexity

O(n + k) time (n own keys, k omitted keys), O(n + k) space for the result and the set.

## Rest syntax comparison

```js
const { variant, size, ...rest } = props;
```

Destructuring is the idiomatic choice when the keys are **known at author time**: it's fast, and TypeScript types `rest` precisely. `omit` is for when the key list is **dynamic** (computed, from config, or a long shared list like `INTERNAL_PROP_NAMES`). Note that rest also copies own enumerable symbol keys, which our `omit` doesn't.

## Edge cases

- Nothing to omit: still return a copy so callers can mutate it safely.
- Falsy values are kept. A truthiness check would drop them.
- `undefined` values are kept as keys, which matters for `Object.keys` and for spreads.
- Inherited properties are not copied: the result is always a plain object.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `const copy = object; delete copy[k]` | Mutates the caller's object (no copy was made) |
| `{ ...object }` then `delete` | Works, but `delete` can deopt the object shape in V8; building fresh is cleaner |
| `keys.includes` in the loop | O(n × k) |
| `for...in` without an own check | Copies inherited enumerable properties |
| Returning the original object when `keys` is empty | Shared reference; mutations leak back to the caller |

## Follow-ups interviewers ask

- **TypeScript:** `function omit<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K>`.
- **`omitBy(obj, predicate)`:** e.g. strip all `undefined` values before sending a PATCH.
- **Deep omit:** recurse into nested objects and arrays; see the `deep-omit` question.
- **Security angle:** `omit(user, ['password'])` is a deny-list. When a teammate adds `ssn` to the model, it leaks. For responses, prefer `pick` or an explicit DTO.
