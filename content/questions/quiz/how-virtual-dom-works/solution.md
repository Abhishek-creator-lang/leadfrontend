## TL;DR

On each update React **(1) re-runs the affected components to produce a new element tree**, **(2) diffs it against the current tree** using heuristics that make diffing **O(n)** instead of the O(n³) general tree-diff problem (**different type means replace the subtree**, **same type means update props and recurse**, and **keys match list children**), and **(3) commits the collected changes to the real DOM in one batch**. Benefits: a declarative model, batched and minimal DOM writes, cross-platform renderers, and interruptible rendering. Downsides: **memory and CPU overhead** for building and diffing trees, **unnecessary re-renders** unless you structure or memoize, and the heuristics can force **remounts** when structure changes.

## Step by step

**1. Trigger and render.** `setState` schedules an update on that component's fiber. React walks from the root, skipping unchanged subtrees, and calls the components that need re-rendering. They return new elements.

**2. Reconcile (diff).** React compares new elements with the existing fibers, child by child:

```jsx
// Before                       // After
<div>                           <div>
  <Header title="A" />            <Header title="B" />   // same type: update props, re-render Header
  <p>Hello</p>                    <section>Hello</section> // different type: destroy <p> subtree, create <section>
</div>                          </div>
```

- **Different element types** at the same position: tear down the old subtree (unmount, lose its state) and build a new one.
- **Same host type** (`div` → `div`): keep the DOM node and patch only the changed attributes.
- **Same component type:** keep the instance and state, pass new props, and recurse into its output.
- **Lists:** children are matched by **key**. Without keys, they're matched by index.

The diff produces a list of **effects**: insertions, updates, deletions and moves.

**3. Commit.** React applies all DOM mutations synchronously in one pass, attaches refs, runs layout effects, and then (after paint) runs passive effects. Because writes are batched, the browser recalculates layout once rather than after each change.

## Why the heuristics are acceptable

A fully optimal tree diff (minimum edits, including moving subtrees across levels) is cubic. React assumes:

1. Elements of different types produce different trees.
2. Developers mark stable identity among siblings with keys.

Real UIs rarely move subtrees across levels, so these rules work well and make diffing linear.

## Benefits

- **Declarative UI:** you never write the DOM update code yourself.
- **Batched, minimal mutations:** fewer layout recalculations than naive imperative code.
- **Interruptible:** since React 18, render and diff work can be split, paused for user input, and resumed (Fiber plus the scheduler). Only the commit is synchronous.
- **Platform-agnostic:** the same algorithm drives DOM, native and other renderers.

## Downsides

- **Overhead:** every update allocates elements and walks fibers, even when the output doesn't change. Large lists and frequent updates (typing, animations) can become CPU-bound.
- **Re-render cascades:** by default a parent re-render re-renders all children. You mitigate this with state colocation, `memo`, or the **React Compiler**.
- **Structural changes remount:** wrapping a component in a new element type, or toggling between branches that differ in type, destroys state.
- **Not suitable for very high-frequency visual updates.** For 60fps animations, prefer CSS or the Web Animations API, or mutate via refs.

## In an interview, mention…

- Render, diff and commit, and that only commit touches the DOM.
- The two heuristics (type and key) and why they make diffing O(n).
- Consequences: type changes remount, and keys preserve identity.
- Overheads and the mitigations: colocation, memoization, the Compiler, virtualization.
