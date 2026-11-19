Implement `pick(object, keys)`. It returns a **new** object with only the listed keys copied from `object`.

A typical use is whitelisting fields before sending data to an API or logging, so that new sensitive fields added later are excluded by default.

```js
const user = { id: 1, name: 'Ada', email: 'ada@example.com', password: 'secret' };

pick(user, ['id', 'name']);       // { id: 1, name: 'Ada' }
pick(user, ['id', 'missing']);    // { id: 1 }
pick(user, []);                   // {}
```

## Signature

```js
pick(object, keys) // keys: Array<string>
```

## Requirements

- Only **top-level** keys. Dotted strings like `'a.b'` are treated as a literal key name (lodash's `pick` would treat them as deep paths; we don't).
- Copy a key only if it is an **own** property of `object`. Missing keys are skipped (not set to `undefined`). Keys that exist with value `undefined` are copied.
- The copy is **shallow**: nested objects are shared by reference.
- Never mutate `object`.
- If `object` is `null`/`undefined`, return `{}`.

## Follow-up

- Write the TypeScript signature so `pick(user, ['id'])` is typed as `{ id: number }`.
- When would you prefer `pick` (allow-list) over `omit` (deny-list)?
