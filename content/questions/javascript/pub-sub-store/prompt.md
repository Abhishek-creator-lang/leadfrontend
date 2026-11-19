Implement `createStore(reducer, preloadedState)`, a minimal version of Redux's store.

A **reducer** is a pure function `(state, action) => nextState`. The store holds the current state, runs the reducer on every dispatched action, and notifies subscribers afterwards.

```js
function counter(state = { count: 0 }, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + (action.by ?? 1) };
    default:
      return state;
  }
}

const store = createStore(counter);
store.getState(); // { count: 0 }

const unsubscribe = store.subscribe(() => console.log(store.getState()));
store.dispatch({ type: 'increment' });         // logs { count: 1 }
store.dispatch({ type: 'increment', by: 5 });  // logs { count: 6 }
unsubscribe();
```

## API

| Member | Behaviour |
|---|---|
| `createStore(reducer, preloadedState?)` | Creates the store and immediately dispatches an internal init action `{ type: '@@store/INIT' }`, so the reducer can supply its default state when `preloadedState` is `undefined`. |
| `getState()` | Returns the current state. |
| `dispatch(action)` | Runs the reducer, stores the result, calls every listener with no arguments, then returns `action`. |
| `subscribe(listener)` | Adds a listener and returns an `unsubscribe` function. Calling `unsubscribe` more than once is safe. |

## Requirements

- `dispatch` throws a `TypeError` if `action` is not a plain object or has an `undefined` `type`.
- `dispatch` throws an `Error` if it's called **while a reducer is running** (reducers must be pure).
- Listeners are notified after **every** dispatch, in subscription order.
- Changes to the listener list during a dispatch (subscribe or unsubscribe inside a listener) take effect from the **next** dispatch.
- The same function subscribed twice is called twice.

## Follow-up

- Why must reducers return a **new** object rather than mutating `state`?
- How does `react-redux` avoid re-rendering every component on every dispatch?
- How would you add middleware support (`applyMiddleware`)?
