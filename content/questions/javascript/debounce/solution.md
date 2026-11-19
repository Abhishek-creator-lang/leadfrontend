## Approach

A debounced function needs to remember three things across calls, and a closure holds them:

1. `timeoutId`, the pending timer, so a new call can cancel it.
2. `lastArgs` and `lastThis`, the arguments and `this` from the **latest** call, so they are forwarded when the timer fires.

Each call to `debounced` stores the new arguments and context, clears the existing timer, and starts a new one. When the burst stops for `wait` ms, the last timer survives and calls `invoke`. `invoke` calls `func.apply(lastThis, lastArgs)`.

## Why a `function` and not an arrow function?

`debounced` must be a regular `function` so that `this` is whatever the caller supplied, for example `obj.method()`. An arrow function would capture `this` from where `debounce` was defined, which breaks method usage. `func.apply(context, args)` passes that context through.

## `cancel` and `flush`

- `cancel` clears the timer and the stored arguments. Clearing the arguments matters: if a stale `lastArgs` stays around, a later `flush` would wrongly fire it.
- `flush` uses `timeoutId === null` to tell whether a call is pending. If one is, it clears the timer and calls `invoke` synchronously. `invoke` resets the state, so a second `flush` does nothing.

## Complexity

Each call is O(1) time and O(1) extra space, since only the latest arguments are kept.

## Edge cases and common mistakes

| Mistake | Consequence |
|---|---|
| Arrow function for `debounced` | `this` is wrong when it's used as a method |
| Forwarding the *first* call's arguments | Search boxes query stale text |
| Not resetting state in `cancel` | `flush()` after `cancel()` fires a stale call |
| `setTimeout(func(...args), wait)` | Calls `func` immediately and passes its return value to `setTimeout` |
| Creating the debounced function inside a React render | A new timer every render, so it never actually debounces |

## Debounce vs throttle

- **Debounce** waits for quiet. A continuous stream of events produces **zero** calls until it stops. Use it for search input, autosave, and resize-end.
- **Throttle** limits the rate. A continuous stream produces a call at most every `wait` ms. Use it for scroll position, drag and drop, and analytics pings.

## Using it in React

```jsx
function Search() {
  const [query, setQuery] = useState('');
  // Create it once. The ref keeps the latest fetch logic without recreating the timer.
  const fetchRef = useRef();
  fetchRef.current = (q) => fetchResults(q);
  const debouncedFetch = useMemo(() => debounce((q) => fetchRef.current(q), 300), []);
  useEffect(() => () => debouncedFetch.cancel(), [debouncedFetch]); // cleanup on unmount

  return (
    <input
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
        debouncedFetch(e.target.value);
      }}
    />
  );
}
```

At a senior level, also mention that debouncing doesn't solve **response races**. A slow response for `"re"` can still arrive after the response for `"react"`. Pair debouncing with an `AbortController` or a "latest request id" check.

## Follow-ups interviewers ask

- **`leading: true`:** call immediately when no timer is pending, then ignore further calls until `wait` ms of quiet have passed.
- **`maxWait`:** guarantees a call at least every `maxWait` ms during a long burst. lodash's `throttle` is built on `debounce` with `maxWait`.
- **Returning a promise** that resolves with `func`'s result. Every caller in the burst should receive the same promise.
