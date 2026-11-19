Implement `squashObject(obj)`. It returns a new, single-level object where every leaf value of `obj` is stored under its **path**, with the path segments joined by `.`.

This shape is used for form libraries (`errors['address.city']`), translation files, analytics properties and Firestore/MongoDB partial updates.

```js
squashObject({
  name: 'Ada',
  address: { city: 'London', geo: { lat: 51.5, lng: -0.1 } },
  tags: ['math', 'code'],
});
// {
//   name: 'Ada',
//   'address.city': 'London',
//   'address.geo.lat': 51.5,
//   'address.geo.lng': -0.1,
//   'tags.0': 'math',
//   'tags.1': 'code',
// }
```

## Requirements

- **Containers** are plain objects and arrays. They are walked recursively. Array indexes become path segments (`'tags.0'`).
- **Leaves** are everything else: primitives, `null`, `undefined`, functions, Dates, Maps, class instances. A leaf is copied as is (by reference for objects).
- **Empty containers** (`{}` and `[]`) produce no keys.
- **Empty-string keys are skipped in the path**: `{ a: { '': { b: 1 } } }` becomes `{ 'a.b': 1 }`, and `{ '': 1 }` becomes `{ '': 1 }` (the path is empty, so the key is `''`).
- Only own enumerable string keys are considered. The input must not be mutated.

## Follow-up

- Write the inverse, `unsquashObject`. Which information is lost on the round trip?
- How would you handle keys that already contain a `.`?
- How would you avoid recursion for very deep objects?
