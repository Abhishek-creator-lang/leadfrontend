Implement `has(object, path)`. It returns `true` if every key along `path` is an **own** property of the value at that level, and `false` otherwise.

Unlike `get(obj, path) !== undefined`, `has` can tell "the key exists and holds `undefined`" apart from "the key is missing". That distinction matters for PATCH payloads, where `{ name: undefined }` and `{}` can mean different things.

```js
const obj = { a: { b: undefined, c: [10, 20] } };

has(obj, 'a.b');      // true  (exists, value is undefined)
has(obj, 'a.x');      // false
has(obj, 'a.c[1]');   // true
has(obj, 'a.c.5');    // false
has(obj, ['a', 'c']); // true
has(obj, 'toString'); // false (inherited, not own)
```

## Signature

```js
has(object, path) // boolean
```

## Requirements

- `path` is an array of keys or a string with dot and bracket syntax (`'a.b'`, `'a[0].b'`, `'a.0.b'`). Quoted keys are out of scope.
- Every step must be an **own** property (use `Object.hasOwn` or `Object.prototype.hasOwnProperty.call`). Inherited properties such as `toString` or `Array.prototype.map` don't count. This matches lodash's `has`; lodash's `hasIn` is the inherited-aware variant.
- Array indexes are own properties of arrays, so `has([1, 2], '0')` is `true`. Holes in sparse arrays are not.
- If `object` is `null`/`undefined`, or the walk reaches `null`/`undefined` or a primitive before the path ends, return `false`.
- An empty path returns `false`.
- Objects created with `Object.create(null)` must work (they have no `hasOwnProperty` method).

## Follow-up

- Implement `hasIn` that also accepts inherited properties. What changes?
- Why is `obj.hasOwnProperty(key)` unsafe on arbitrary data?
