## TL;DR

Reconciliation is **the process React uses to work out what changed** between the previous render's tree and the new one, and therefore **which component instances to keep, update, create or destroy, and which DOM operations to perform**. It relies on two heuristics: **elements of different types produce different trees** (so the old subtree is replaced and its state lost), and **keys identify children across renders**. The practical rule is that **state is preserved while a component keeps the same type at the same position in the tree**.

## The rules

**1. Different type means remount**

```jsx
{isEditing ? <EditForm /> : <ReadOnlyView />}
```

Toggling unmounts one subtree and mounts the other. All state and DOM inside is discarded. The same happens for host elements: `<div><Counter /></div>` → `<section><Counter /></section>` remounts `Counter`, even though `Counter` itself didn't change.

**2. Same type means update**

For DOM elements, React keeps the node and patches changed attributes and styles. For components, React keeps the instance (fiber, hooks state), passes new props, and reconciles its output recursively.

**3. Children are matched by key, then by index**

```jsx
<ul>
  {items.map(item => <Row key={item.id} item={item} />)}
</ul>
```

With keys, reordering moves existing fibers and DOM nodes, and their state goes with them. Without keys (or with index keys), React matches by position, which causes wrong-row state and extra updates.

## Position, not JSX location

```jsx
function Scoreboard({ isP1 }) {
  return isP1 ? <Counter name="P1" /> : <Counter name="P2" />;
}
```

Both branches render a `Counter` at the same position, so React treats it as **the same instance**, and the score carries over when switching players. To separate them, give each a different `key` (`key="p1"`/`key="p2"`) or render them in different positions.

Conversely, a component **defined inside another component** is a new type every render, so it remounts every time:

```jsx
function Parent() {
  const Child = () => <input />; // new function identity each render, so input focus is lost on every keystroke
  return <Child />;
}
```

## Reconciliation vs commit

Reconciliation happens in the **render phase**: it's interruptible in concurrent React and produces a list of changes. The **commit phase** then applies DOM mutations synchronously, runs layout effects, and later passive effects. React may run reconciliation more than once (Strict Mode, interrupted transitions) before committing.

## Why it matters for performance

- React must re-render a component to reconcile its output, unless it can **bail out**: the same state value, or `memo` with shallow-equal props, or elements that are referentially identical (such as `children` passed from above).
- **Stable types and keys** avoid expensive remounts.
- **The React Compiler** makes bail-outs automatic by memoizing elements and props.

## Using reconciliation deliberately

- Change a `key` to **reset** a component (switching between user profiles).
- Keep structure stable across conditional branches to **preserve** state (toggle a `className` rather than swapping wrapper element types).
- Use `<Activity mode="hidden">` (React 19.2) to hide UI while preserving its state, instead of unmounting it.

## In an interview, mention…

- Type plus position (plus key) determines identity, and identity determines whether state is preserved.
- The heuristics that make diffing O(n), and their consequences (type changes remount everything below).
- Classic bugs: index keys, components defined inside components, state leaking between ternary branches.
- Render-phase reconciliation vs synchronous commit, and how keys can deliberately reset state.
