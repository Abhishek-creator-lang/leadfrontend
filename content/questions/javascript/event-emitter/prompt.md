Implement an `EventEmitter` class. Code can subscribe to named events with `on`, unsubscribe with `off`, and trigger every subscriber of an event with `emit`.

```js
const emitter = new EventEmitter();

function greet(name) {
  console.log(`Hello, ${name}`);
}

emitter.on('join', greet);
emitter.emit('join', 'Ada');   // logs "Hello, Ada", returns true
emitter.off('join', greet);
emitter.emit('join', 'Grace'); // logs nothing, returns false
```

## API

| Method | Behaviour |
|---|---|
| `on(eventName, listener)` | Adds `listener` to the end of the list for `eventName`. Returns the emitter so calls can be chained. |
| `off(eventName, listener)` | Removes **one** registration of `listener`: the most recently added one. Unknown events or listeners are ignored. Returns the emitter. |
| `emit(eventName, ...args)` | Calls every listener for `eventName` synchronously, in registration order, with `args`. Returns `true` if the event had listeners, otherwise `false`. |

## Requirements

- The same function can be registered more than once and is then called once per registration.
- Listeners are called with `this` set to the emitter.
- Adding or removing listeners **during** an `emit` must not affect the listeners called by that `emit`.
- Event names can be any string. Events must not collide with properties inherited from `Object.prototype` (an event called `"toString"` or `"constructor"` must work).

## Follow-up

- How would you add `once`?
- What happens if a listener throws? Should the remaining listeners still run?
- Why do long-lived emitters cause memory leaks in single-page apps, and how do you prevent them?
