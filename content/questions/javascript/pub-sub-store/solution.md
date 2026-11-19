## Approach

The store is a closure over three variables:

- `state`: the current state.
- `listeners`: the subscriber list.
- `isDispatching`: a guard flag that is `true` while the reducer runs.

### `dispatch`

1. Validate the action: it must be a plain object (prototype is `Object.prototype` or `null`) with a defined `type`. Redux is strict here because thunks and promises dispatched without middleware are a common bug, and a clear error beats silent weirdness.
2. If `isDispatching` is set, throw. A reducer that dispatches would recurse into a half-updated state.
3. Set the flag, run `state = reducer(state, action)` inside `try/finally` so a throwing reducer can't leave the store stuck with the flag on.
4. Take a **snapshot** of the listeners and call each one.
5. Return the action. Returning it is what lets middleware chains pass values back to the caller.

### `subscribe`

Push the listener and return a closure that removes **this** subscription. It uses a local `isSubscribed` flag so double calls are harmless and `indexOf` + `splice` removes one registration (if the same function is subscribed twice, each `unsubscribe` removes one).

### Why snapshot listeners?

If a listener unsubscribes itself, splicing the live array shifts the next listener into the current index and the loop skips it. A listener that subscribes a new listener would make the newcomer run in the middle of the current notification. Redux handles this with two arrays, `currentListeners` and `nextListeners`, and copies on write. Spreading the array at dispatch time is a simpler version of the same guarantee.

### Init action

Calling `dispatch({ type: '@@store/INIT' })` at creation means `reducer(undefined, init)` returns the reducer's default argument. That's how `combineReducers` lets every slice declare its own initial state. Redux uses a randomised type (`@@redux/INITx.y.z`) so no user reducer can accidentally handle it.

## Complexity

`getState` is O(1). `dispatch` is O(reducer) + O(L) for L listeners. `subscribe` is O(1); `unsubscribe` is O(L).

## Common mistakes

| Mistake | Consequence |
|---|---|
| Iterating the live listener array | Listeners skipped when one unsubscribes during notify |
| No `try/finally` around the reducer | A reducer error leaves `isDispatching` stuck, so every later dispatch throws |
| `listeners = listeners.filter(l => l !== fn)` in `unsubscribe` | Removes every duplicate registration at once |
| Passing state to listeners | Fine, but not Redux's contract; listeners call `getState()` |
| Mutating `state` in the reducer | Subscribers comparing references (`prev !== next`) see no change and don't re-render |

## Real-world connection

- **react-redux** subscribes once per `Provider`, then each `useSelector` runs its selector after every dispatch and re-renders only if the selected value changed (`===` by default). That's why reducers must return new references for changed data and keep the same reference for unchanged data. Today it's built on `useSyncExternalStore`, which needs exactly this `subscribe` / `getState` pair.
- **Zustand** is essentially this store with `setState` instead of reducers.
- **Redux Toolkit** wraps `createStore` in `configureStore` and uses Immer so you can "mutate" a draft while still producing immutable updates.

## Follow-ups

- **Middleware:** `applyMiddleware(...mws)` replaces `dispatch` with `compose(...mws.map(mw => mw({ getState, dispatch })))(store.dispatch)`. See *Middlewares*.
- **`replaceReducer`:** for code-split reducers; swap the reducer and dispatch a `@@store/REPLACE` action.
- **Batching notifications:** notify once per animation frame or per React batch when many actions are dispatched in a row.
- **Selectors with memoisation:** `reselect` avoids recomputing derived data on every dispatch.
