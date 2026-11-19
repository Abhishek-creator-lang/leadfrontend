Implement `memoize(func)` for functions that take **any number of arguments**. Two calls hit the same cache entry only if they pass the **same number of arguments** and every argument matches its counterpart.

```js
const area = memoize((w, h) => w * h);
area(2, 3); // 6, computed
area(2, 3); // 6, cached
area(3, 2); // 6, computed (different order is a different key)

const config = { dark: true };
const render = memoize((node, opts) => /* ... */ null);
render('a', config); // computed
render('a', config); // cached (same object reference)
render('a', { dark: true }); // computed (different reference)
```

## Requirements

- Arguments are compared **position by position with SameValueZero**:
  - `1` and `'1'` differ.
  - Objects and functions match only by reference.
  - `NaN` matches `NaN`.
- The **number** of arguments is part of the key, so `f(1)`, `f(1, undefined)` and `f()` are three different entries.
- The key must be **collision-free**. Keys made by joining arguments into a string are not acceptable, because `f('a,b')` and `f('a', 'b')` must not share an entry.
- Results are cached even when they are `undefined`. If `func` throws, nothing is cached.
- `this` is forwarded to `func`. (It is not part of the key.)
- The memoized function has a `clear()` method that empties the cache.

## Follow-up

- What is the memory profile of your cache, and how could you let entries for object arguments be garbage-collected?
- When would a `resolver` that serialises arguments be acceptable after all?
- How would you add a maximum cache size?
