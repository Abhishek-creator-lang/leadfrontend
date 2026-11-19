## TL;DR

ES modules have **named exports** (`export const x`, imported with `{ x }`), one optional **default export** (`export default`, imported under any name), **re-exports** (`export { x } from './y.js'`), **namespace imports** (`import * as ns`), **side-effect imports** (`import './polyfill.js'`) and **dynamic `import()`**, which returns a promise. Static imports are hoisted, resolved before the module runs, and produce **live, read-only bindings**.

## Exporting

```js
// math.js
export const PI = 3.14159;                 // named, inline
export function area(r) { return PI * r * r; }

function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }
const VERSION = '2.1';
export { clamp, VERSION as version };      // named, list + rename

export default function sum(...xs) {      // default (max one per module)
  return xs.reduce((a, b) => a + b, 0);
}
```

## Importing

```js
import sum from './math.js';                          // default, any local name
import { PI, area as circleArea } from './math.js';   // named, with rename
import sum2, { clamp } from './math.js';              // default + named
import * as math from './math.js';                    // namespace object
math.default === sum;                                  // true

import './register-elements.js';                       // run for side effects only
import data from './data.json' with { type: 'json' };  // import attributes (JSON modules)
```

## Re-exporting (barrels / public APIs)

```js
// components/index.js
export { Button } from './Button.js';
export { default as Modal } from './Modal.js';
export * from './icons.js';         // all named exports (not the default)
export * as utils from './utils.js';
```

## Dynamic import

```js
button.addEventListener('click', async () => {
  const { renderChart } = await import('./chart.js'); // loaded on demand, separate chunk
  renderChart(data);
});

const locale = await import(`./locales/${lang}.js`); // top-level await in modules
```

## Semantics worth knowing

- **Live bindings**: if `counter.js` does `export let count = 0; export function inc() { count++; }`, importers see the updated `count`. But they can't assign to it (`count = 5` throws a `TypeError`).
- **Hoisting**: `import` declarations are processed before any code in the module runs, regardless of where they appear.
- **Specifiers**: browsers need a full or relative path (`./math.js`, including the extension) or an import map for bare names. Node resolves bare specifiers from `node_modules` and uses `package.json` `exports`.
- **Evaluated once**: every importer shares the same module instance.

## Named vs default: a team convention question

Many teams prefer **named exports**:

- Renames are explicit and consistent; auto-import and refactoring tools work better.
- Typos fail at build time (`import { Buton }` is an error; a default import silently accepts any name).
- Re-exporting is simpler.

Defaults are still idiomatic where a framework requires them (e.g. route/page components in Next.js, `React.lazy` targets).

## Node / CommonJS interop

In Node, `.mjs` files or `"type": "module"` in `package.json` enable ESM. ESM can import CommonJS (the `module.exports` value becomes the default export). Recent Node versions also allow `require()` of synchronous ES modules.

## In an interview, mention…

- Named vs default and why many teams standardise on named exports.
- Live read-only bindings and static hoisting.
- Dynamic `import()` for code splitting and import attributes for JSON.
