## TL;DR

Type the **state** with an interface (often a **discriminated union** of states), type **actions as a discriminated union on `type`**, and write the reducer as `(state: State, action: Action): State`. `useReducer(reducer, initialState)` then **infers** `state: State` and `dispatch` as `React.Dispatch<Action>`, so `dispatch({ type: 'typo' })` and missing payloads are compile errors, and each `case` sees the narrowed action payload. Add an **exhaustiveness check** in `default`. With `@types/react` 19, the hook's generics changed: let inference work, or pass explicit generics in the new form.

## Actions and state

```ts
type Todo = { id: string; text: string; done: boolean };

type State = {
  todos: Todo[];
  filter: 'all' | 'active' | 'done';
};

type Action =
  | { type: 'added'; id: string; text: string }
  | { type: 'toggled'; id: string }
  | { type: 'removed'; id: string }
  | { type: 'filterChanged'; filter: State['filter'] }
  | { type: 'cleared' };

function assertNever(x: never): never {
  throw new Error(`Unhandled action: ${JSON.stringify(x)}`);
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'added':
      return { ...state, todos: [...state.todos, { id: action.id, text: action.text, done: false }] };
    case 'toggled':
      return {
        ...state,
        todos: state.todos.map(t => (t.id === action.id ? { ...t, done: !t.done } : t)),
      };
    case 'removed':
      return { ...state, todos: state.todos.filter(t => t.id !== action.id) };
    case 'filterChanged':
      return { ...state, filter: action.filter };
    case 'cleared':
      return { ...state, todos: state.todos.filter(t => !t.done) };
    default:
      return assertNever(action);
  }
}
```

## Using it

```tsx
const initialState: State = { todos: [], filter: 'all' };

function Todos() {
  const [state, dispatch] = useReducer(reducer, initialState);

  dispatch({ type: 'added', id: crypto.randomUUID(), text: 'Ship it' }); // OK
  dispatch({ type: 'added' });           // error: id and text missing
  dispatch({ type: 'toggle', id: '1' }); // error: did you mean 'toggled'?
}
```

Annotating `initialState: State` matters. Otherwise `filter: 'all'` might be inferred as `string`, depending on context.

## Lazy init

```ts
function init(userId: string): State {
  return { todos: loadTodos(userId), filter: 'all' };
}
const [state, dispatch] = useReducer(reducer, props.userId, init);
```

The second argument's type flows into `init`'s parameter.

## Passing dispatch around

```tsx
type TodosDispatch = React.Dispatch<Action>;
const TodosDispatchContext = createContext<TodosDispatch | null>(null);
```

Typed dispatch through context gives every component compile-time checking of the actions it sends.

## Typing state as a state machine

```ts
type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };
```

The reducer can then refuse invalid transitions (`if (state.status !== 'loading') return state;`), and the UI narrows on `status`.

## @types/react 19 note

The overloads of `useReducer` were simplified. The generic is now the **state and action-argument tuple**, not the reducer type, so old explicit forms like `useReducer<React.Reducer<State, Action>>(…)` break. The fix is usually to **remove explicit generics** and rely on inference from a typed reducer function.

## Pitfalls

- Actions typed as `{ type: string; payload?: any }` lose all safety.
- Returning `undefined` from a case (forgotten `return`). An explicit `State` return type catches it.
- Mutating `state` inside the reducer. Types don't prevent it unless you use `Readonly<State>`/`ReadonlyArray`. Consider Immer for deep updates.

## In an interview, mention…

- Discriminated-union actions, narrowing per case, and `assertNever` exhaustiveness.
- Inference of `state` and `dispatch` from a typed reducer, annotating initial state, and lazy init typing.
- `React.Dispatch<Action>` for context.
- The `@types/react` 19 generic change: prefer inference.
