## Approach

Do a depth-first walk that carries the **path so far** as an array of segments, and write into one shared output object:

```js
function walk(value, path, out) {
  if (isContainer(value)) {
    for (const [key, child] of Object.entries(value)) {
      walk(child, key === '' ? path : [...path, key], out);
    }
    return;
  }
  out[path.join('.')] = value;
}
```

- `isContainer` is `Array.isArray(v) || isPlainObject(v)`. `Object.entries` works for both: an array yields `['0', item]`, `['1', item]`, so indexes become segments for free.
- Skipping `''` keys by **not adding a segment** handles both rules at once. A nested empty key disappears from the path, and a top-level `{ '': 1 }` ends with an empty path whose `join('.')` is `''`.
- Empty containers have no entries, so the loop writes nothing, which is exactly "empty containers produce no keys".
- Keeping segments in an array and joining once at the leaf avoids the classic bug of building `prefix + '.' + key` with a leading dot at the root.

## Complexity

O(n · d) time in the worst case, where n is the number of leaves and d the depth (the path join at each leaf), and O(n · d) space for the output keys. The recursion stack is O(d).

## Edge cases

- **`null` and `undefined` values** are leaves, so they appear in the output (`{ a: null }` stays `{ a: null }`).
- **Dates, Maps and class instances** are leaves kept by reference, rather than being walked and silently dropped (a `Date` has no own enumerable keys).
- **Sparse arrays:** `Object.entries` skips holes, so `[1, , 3]` produces `'0'` and `'2'` only.
- **Key order** follows `Object.entries` order (integer-like keys first, then insertion order).

## Common mistakes

| Mistake | Consequence |
|---|---|
| `typeof value === 'object'` as the container test | `null` crashes, and Dates vanish |
| `prefix ? prefix + '.' + key : key` with empty keys | Produces `'a..b'` or a leading `'.'` |
| Writing empty containers as values | `{ a: {} }` becomes `{ a: {} }` rather than `{}`, against the spec |
| Mutating and deleting keys in the input | Corrupts the caller's object |

## Follow-ups

- **Inverse:** split each key on `.` and create objects along the way. The round trip loses information: you can't tell whether `'tags.0'` came from an array or an object with key `'0'`, empty containers disappear, and empty-string keys are gone.
- **Dots in keys:** either escape them (`'a\\.b'`) or switch to an array-of-segments representation, which is what libraries such as `lodash.set` accept as an alternative to string paths.
- **Iterative version:** push `[value, path]` pairs on an explicit stack. It avoids stack overflows on pathological depth, but output order changes unless you push children in reverse.
- **Cycles:** add a `WeakSet` of containers on the current path and throw (or skip) when you revisit one.
