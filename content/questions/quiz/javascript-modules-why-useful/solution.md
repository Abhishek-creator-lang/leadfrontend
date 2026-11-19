## TL;DR

A **module** is a file with its **own scope** that explicitly **exports** what others may use and **imports** what it needs. Modules give you **encapsulation** (no accidental globals), **explicit dependencies** (a graph tools can analyse), **reuse** and **maintainability**. Standard JavaScript has **ES modules** (`import`/`export`), natively supported in browsers and Node. They also enable tree shaking, code splitting and lazy loading.

## Before modules

Every classic `<script>` shared one global scope:

```html
<script src="utils.js"></script>   <!-- defines function format() -->
<script src="widgets.js"></script> <!-- also defines format()… overwritten! -->
<script src="app.js"></script>     <!-- must load last; order is implicit -->
```

Problems: name collisions, hidden load-order dependencies, no way to tell what a file uses, and everything kept alive forever. Workarounds were IIFEs and the revealing module pattern, then community formats (CommonJS for Node, AMD/RequireJS for browsers).

## With ES modules

```js
// money.js
const RATE_CACHE = new Map();              // private to this module
export function formatMoney(cents, currency = 'USD') {
  return new Intl.NumberFormat('en', { style: 'currency', currency }).format(cents / 100);
}
export default class Cart { /* … */ }

// app.js
import Cart, { formatMoney } from './money.js';
```

```html
<script type="module" src="/app.js"></script>
```

## Why they're useful

- **Encapsulation**: top-level declarations are module-scoped. Only exports are visible, so internals can change freely.
- **Explicit dependency graph**: readers and tools can see exactly what each file uses. Static `import` declarations can be analysed without running code.
- **Tree shaking and dead-code elimination**: bundlers drop unused exports.
- **Code splitting**: dynamic `import('./chart.js')` returns a promise and creates a separate chunk loaded on demand.
- **Singleton semantics**: a module is evaluated **once** per realm; every importer shares the same instance. Useful for config or caches (and a source of surprises in tests).
- **Live bindings**: importers see updates to exported `let` variables; imports are read-only views.
- **Strict mode by default**, `this` is `undefined` at top level, and **top-level `await`** is allowed.
- **Team scalability**: clear public APIs per module/package, enforceable boundaries (lint rules, package `exports` maps).

## Browser specifics

- `type="module"` scripts are **deferred** by default and execute in order after parsing.
- They're fetched with **CORS**, so cross-origin modules need proper headers.
- **Import maps** (`<script type="importmap">`) let you use bare specifiers like `import { html } from 'lit'` without a bundler.
- `<link rel="modulepreload">` avoids waterfalls on deep import chains. In production, most apps still bundle to reduce request count and enable minification.

## Pitfalls

- **Circular imports** work but can give you `undefined` or TDZ errors at evaluation time; restructure shared code into a third module.
- **Barrel files** (`index.js` re-exporting everything) can hurt tree shaking and dev-server performance.
- **Side effects at import time** make modules harder to test and to tree-shake; mark packages with `"sideEffects": false` when true.

## In an interview, mention…

- Scope isolation and explicit dependencies as the core benefits.
- Static structure enabling tree shaking and dynamic `import()` for splitting.
- ESM vs CommonJS at a high level and that ESM is the standard.
- Module boundaries as an architectural tool in large codebases.
