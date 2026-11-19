## TL;DR

`useReducer(reducer, initialArg, init?)` manages state with a **pure function `(state, action) => newState`** and returns `[state, dispatch]`. Instead of calling setters with new values, you **dispatch actions that describe what happened**, and the reducer decides how state changes. Reach for it when state has **several related fields, transitions depend on the previous state, or many event handlers update the same state**. It centralizes the logic, is easy to unit test, and `dispatch` is **stable**, so it's cheap to pass down (often via context).

## Example

```jsx
const initialState = { status: 'idle', items: [], error: null };

function reducer(state, action) {
  switch (action.type) {
    case 'fetch_started':
      return { ...state, status: 'loading', error: null };
    case 'fetch_succeeded':
      return { status: 'success', items: action.items, error: null };
    case 'fetch_failed':
      return { ...state, status: 'error', error: action.error };
    case 'item_removed':
      return { ...state, items: state.items.filter(i => i.id !== action.id) };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

function Inventory() {
  const [state, dispatch] = useReducer(reducer, initialState);
  // dispatch({ type: 'item_removed', id: 42 })
}
```

Compare this with four `useState` calls updated in several handlers. With separate setters it's easy to forget to reset `error` or end up in an impossible combination (`status: 'success'` together with an `error`). The reducer makes every transition explicit.

## useState vs useReducer

| Prefer `useState` | Prefer `useReducer` |
|---|---|
| Independent, simple values | Several fields that change together |
| Few update sites | Many handlers update the same state |
| Next value doesn't depend on complex logic | Transitions follow rules (a state machine) |
| | You want to test the logic without rendering |

They're interchangeable in power. `useState` is implemented on top of the same mechanism.

## Useful details

- **Lazy initialization:** `useReducer(reducer, props.userId, createInitialState)` calls `createInitialState(userId)` only on the first render.
- **Stable `dispatch`:** safe to omit from dependency arrays and ideal to pass via context. Put `dispatch` in its own context so components that only dispatch never re-render on state changes.
- **Bail-out:** if the reducer returns the same state object (`Object.is`), React may skip re-rendering children.
- **Batching:** multiple dispatches in one event are batched (automatic batching in React 18+) and processed in order.
- **Reading the new state right after `dispatch`** gives you the old value. State is a snapshot. Compute `reducer(state, action)` yourself if you need it immediately.

## Pitfalls

- **Mutating state in the reducer** (`state.items.push(x); return state;`). React sees the same reference and may not re-render. Use spreads or Immer (`useImmerReducer`).
- **Side effects in the reducer** (fetching, logging, `Date.now()`, random ids). Reducers must be pure, and Strict Mode calls them twice in development to expose this. Do side effects in handlers or effects, and pass generated values in the action.
- **Action naming:** describe events (`'item_removed'`), not setters (`'set_items'`). That keeps logic in the reducer.
- **It's not a global store.** Each `useReducer` call is local state. For app-wide state, combine it with context or use an external store.

## In an interview, mention…

- Pure reducer + action dispatch = centralized, testable state transitions.
- When it beats `useState` (related fields, complex transitions) and that it prevents impossible states.
- `dispatch` stability and the state/dispatch context split.
- Purity rules, Strict Mode double invocation, and immutable updates.
