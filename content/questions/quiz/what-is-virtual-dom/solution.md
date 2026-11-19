## TL;DR

The "virtual DOM" is the **in-memory tree of lightweight JavaScript objects (React elements) that describes what the UI should look like**. When state changes, React builds a new description, **compares it with the previous one** (reconciliation), and **applies only the necessary changes to the real DOM**. Its main value isn't raw speed. It enables the **declarative model**: you write "render this for this state" and React handles the imperative DOM updates. React's own docs now rarely use the term. They talk about **elements, rendering, reconciliation and fibers** instead.

## The idea

```jsx
function Badge({ count }) {
  return <span className="badge">{count}</span>;
}
// count = 3 produces { type: 'span', props: { className: 'badge', children: 3 } }
// count = 4 produces { type: 'span', props: { className: 'badge', children: 4 } }
```

React compares the two descriptions: same type and same `className`, only the text differs. So the only DOM operation is updating one text node, not re-creating the `<span>`.

Without this layer, a declarative "re-render everything" approach would mean rebuilding DOM subtrees on every change (slow, and it loses focus, selection and scroll position), and an imperative approach would mean writing the update code yourself (error-prone).

## What it is and isn't

- It **is** a description layer: plain objects that are cheap to create and compare.
- It **isn't** a copy of the browser's DOM. Elements carry only type, props and key, not layout or computed styles.
- It **isn't** inherently faster than direct DOM manipulation. Hand-written, targeted DOM updates are faster. The virtual DOM is "fast enough" while giving you a much better programming model.
- It **isn't** a separate thing from React's internal fiber tree. Elements are the input. Fibers are React's mutable work units that hold state, effects and the link to DOM nodes.

## Other benefits of the abstraction

- **Renderer independence:** the same element trees drive `react-dom`, React Native, `react-three-fiber`, PDF renderers and terminal UIs (Ink).
- **Server rendering:** elements can be turned into HTML strings or streams on the server.
- **Scheduling:** because rendering produces descriptions rather than mutating the DOM directly, React can pause, prioritize and discard render work (concurrent rendering) and commit only finished results.

## Criticisms and alternatives

- **Overhead:** creating and diffing element trees costs CPU and memory, and big trees re-rendering often need memoization (or the React Compiler).
- **Compile-time and fine-grained reactivity:** Svelte compiles components to direct DOM updates, and Solid and Vue Vapor use signals to update exactly the affected nodes without diffing. These show the virtual DOM is one design choice, not a requirement for declarative UI.
- React's answer is to optimize *what* re-renders (the Compiler, Server Components that never re-render on the client) rather than drop the model.

## In an interview, mention…

- It's a declarative description diffed against the previous one, producing minimal DOM updates.
- The value is the programming model and renderer independence, not raw speed.
- Elements vs fibers, and that react.dev talks about rendering and reconciliation rather than "virtual DOM".
- Alternatives (compilers, signals) and React's direction (Compiler, RSC).
