## Approach: store registrations, not functions

The first version of an emitter stores bare functions. That breaks down once we need per-registration handles and `once`: if the same function is registered twice, which one does a handle remove? The fix is to store a **registration object** per call:

```js
{ listener, once: boolean, active: true }
```

- `on`/`once` push a new registration into `Map<eventName, Registration[]>` and return a handle whose `unsubscribe` closes over **that object**.
- `remove(eventName, registration)` sets `active = false`, removes the object by identity, and deletes the map key when the array becomes empty.
- `off(eventName, listener)` removes every registration whose `listener` matches. `off(eventName)` removes them all. Both mark the registrations inactive.
- `emit` iterates over a **snapshot** of the array and skips any registration that is no longer `active`.

### Why both a snapshot and an `active` flag?

They solve two different problems:

1. **The snapshot** stops listeners *added* during `emit` from running in that pass, and stops `splice` from shifting indices under the loop.
2. **The `active` flag** means a registration *removed* during `emit` is skipped even though it's still in the snapshot. Without the flag, a listener that unsubscribes a later listener would still see that later listener called, which surprises people. The DOM behaves like this flag: `removeEventListener` during dispatch prevents not-yet-called listeners from running. (Node takes the other approach and keeps the snapshot as-is. Either is defensible, but you should pick one and state it.)

### `once` and re-entrancy

A `once` registration is removed **before** the listener is called. If it were removed afterwards and the listener emitted the same event, the nested `emit` would see the registration still active and call it again, possibly recursing forever. Remove first, then call.

## Complexity

| Operation | Time |
|---|---|
| `on` / `once` | O(1) |
| `unsubscribe` | O(k) to find the object in the array (O(1) with a `Set` of registrations) |
| `off` | O(k) |
| `emit` | O(k) |

Using a `Set` instead of an array gives O(1) removal and still iterates in insertion order. The array is used here because it reads more clearly in an interview.

## Edge cases

- **Double `unsubscribe()`:** the second call finds `active === false` and returns.
- **`off(event, fn)` after `once(event, fn)`:** removed, because we compare against the original listener, not a wrapper. Implementations that wrap `once` listeners must store the original (Node uses `wrapper.listener`).
- **`emit` returning `true`:** only if some listener actually ran. If every registration was removed mid-emit before running, it returns `false`.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `unsubscribe` implemented as `off(event, listener)` | Unsubscribing one handle removes *every* registration of that function |
| Removing a `once` listener after calling it | Re-entrant emits call it twice |
| No `active` check | Listeners removed during emit still run |
| Storing listeners in `{}` | Events named `constructor` or `__proto__` break |

## Real-world connection

- **React:** `useSyncExternalStore(subscribe, getSnapshot)` expects `subscribe` to return an unsubscribe function, which is exactly this handle style. In a `useEffect`, return `() => sub.unsubscribe()` so unmounting removes the listener.
- **Redux:** `store.subscribe(listener)` returns `unsubscribe`, and Redux also snapshots listeners before notifying.
- **RxJS:** `subscribe()` returns a `Subscription` with `unsubscribe()`.
- **DOM:** `addEventListener(type, fn, { once: true, signal })` gives `once` and an `AbortSignal` that removes many listeners at once, which is a neat alternative to handles.

## Follow-ups

- **Wildcard listeners:** store them under a reserved key and call them with `(eventName, ...args)` after the specific listeners.
- **Error isolation:** catch errors per listener and report them asynchronously so one bad subscriber doesn't block the rest.
- **Async emit:** `emitAsync` that awaits each listener in order, or `Promise.all`s them, for plugin systems like webpack's Tapable hooks.
