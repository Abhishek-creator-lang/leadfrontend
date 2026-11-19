Implement `cacheAsync(fn, options)`. It wraps an async function so that:

1. **Concurrent calls are deduplicated.** If a call with the same key is already in flight, return the *same* promise instead of calling `fn` again.
2. **Successful results are cached** for `ttl` milliseconds after they resolve.
3. **Failures are not cached.** If the promise rejects, the entry is removed so the next call tries again.

```js
const getUser = cacheAsync((id) => fetch(`/api/users/${id}`).then((r) => r.json()), { ttl: 5000 });

const a = getUser(1);
const b = getUser(1); // no second request: b === a
const c = getUser(2); // different key, so a new request

await a;
getUser(1); // still cached for 5 seconds after `a` resolved
```

## Options

| Option | Default | Meaning |
|---|---|---|
| `ttl` | `Infinity` | How long, in ms, a resolved value stays cached. The clock starts when the promise **resolves**. |
| `key` | `(...args) => JSON.stringify(args)` | Builds the cache key from the arguments. |

## Requirements

- The wrapper returns a promise every time, even if `fn` returns a plain value or throws synchronously.
- Calls with the same key return the identical promise object while the entry is valid.
- `fn` is called with the original arguments and `this`.
- The wrapper exposes:
  - `clear()`: drops every entry.
  - `delete(...args)`: drops the entry for those arguments.
- An entry that was replaced or deleted while its promise was in flight must not be removed by that old promise when it later rejects.

## Follow-up

- How would you implement *stale-while-revalidate*: return the stale value immediately and refresh in the background?
- How would you bound the cache size?
- When is `JSON.stringify(args)` a poor key?
