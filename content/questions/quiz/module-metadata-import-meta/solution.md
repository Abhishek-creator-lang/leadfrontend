## TL;DR

An ES module's metadata lives on **`import.meta`**, an object the host (browser, Node, Deno, bundler) creates for each module. The standard fields are **`import.meta.url`** (the module's own absolute URL) and **`import.meta.resolve(specifier)`** (resolve a specifier relative to this module). Hosts add more: Node has **`import.meta.dirname`**, **`import.meta.filename`** and **`import.meta.main`** in recent versions; Vite exposes **`import.meta.env`**, **`import.meta.hot`** and **`import.meta.glob`**. It's only available inside modules.

## `import.meta.url`

```js
// https://cdn.example.com/widgets/chart.js
console.log(import.meta.url); // 'https://cdn.example.com/widgets/chart.js'

// load an asset next to this module, wherever it's hosted
const workerUrl = new URL('./worker.js', import.meta.url);
const worker = new Worker(workerUrl, { type: 'module' });

const css = await fetch(new URL('./chart.css', import.meta.url)).then((r) => r.text());
```

`new URL('./x', import.meta.url)` is the module-world replacement for `document.currentScript.src` and Node's `__dirname`. Bundlers (Vite, webpack 5, Parcel) recognise this exact pattern and copy and hash the referenced asset.

In Node it's a `file:` URL:

```js
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(import.meta.url);

// Node 20.11+ / 21.2+
import.meta.dirname;  // '/app/src'
import.meta.filename; // '/app/src/index.js'
```

## `import.meta.resolve()`

```js
import.meta.resolve('./utils.js'); // absolute URL string
import.meta.resolve('lit');        // uses the import map (browser) or node resolution
```

Synchronous in browsers and current Node. Handy to pass a URL to a worker or `fetch` without loading the module.

## Tool-defined fields (Vite as an example)

```js
import.meta.env.MODE;           // 'development' | 'production'
import.meta.env.VITE_API_URL;   // only VITE_-prefixed vars are exposed to client code
if (import.meta.hot) {
  import.meta.hot.accept();     // HMR boundary, stripped from production builds
}
const pages = import.meta.glob('./pages/*.tsx'); // { path: () => import(path) }
```

These are compile-time features: the bundler replaces them, so they don't exist in a plain browser. TypeScript needs type declarations (`vite/client`) to know about them.

## Other module-related "metadata"

The question sometimes also means the **package-level** metadata that controls how modules are resolved, in `package.json`:

| Field | Purpose |
|---|---|
| `"type": "module"` | `.js` files are ESM (otherwise CommonJS) |
| `"exports"` | Public entry points and conditional exports (`import`, `require`, `browser`, `types`, `default`) |
| `"main"` / `"module"` | Legacy CJS / ESM entry hints |
| `"sideEffects"` | Lets bundlers tree-shake safely |
| `"imports"` | Private `#internal` aliases |

## Pitfalls

- `import.meta` is a syntax error in classic scripts and CommonJS.
- Don't put secrets in `import.meta.env`; anything referenced in client code ends up in the bundle.
- In tests (Jest with CJS transforms) `import.meta` may be unsupported; Vitest supports it natively.

## In an interview, mention…

- `import.meta.url` + `new URL()` for module-relative assets and workers.
- `import.meta.resolve` and Node's `dirname`/`filename`.
- That hosts and bundlers extend `import.meta`, and that the `env` fields are build-time replacements.
