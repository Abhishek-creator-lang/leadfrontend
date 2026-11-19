Implement `memoize(func, resolver?)`. It returns a function that caches `func`'s results. If the memoized function is called again with an input it has already seen, it returns the cached value instead of calling `func`.

```js
const slowSquare = (n) => {
  /* imagine something expensive */
  return n * n;
};
const square = memoize(slowSquare);

square(4); // 16, computed
square(4); // 16, from the cache
square(5); // 25, computed

const byId = memoize(
  (user) => fetchProfile(user.id),
  (user) => user.id // resolver: decides the cache key
);
```

## Requirements

- **Cache key:** by default, the **first argument only**. If `resolver` is given, the key is `resolver(...args)`, called with the same `this` as the memoized function.
- Keys are compared with **SameValueZero**, the same comparison `Map` uses:
  - `1` and `'1'` are different keys.
  - Objects are compared by **reference**.
  - `NaN` matches `NaN`.
- Results are cached even when they are `undefined`. A cache hit must not call `func`.
- If `func` throws, nothing is cached and the error propagates, so the next call with that key tries again.
- `func` is called with all of the original arguments and the original `this`.
- The memoized function exposes its cache as `memoized.cache`, a `Map` from key to result, so callers can inspect it, `delete` entries or `clear()` it.

## Follow-up

- When does memoization leak memory, and how would you bound the cache (LRU, TTL, `WeakMap`)?
- How would you memoize a function that takes several arguments? (See *Memoize II*.)
- How would you memoize an async function so that concurrent calls share one request?
