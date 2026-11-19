Implement `set(object, path, value)`. It writes `value` at `path` inside `object`, creating any missing intermediate containers, then returns the **same** (mutated) `object`.

It is the write counterpart of `get` and shows up in form libraries (`setFieldValue('address.city', 'Paris')`) and in reducers that apply patches by path.

```js
const obj = { a: { b: 1 } };

set(obj, 'a.b', 2);          // obj.a.b === 2
set(obj, 'a.c.d', 3);        // obj.a.c is created as {} → { d: 3 }
set(obj, 'list[0].name', 'x'); // obj.list is created as [] → [{ name: 'x' }]
set(obj, ['x', '1'], true);  // obj.x is created as [] → [ <empty>, true ]
```

## Signature

```js
set(object, path, value) // returns object
```

## Requirements

- `path` is an array of keys or a string. Strings accept dots and brackets, the same as `get`: `'a.b'`, `'a[0].b'`, `'a.0.b'`. Quoted bracket keys are out of scope.
- When an intermediate value is missing **or is not an object** (a primitive, `null`, `undefined`), replace it with a new container:
  - an **array** if the *next* key is a non-negative integer (`0`, `'12'`),
  - otherwise a plain **object**.
- Existing objects and arrays along the path are reused, not replaced.
- `set` mutates and returns the original `object`. If `object` is `null`/`undefined`, return it unchanged.
- An empty path does nothing.
- **Security:** if any key in the path is `__proto__`, `constructor` or `prototype`, do nothing and return `object` unchanged. This prevents prototype pollution when paths come from user input.

## Follow-up

- How would you write an **immutable** `setIn` that returns a new object and leaves the original untouched, sharing unchanged branches?
- Why is prototype pollution dangerous, and where does it come from in practice?
- Should `'01'` be treated as an array index?
