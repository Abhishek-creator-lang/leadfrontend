## Approach

Store listeners in a `Map<eventName, Function[]>`.

- **`on`** gets or creates the array for the event and pushes the listener. Return `this` for chaining.
- **`off`** finds the listener with `lastIndexOf` and `splice`s out that single entry. When the array becomes empty, delete the key so the map doesn't keep growing with dead events.
- **`emit`** copies the array (`[...listeners]`) and calls each listener with `listener.apply(this, args)`. It returns whether there were any listeners.

### Why a `Map` and not `{}`?

A plain object inherits from `Object.prototype`, so `this.events['toString']` is already a function before anyone subscribes. `emit('toString')` would then try to iterate over a function. A `Map`, or `Object.create(null)`, has no inherited keys. `Map` also accepts symbols and any other value as event names and has an O(1) `size`.

### Why copy before iterating?

Consider a listener that removes itself (a hand-rolled `once`). If `emit` iterates the live array, `splice` shifts later items left and the loop **skips** the next listener. A listener that adds another listener during `emit` would make the new one run immediately, or even loop forever. Iterating over a snapshot gives the rule that Node.js and the DOM both follow: the set of listeners is fixed when the event is dispatched.

## Complexity

| Operation | Time |
|---|---|
| `on` | O(1) |
| `off` | O(k), where k is the listener count for that event |
| `emit` | O(k) for the snapshot and the calls |

## Edge cases

- Duplicate registrations are allowed and each one fires. `off` removes one at a time, the most recent first, which matches Node's `removeListener`.
- `off` for an unknown event or listener is a no-op.
- `emit` with no listeners returns `false` and doesn't create an entry.
- Arguments are forwarded unchanged, including `undefined` and multiple values.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `this.events = {}` | `emit('constructor')` breaks |
| `filter(fn => fn !== listener)` in `off` | Removes *all* duplicate registrations instead of one |
| Iterating the live array in `emit` | Self-removing listeners cause the next listener to be skipped |
| Arrow-function listeners called with `fn(...args)` | `this` is not the emitter; usually harmless, but it doesn't match Node |
| Never deleting empty arrays | Memory slowly grows in long-lived emitters with dynamic event names |

## Errors in listeners

In this implementation, a throwing listener stops the loop and the error propagates to whoever called `emit`. That matches Node. The DOM does it differently: `dispatchEvent` reports the error (`window.onerror`) and **keeps calling** the other listeners. If you want DOM-like isolation, wrap each call in `try/catch` and rethrow asynchronously (`queueMicrotask(() => { throw error; })`) so the error is still reported.

## Real-world connection

- Node's `events.EventEmitter` underlies streams, `http.Server` and `process`.
- The DOM's `EventTarget` is the browser equivalent (with capture/bubble phases on top).
- Socket.IO clients, the Electron IPC renderer and many SDKs expose emitter APIs.
- In React, subscribing to an emitter in `useEffect` **must** return a cleanup that calls `off`. Forgetting it is the most common SPA memory leak: each mount adds a listener that keeps the unmounted component's closure alive. `useSyncExternalStore` is designed for subscribing to stores built like this.

## Follow-ups

- **`once`:** wrap the listener in a function that removes itself and then calls the original. Store the original on the wrapper so `off(event, original)` still works. See *Event Emitter II*.
- **Unsubscribe handles:** have `on` return `{ unsubscribe }` or a function, which is easier to use than `off` with the same reference.
- **Wildcard events or namespaces:** `'user.*'` matching is how libraries like `mitt` and EventEmitter2 extend this.
- **Max listeners warning:** Node warns when more than 10 listeners are added to one event, as a hint of a leak.
