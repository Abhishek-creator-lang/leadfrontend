## TL;DR

**Tree shaking** is dead-code elimination at the module level: the bundler marks which **exports are actually imported** across the whole graph and **drops the rest** from the output. It relies on the **static structure of ES modules** (imports/exports are known without running code). It only works when code is **free of side effects**, or declared as such, so the bundler can safely remove it.

## Example

```js
// utils.js
export function formatDate(d) { /* … */ }
export function slugify(s) { /* … */ }
export function hugeChartHelper() { /* 30 KB */ }

// app.js
import { slugify } from './utils.js';
console.log(slugify('Hello World'));
```

A production build includes `slugify` only. `formatDate` and `hugeChartHelper` are never referenced, so they're shaken out.

## Why ES modules make it possible

```js
// ESM: static, analysable at build time
import { slugify } from './utils.js';

// CommonJS: dynamic, opaque to static analysis
const utils = require('./utils');
const fn = utils[cond ? 'slugify' : 'formatDate'];
module.exports = buildExports(); // shape known only at runtime
```

ESM `import`/`export` must be top-level and use literal specifiers, so the bundler knows the full graph. With CommonJS, bundlers can only do limited, heuristic shaking.

## Side effects: the main blocker

A module that does something on load can't be dropped even if none of its exports are used:

```js
// analytics.js
window.dataLayer = window.dataLayer || []; // side effect at import time
export function track() { /* … */ }
```

```js
export const lightTheme = createTheme(); // call at top level: might have side effects, kept
export const darkTheme = /*#__PURE__*/ createTheme(); // annotated: safe to drop if unused
```

Tell the bundler which files are pure in `package.json`:

```json
{
  "sideEffects": ["*.css", "./src/polyfills.js"]
}
```

`"sideEffects": false` says every module in the package can be removed if unused. Get it wrong (for example, mark a CSS-importing module pure) and styles or registrations silently vanish.

## Things that defeat tree shaking

- Importing a **CommonJS build** of a library (`lodash` instead of `lodash-es`, or a `main` field without a `module`/`exports` ESM entry).
- **Namespace re-exports through barrels** that pull in modules with side effects.
- **Classes with many methods**: unused methods on a used class aren't removed (methods are properties, not exports).
- **Dynamic property access** on a namespace import: `import * as icons; icons[name]` keeps everything.
- **Transpiling ESM to CJS** too early (old Babel `modules: 'commonjs'` setting).
- Side-effectful top-level code without `/*#__PURE__*/` hints.

## How to verify

- Build in production mode; dev builds don't shake.
- Inspect with a bundle analyser (`rollup-plugin-visualizer`, `webpack-bundle-analyzer`, `source-map-explorer`).
- Check a library's tree-shakability on bundle-size tools before adopting it.
- Add size budgets to CI.

## Related techniques

Tree shaking removes unused exports; **minifiers** remove unreachable branches inside functions (`if (false) …`); **code splitting** moves used-but-not-yet-needed code into lazy chunks. You want all three.

## In an interview, mention…

- Static ESM structure + side-effect analysis are the two prerequisites.
- `sideEffects` in `package.json` and `/*#__PURE__*/`.
- Common defeaters (CJS builds, barrels, dynamic access) and how you'd measure the result.
