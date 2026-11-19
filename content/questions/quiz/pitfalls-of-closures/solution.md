## TL;DR

Closures capture **variables (live bindings), not values**, and they **keep their whole scope alive** as long as the closure is reachable. That leads to the main pitfalls: **loop-variable capture bugs**, **stale closures** (especially in React hooks), **memory leaks** through long-lived callbacks, and **per-instance function overhead**. Most are fixed by block-scoped bindings, explicit cleanup and passing fresh values in.

## 1. Capturing a shared loop variable

```js
const handlers = [];
for (var i = 0; i < 3; i++) handlers.push(() => i);
handlers.map((h) => h()); // [3, 3, 3]: all share one `var i`
```

Fix: use `let` (a new binding per iteration) or pass the value as an argument. This bug is less common today, but still appears with `var` in legacy code or when a variable is declared outside the loop.

## 2. Stale closures

A closure sees the variable as it exists in **its** scope. In React, each render creates new variables, and callbacks from an old render keep seeing old values:

```js
function Timer() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCount(count + 1), 1000); // count is always 0 here
    return () => clearInterval(id);
  }, []); // effect captured the first render's `count`
}
```

Fixes: functional updates (`setCount((c) => c + 1)`), correct dependency arrays (enforced by `eslint-plugin-react-hooks`), a ref for the latest value, or React 19.2's `useEffectEvent` for non-reactive logic. The same issue occurs in vanilla JS with debounced handlers that capture an old config object.

## 3. Unintended retention (memory leaks)

```js
function attach(el, hugeData) {
  el.addEventListener('click', () => console.log(hugeData.summary));
}
```

As long as the listener is registered, `hugeData` is reachable, even if you only need one field. Combined with forgotten listeners, timers or subscriptions, this leaks memory in long-running SPAs.

Fixes:

```js
function attach(el, hugeData, signal) {
  const { summary } = hugeData;                       // capture only what you need
  el.addEventListener('click', () => console.log(summary), { signal }); // removable
}
```

Engines may share one context object among all closures created in the same scope. A small closure can therefore keep alive a large variable that only a *sibling* closure used. Heap snapshots (Retainers → "context") reveal this.

## 4. Performance and memory per instance

```js
function makeButton(label) {
  return { label, onClick() { /* … */ } }; // new function every call
}
```

Creating thousands of objects with their own closures costs more memory than sharing methods on a prototype. Usually negligible, but it matters for large lists or hot paths. In React, inline closures also produce new function identities each render, which can defeat `memo` on children. Use `useCallback` only where it actually prevents expensive work, or let the React Compiler handle it.

## 5. Mutating captured state unexpectedly

Closures share the binding, so two functions from the same scope see each other's writes:

```js
function makeApi() {
  let token = null;
  return { login: (t) => (token = t), call: () => fetch('/x', { headers: { auth: token } }) };
}
```

That's intended here, but accidental sharing (e.g. a module-level cache mutated by several closures) causes cross-request data leaks in server-side rendering, where module scope is shared between users.

## 6. Debuggability

Captured state is hidden from the outside, which is good for encapsulation, but it can only be inspected via DevTools `[[Scopes]]` and can't be reset in tests without recreating the factory.

## In an interview, mention…

- "Closures capture variables, not values" explains loop bugs and stale closures.
- Lifetimes: anything a closure references lives as long as the closure. Clean up listeners, timers and subscriptions (`AbortSignal` helps).
- React-specific stale closures and their fixes, plus the SSR module-scope leak as a lead-level concern.
