Implement `get(object, path, defaultValue)`. It walks into `object` following `path` and returns the value it finds. If any step along the way hits `null` or `undefined`, or the final value is `undefined`, it returns `defaultValue` instead of throwing.

This is the classic pre-optional-chaining helper (lodash's `_.get`) and is still handy when the path is **data**, for example a column definition such as `{ field: 'address.city' }` in a table component.

```js
const user = {
  name: 'Ada',
  address: { city: 'London', geo: { lat: 51.5 } },
  roles: [{ id: 'admin' }, { id: 'editor' }],
};

get(user, 'address.city');            // 'London'
get(user, ['address', 'geo', 'lat']); // 51.5
get(user, 'roles[1].id');             // 'editor'
get(user, 'roles.0.id');              // 'admin'
get(user, 'address.zip', 'n/a');      // 'n/a'
get(user, 'phone.mobile.number');     // undefined (no TypeError)
```

## Signature

```js
get(object, path, defaultValue?)
```

## Requirements

- `path` is either an **array of keys** (used as-is) or a **string**.
- A string path is split on `.` and on brackets, so `'a[0].b'`, `'a.0.b'` and `'a[0][1]'` are all supported. Bracket contents are plain keys; you do **not** need to support quoted keys such as `a["b.c"]`.
- An empty path (`''` or `[]`) returns `defaultValue` when given, otherwise `undefined`. (lodash returns `defaultValue` here too.)
- If the walk reaches `null` or `undefined` before the path is exhausted, return `defaultValue`.
- `defaultValue` is returned **only** when the resolved value is `undefined`. Values such as `null`, `0`, `''` and `false` are returned as they are.
- Own and inherited properties are both readable (`get('abc', 'length')` is `3`).

## Follow-up

- How would you support quoted keys like `a["b.c"]`?
- How would you cache parsed paths if `get` is called millions of times with the same few paths?
- When is optional chaining (`a?.b?.[0]`) a better choice than `get`?
