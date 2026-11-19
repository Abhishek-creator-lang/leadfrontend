Implement `deepOmit(value, keys)`. It returns a copy of `value` where every property whose name is in `keys` has been removed, **at any depth**, including inside objects nested in arrays.

A common use is scrubbing data before logging or snapshot testing: remove every `password`, `token` or volatile `updatedAt` field, wherever it appears.

```js
const payload = {
  id: 1,
  token: 'abc',
  user: { name: 'Ada', token: 'xyz', prefs: { theme: 'dark' } },
  sessions: [{ id: 's1', token: 't1' }, { id: 's2' }],
};

deepOmit(payload, ['token']);
// {
//   id: 1,
//   user: { name: 'Ada', prefs: { theme: 'dark' } },
//   sessions: [{ id: 's1' }, { id: 's2' }],
// }
```

## Signature

```js
deepOmit(value, keys) // keys: Array<string>
```

## Requirements

- Recurse into **plain objects** (prototype is `Object.prototype` or `null`) and **arrays**. Both are copied: the result never shares a plain object or array with the input.
- Array elements are never removed, only cleaned. Array indexes are not matched against `keys`.
- Any other value (primitives, functions, `Date`, `Map`, class instances…) is returned **as is**, by reference, without looking inside.
- Only own enumerable string keys of plain objects are copied (same as `Object.keys`).
- Never mutate the input.
- Inputs are assumed to be acyclic.

## Follow-up

- How would you make it safe against circular references?
- How would you make it iterative to avoid stack overflows on very deep data?
- How would you omit by **path** (`'user.token'`) instead of by key name?
