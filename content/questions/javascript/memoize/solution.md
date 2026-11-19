## Approach

1. Create a `Map` in the closure and attach it to the returned function as `memoized.cache`.
2. On each call, compute the key: `resolver ? resolver.apply(this, args) : args[0]`.
3. If `cache.has(key)`, return `cache.get(key)`.
4. Otherwise compute `func.apply(this, args)`, store it and return it.

## Why `Map` and not a plain object?

An object coerces every key to a string, so `memoize(f)(1)` and `memoize(f)('1')` collide, and every object argument becomes the same key, `'[object Object]'`. It also inherits keys from `Object.prototype`, so `cache['constructor']` is already "set". A `Map` keeps keys as they are and uses SameValueZero, which also makes `NaN` work as a key.

## Why `has` and not `get(...) !== undefined`?

A function can legitimately return `undefined`. Checking the value would turn those results into permanent cache misses.

## Complexity

A hit or a miss costs O(1) on average for the lookup, plus the cost of `func` on a miss. Space grows by O(1) per distinct key and is **unbounded** by default.

## Edge cases

- **Object arguments:** compared by reference, so two equal-looking objects are two entries. Use a `resolver` to build a value-based key.
- **Errors:** if `func` throws, nothing is cached and the error propagates.
- **`this`:** forwarded to both `resolver` and `func`. Note that the default key ignores `this`, so a memoized method shared across instances shares a cache.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Plain object cache | `1` and `'1'` collide, every object maps to one key |
| `if (cache.get(key))` | Falsy results such as `0`, `''` or `undefined` are recomputed |
| `JSON.stringify(args)` as the default key | Slow, drops functions and `undefined`, fails on cycles, and ignores object identity |
| Forgetting `this` | Memoized methods break |
| Unbounded cache in a long-lived app | Memory leak |

## Follow-ups

- **Bounded caches:** an LRU cache evicts the least recently used entry (a `Map` preserves insertion order, so delete and re-insert on each hit). A TTL suits data that goes stale.
- **`WeakMap`:** for object keys, a `WeakMap` cache lets entries be garbage-collected along with the key.
- **Async functions:** cache the promise so concurrent callers share one request, and delete the entry on rejection so failures are retried.
- **React:** `useMemo` memoizes one value per component instance and dependency list. It is a cache of size one, not a general memoizer. `React.memo` memoizes rendering based on props.
