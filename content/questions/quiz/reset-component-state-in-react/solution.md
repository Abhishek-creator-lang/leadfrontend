## TL;DR

React keeps a component's state **as long as the same component type is rendered at the same position in the tree**. To reset it, make React see a **different identity**: the idiomatic way is **changing its `key`** (`<Form key={userId} />`), which unmounts the old instance and mounts a fresh one. Other options: render it at a different position, explicitly set state back to initial values (often via a reducer `reset` action), or, for forms, `form.reset()` / React 19 form Actions, which reset uncontrolled fields automatically.

## 1. Change the key (most common)

```jsx
function Inbox({ contactId }) {
  return <ChatDraft key={contactId} contactId={contactId} />;
}

function ChatDraft({ contactId }) {
  const [text, setText] = useState('');
  // When contactId changes, this is a brand-new instance: text resets to ''
  return <textarea value={text} onChange={e => setText(e.target.value)} />;
}
```

This replaces the anti-pattern of syncing with an effect:

```jsx
// Avoid: renders once with stale state, then resets, and is easy to get wrong
useEffect(() => { setText(''); }, [contactId]);
```

Remember that a key change **remounts the whole subtree**: child state is lost, effects clean up and re-run, and DOM nodes are recreated. That's correct for "this is a different entity" and wasteful for big trees that only need one field reset.

## 2. Position in the tree

```jsx
{isPlayerA ? <Counter key="a" /> : <Counter key="b" />}
// or
{isPlayerA && <Counter />}
{!isPlayerA && <Counter />}
```

Two `<Counter />`s in the same JSX slot of a ternary *without keys* **share state**, because same type at the same position means the same instance. Rendering them in different slots, or giving them keys, separates them.

## 3. Reset explicitly

```jsx
const initial = { name: '', email: '' };
function reducer(state, action) {
  switch (action.type) {
    case 'changed': return { ...state, [action.field]: action.value };
    case 'reset':   return initial;
  }
}
```

Use this when only part of the state should reset, or when you want to keep the DOM (and focus or scroll position).

## 4. Adjusting state when a prop changes (rare)

If you need to reset *some* state in response to a prop change without remounting, react.dev describes storing the previous prop and updating state during render:

```jsx
const [prevId, setPrevId] = useState(id);
if (id !== prevId) {
  setPrevId(id);
  setSelection(null);
}
```

React re-renders immediately without committing the stale output. It's better than an effect, but a `key` is usually clearer.

## 5. Forms

- Uncontrolled inputs: `formRef.current.reset()` restores `defaultValue`s.
- React 19: when a `<form action={fn}>` Action succeeds, React **automatically resets uncontrolled fields**. `requestFormReset(form)` from `react-dom` triggers that manually.

## Pitfalls

- Using `key={Math.random()}` resets on **every** render.
- Resetting by key when the parent also needs that state. Lift state up instead.
- Forgetting that changing a component's **type** (e.g. `<div>` → `<section>` wrapping it) also resets everything below.

## In an interview, mention…

- State is tied to type plus position (plus key).
- `key` as the idiomatic reset tool, and why the effect-based reset is an anti-pattern.
- The cost of remounting vs a targeted reducer reset.
- React 19's automatic form reset with Actions.
