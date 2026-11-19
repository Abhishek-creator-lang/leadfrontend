## TL;DR

Common anti-patterns: **storing derived data in state** and syncing it with effects, **using effects for event logic** ("you might not need an effect"), **mutating state or props**, **unstable or index keys** in dynamic lists, **defining components inside other components**, **copying props into state**, **giant components and contexts**, **premature or blanket memoization** (or none where it matters), **prop drilling through many layers**, **fetching in effects without cleanup or caching**, **calling hooks conditionally**, and **side effects during render**. Most trace back to fighting React's model of **pure rendering from minimal state**.

## Derived state + syncing effects

```jsx
// Anti-pattern
const [fullName, setFullName] = useState('');
useEffect(() => setFullName(`${first} ${last}`), [first, last]);

// Better: compute during render
const fullName = `${first} ${last}`;
```

The effect version renders twice, briefly shows stale data, and creates two sources of truth.

## Effects for event-driven logic

```jsx
// Anti-pattern: reacting to a state change you caused yourself
useEffect(() => { if (submitted) post('/api', form); }, [submitted]);

// Better: do it in the handler
async function handleSubmit() { await post('/api', form); }
```

Effects are for **synchronizing with external systems**, not for chaining state updates.

## Components defined inside components

```jsx
function List({ items }) {
  function Row({ item }) { return <li>{item.name}</li>; } // new component type each render
  return items.map(i => <Row key={i.id} item={i} />);
}
```

Every render creates a new `Row` type, so React unmounts and remounts all rows: state and focus are lost, and it's slow. Define components at module level.

## Copying props into state

`useState(props.value)` only reads the initial value and then drifts. Either use the prop directly, name it `initialValue`, or reset with a `key`.

## Mutation

`state.items.push(x); setItems(state.items)` doesn't re-render reliably and breaks memoization. Create new objects.

## Keys

Index keys in reorderable lists, or `key={Math.random()}`, cause wrong state and remounts.

## God components and god contexts

A 1,000-line component with fifteen `useState`s, or one context holding everything, re-renders too much and is hard to change. Split by responsibility, colocate state with where it's used, and use reducers for related state.

## Memoization extremes

Wrapping everything in `useMemo`/`useCallback`/`memo` adds noise and cost. Ignoring obvious hot paths (a 5,000-row table re-rendering on every keystroke) is the opposite problem. Profile first. With the React Compiler, manual memoization is largely unnecessary.

## Side effects in render

Subscribing, setting timers, mutating globals, or calling `setState` unconditionally during render. Strict Mode exists to surface these.

## Other frequent ones

- `useEffect(async () => …)` (an async function returns a promise, not a cleanup).
- Overusing refs to bypass React (reading the DOM to decide what to render).
- `dangerouslySetInnerHTML` with unsanitized input.
- Huge prop lists ("boolean prop explosion") instead of composition (`children`, slots, compound components).
- Global stores for server data instead of a query cache.
- Suppressing `exhaustive-deps` instead of fixing the closure.

## In an interview, mention…

- The root principle: minimal state, pure render, and effects only for external sync.
- Two or three concrete examples with fixes (derived state, nested component definitions, effect chains).
- Tooling that prevents them: ESLint hooks rules, Strict Mode, the React Compiler's diagnostics, code review checklists.
- As a lead, how you'd spread these practices across a team: docs, lint rules, examples.
