## TL;DR

A **polyfill** is code that **implements a missing built-in API** (e.g. `Array.prototype.at`, `structuredClone`, `Promise.withResolvers`) so that newer code runs in older environments. It only works for things that can be expressed in existing JavaScript. **New syntax** (optional chaining, class fields) cannot be polyfilled; it must be **transpiled** (Babel, SWC, esbuild, TypeScript). Polyfills trade compatibility for **bundle size and correctness risk**, so ship them deliberately, based on your browser targets.

## A minimal polyfill

```js
if (!Array.prototype.at) {
  Object.defineProperty(Array.prototype, 'at', {
    value: function at(index) {
      const len = this.length >>> 0;
      let i = Math.trunc(index) || 0;
      if (i < 0) i += len;
      return i < 0 || i >= len ? undefined : this[i];
    },
    writable: true,
    configurable: true,
    enumerable: false, // built-in methods are non-enumerable; don't break for…in
  });
}
```

Good polyfills:

1. **Feature-detect first** and never overwrite a native implementation.
2. Match the **spec exactly**, including edge cases, property attributes and `length`/`name`.
3. Are **non-enumerable**, so they don't show up in `for…in` loops.

## Polyfill vs transpile vs ponyfill

| | What it handles | Example |
|---|---|---|
| Polyfill | Missing runtime APIs, patched onto globals | `core-js` adding `Object.groupBy` |
| Transpiler | New syntax rewritten to old syntax | `a?.b` → `a == null ? void 0 : a.b` |
| Ponyfill | Same API exported as a module, **without** touching globals | `import groupBy from 'object.groupby'` |

Some features need both (async functions need a transpile step plus a `Promise` and generator runtime). Some can't be done faithfully at all: `Proxy`, `WeakRef`, true private `#fields` without `WeakMap`, and most new CSS or rendering capabilities.

## How teams ship them today

- **Define targets** with a Browserslist query (e.g. `defaults and supports es6-module`). Babel's `preset-env` with `useBuiltIns: 'usage'` and `core-js` then injects only the polyfills that your code uses *and* your targets lack.
- **Differential loading:** modern browsers get a lean bundle; legacy bundles get the polyfills. Tools like `@vitejs/plugin-legacy` automate this with `<script type="module">` / `nomodule`.
- **Avoid polyfill-as-a-service from untrusted CDNs.** In 2024 the `polyfill.io` domain changed hands and served malicious code to many sites. Self-host polyfills or bundle them, ideally with Subresource Integrity on any third-party script.

## Pitfalls

- **Bundle bloat.** Blanket-importing `core-js` can add tens of kilobytes. Audit with bundle analysers.
- **Spec drift.** A hand-rolled polyfill written against a draft proposal can conflict with the final standard. This has happened before (MooTools' `Array.prototype.flatten` led to the method being named `flat`).
- **Libraries shouldn't polyfill globals.** That's the application's decision; libraries should use ponyfills or document requirements.
- Polyfills can be slower than native code, so performance tests on old browsers may differ.

## In an interview, mention…

- The distinction between APIs (polyfill) and syntax (transpile), and that some features cannot be polyfilled.
- Target-driven polyfilling via Browserslist + `core-js`, not "include everything".
- The supply-chain risk lesson from polyfill.io, and preferring self-hosted, pinned dependencies.
