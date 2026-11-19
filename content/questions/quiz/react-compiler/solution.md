## TL;DR

The **React Compiler** is a **build-time optimizer** (a Babel plugin, also available for SWC-based setups and integrated into frameworks such as Next.js and Expo) that analyzes components and hooks and **automatically memoizes** values, callbacks and JSX. In effect it inserts fine-grained `useMemo`/`useCallback`/`memo` for you, often more precisely than you would by hand, even after early returns where manual hooks aren't allowed. **v1.0 was released as stable in October 2025** and works with React 17, 18 and 19 (older versions need `react-compiler-runtime`). It relies on your code following the **Rules of React** (pure render, immutable props and state, rules of hooks). Code that breaks them is **skipped**, not miscompiled, and the ESLint plugin reports why.

## What it does

```jsx
function ProductList({ products, filter, onSelect }) {
  const visible = products.filter(p => p.category === filter);
  return (
    <ul>
      {visible.map(p => (
        <Row key={p.id} product={p} onClick={() => onSelect(p.id)} />
      ))}
    </ul>
  );
}
```

Without the compiler, any parent re-render re-runs the filter and recreates every `onClick`, so memoized rows still re-render. The compiler rewrites the component to cache `visible` (keyed on `products` and `filter`) and the rendered JSX, so unrelated parent re-renders reuse the previous output. Conceptually it's like memoizing every reactive scope automatically, using an internal cache array (`useMemoCache`).

## What it changes for developers

- **Manual memoization becomes mostly unnecessary.** New code can skip `useMemo`/`useCallback`/`memo` in the common case. Existing ones can stay. The compiler works alongside them, but removing them carelessly can change effect dependency behaviour, so do it gradually and with tests.
- **Rules matter more.** Mutating props, reading refs during render, or side effects in render make the compiler bail out of that component (and they were already bugs in concurrent React).
- **Performance is more predictable by default.** Fewer "why did this re-render?" investigations. The Profiler and DevTools show a "Memo ✨" badge on compiled components.
- **Escape hatches:** the `'use no memo'` directive opts a component or file out, and `compilationMode: 'annotation'` with `'use memo'` lets you opt in incrementally.

## Adoption

```js
// babel.config.js
module.exports = {
  plugins: [['babel-plugin-react-compiler', { target: '19' }]], // the plugin should run first
};
```

- Start with the **ESLint rules** (bundled into `eslint-plugin-react-hooks` from v6 onward as `recommended` rules) to find violations.
- Roll out by directory or with annotation mode. Monitor with tests and performance metrics.
- Libraries can ship precompiled code.
- Vite, Next.js (`reactCompiler: true`), Expo and React Router have documented integrations.

## Limitations

- It doesn't fix **algorithmic** slowness (rendering 10,000 rows still needs virtualization) or reduce the work of the *first* render.
- It doesn't change **context propagation**: consumers of a changing context still re-render, though their children may now be cached.
- External mutable data (mutable class instances, globals) can defeat or confuse memoization. The compiler assumes immutability.
- Debugging compiled output is harder, though source maps and DevTools help.

## In an interview, mention…

- It's build-time automatic memoization, stable since v1.0 (Oct 2025), and works back to React 17.
- It depends on the Rules of React, skips violating code, and the ESLint plugin surfaces violations.
- What it means for `useMemo`/`useCallback`/`memo`: mostly unnecessary in new code, removed carefully in old code.
- What it doesn't solve: virtualization, context fan-out, expensive initial renders.
