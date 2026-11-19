Implement an `EventEmitter` class whose subscriptions return **handles**, the style used by most modern libraries and by React's `useSyncExternalStore`.

```js
const emitter = new EventEmitter();

const sub = emitter.on('message', (text) => console.log(text));
emitter.once('message', (text) => console.log('first only:', text));

emitter.emit('message', 'hi');  // logs "hi" and "first only: hi"
emitter.emit('message', 'bye'); // logs "bye"

sub.unsubscribe();
emitter.listenerCount('message'); // 0
```

## API

| Method | Behaviour |
|---|---|
| `on(eventName, listener)` | Registers `listener`. Returns `{ unsubscribe() }`. |
| `once(eventName, listener)` | Like `on`, but the registration is removed right before its first call. Returns `{ unsubscribe() }`. |
| `off(eventName, listener?)` | With a listener: removes **every** registration of that function for the event (including `once` ones). Without one: removes all listeners of the event. Returns the emitter. |
| `emit(eventName, ...args)` | Calls the listeners synchronously in registration order with `this` set to the emitter. Returns `true` if any listener was called. |
| `listenerCount(eventName)` | Number of active registrations for the event. |

## Requirements

- Each call to `on`/`once` creates a **separate** registration, even for the same function. `unsubscribe()` removes exactly its own registration and is safe to call more than once.
- Listeners added during an `emit` are not called by that `emit`.
- A registration removed during an `emit` (by `unsubscribe`, `off`, or by being a `once` that already ran) is **not** called later in that same `emit`, matching how the DOM's `removeEventListener` behaves.
- A `once` listener runs at most once, even if it re-emits the same event from inside itself.
- Event names must not collide with `Object.prototype` properties.

## Follow-up

- Why is a returned handle less error-prone than `off(event, fn)`?
- How would you use this emitter from a React component without leaking listeners?
- How would you add a wildcard `'*'` listener that receives every event?
