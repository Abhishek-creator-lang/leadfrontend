## TL;DR

Flux is an application architecture Facebook introduced alongside React. It enforces **unidirectional data flow**: **Views** emit **Actions** (plain objects describing what happened), a single **Dispatcher** sends every action to the **Stores**, stores update their state and notify subscribed views, and views re-render. Because state changes only in response to actions, and only inside stores, data flow is **predictable, traceable and debuggable**. That fixed the cascading-update bugs of two-way-bound MVC. Redux is the best-known descendant (a single store plus pure reducers), and `useReducer` brings the same idea into components.

## The cycle

```
View --(user event)--> Action --> Dispatcher --> Store(s) --(change event)--> View
```

- **Action:** `{ type: 'todo/added', payload: { text } }`. It describes the event, not how to change state.
- **Dispatcher:** a central hub. Every action goes to every store. It forbids dispatching during a dispatch, which prevents cascades.
- **Store:** holds state and the logic to update it in response to actions. It exposes getters but no setters.
- **View:** subscribes to stores, renders, and creates actions from user input.

## The problem it solved

In classic MVC with two-way binding, a model change could update a view, which updated another model, which updated another view. Facebook's notorious example was the chat unread-count badge that kept reappearing. With many bidirectional links, it was hard to know *why* something changed. Flux makes every change pass through one choke point with a named action.

## Redux as "Flux, simplified"

```js
function todosReducer(state = [], action) {
  switch (action.type) {
    case 'todo/added':
      return [...state, { id: action.payload.id, text: action.payload.text, done: false }];
    case 'todo/toggled':
      return state.map(t => (t.id === action.payload ? { ...t, done: !t.done } : t));
    default:
      return state;
  }
}
```

- One store instead of many, and pure reducers instead of store classes, so there's no dispatcher.
- Immutability enables time-travel debugging, action logs, and replaying bugs.
- Modern Redux Toolkit removes the boilerplate (`createSlice`, Immer-based "mutations", RTK Query for server state).

## Benefits

- **Predictability:** state changes only via actions, so you can log, replay and test them.
- **Single source of truth** for shared state, and views stay simple.
- **Debuggability:** Redux DevTools shows each action and the resulting state diff.
- **Decoupling:** many views can react to the same action without knowing about each other.
- **Testability:** reducers are pure functions.

## Costs

- Indirection and boilerplate for simple local state.
- Global stores attract state that should be local or that is really server cache.
- Selector discipline is needed to avoid unnecessary re-renders.

## Where it stands today

Much "global state" turned out to be **server cache**, now handled by TanStack Query, RTK Query, SWR or framework loaders and Server Components. For client state, teams choose between `useState`/`useReducer` + context, lighter stores (Zustand, Jotai), or Redux Toolkit for large apps that benefit from strict conventions and devtools. The **one-way data flow principle** remains central to React itself.

## In an interview, mention…

- The four parts and the unidirectional cycle.
- The problem it solved: cascading two-way updates that are hard to trace.
- Redux as the evolution, and `useReducer` as the same idea locally.
- Separating server cache from client state when choosing a tool today.
