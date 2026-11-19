## TL;DR

**CommonJS** (`require` / `module.exports`) is Node's original module system: **synchronous, dynamic, evaluated at runtime**, and it exports a **copy-like value** (the `module.exports` object). **ES modules** (`import` / `export`) are the language standard: **statically analysable, asynchronous to load, and exporting live bindings**. ESM works in browsers and Node and enables **tree-shaking**, top-level `await` and strict mode by default. New code should be ESM; CommonJS persists in older Node packages.

## Syntax

```js
// CommonJS: math.cjs
const add = (a, b) => a + b;
module.exports = { add };
// consumer
const { add } = require('./math.cjs');

// ESM: math.mjs
export const add = (a, b) => a + b;
export default function sub(a, b) { return a - b; }
// consumer
import sub, { add } from './math.mjs';
const { heavy } = await import('./heavy.mjs'); // dynamic, returns a promise
```

## Key differences

| | CommonJS | ES modules |
|---|---|---|
| Resolution | At runtime; `require` can be called anywhere, with computed paths | `import` declarations are static and hoisted; dynamic `import()` for runtime loading |
| Loading | Synchronous file read | Asynchronous: parse, link, then evaluate the graph |
| Exports | An object; destructuring copies values at require time | **Live bindings**: importers see later updates to the exported variable |
| `this` at top level | `module.exports` | `undefined` |
| Strict mode | Opt-in | Always |
| Top-level `await` | No | Yes |
| Module-scope helpers | `__dirname`, `__filename`, `require` | `import.meta.url`, `import.meta.dirname`/`filename` (Node 20.11+) |
| Browser support | Needs a bundler | Native (`<script type="module">`) |
| Tree-shaking | Hard (dynamic shape) | Easy (static shape) |
| Cycles | Partially initialised `exports` object | Live bindings; accessing an uninitialised `let`/`const` export throws a TDZ error |

Live bindings in action:

```js
// counter.mjs
export let count = 0;
export const inc = () => { count++; };

// main.mjs
import { count, inc } from './counter.mjs';
inc();
console.log(count); // 1  (with CJS destructuring you'd still see 0)
```

## Interop in Node

- Node decides the format by extension (`.mjs`/`.cjs`) or the nearest `package.json` `"type"` field.
- **ESM can import CJS**: `module.exports` becomes the default export, and Node attempts to detect named exports statically.
- **CJS importing ESM** used to require `await import()`. Since Node 22.12 / 20.19, `require(esm)` works for ES modules **without top-level await**.
- Packages publish both via the `"exports"` field with `"import"` and `"require"` conditions. Beware the **dual-package hazard**: the same library loaded twice, as CJS and ESM, with two separate copies of its state (singletons, `instanceof` checks).

## Pitfalls

- ESM import specifiers in Node and browsers need **full paths with extensions** (`./util.js`); bundlers and TypeScript resolution modes can hide this.
- Mocking ESM in tests is harder because bindings are read-only. Jest needs experimental flags; Vitest handles it natively.
- `require` is cached per resolved path, as are ES modules per URL: both evaluate once, which is why module-level state acts like a singleton.

## In an interview, mention…

- Static structure is the big win: tree-shaking, better tooling, early errors.
- Live bindings vs value copies, and how each handles circular dependencies.
- The real-world migration story: `"type": "module"`, `"exports"` conditions, `require(esm)` in recent Node, and the dual-package hazard.
