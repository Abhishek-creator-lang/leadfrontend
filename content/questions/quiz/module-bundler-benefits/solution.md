## TL;DR

A **module bundler** (Vite/Rollup, webpack, esbuild, Rspack, Parcel, Turbopack) starts from your entry points, follows the **import graph**, and emits **optimised assets** for the browser. Benefits: **fewer, smaller requests** (bundling, minification, tree shaking), **code splitting** and lazy chunks, **long-term caching** via content-hashed filenames, **transforms** (TypeScript, JSX, modern syntax down-levelling, CSS processing), **asset handling**, and a fast **dev experience** (HMR). Native ES modules make bundling optional for small sites, but production apps still benefit.

## What a bundler does

```mermaid
flowchart LR
  E[entry main.tsx] --> G[resolve import graph]
  G --> T[transform TS JSX CSS assets]
  T --> O[optimise tree shake minify]
  O --> C[split into chunks]
  C --> H[hashed files + manifest]
```

## Concrete benefits

- **Dependency resolution**: bare imports like `import { debounce } from 'lodash-es'` are resolved from `node_modules`, honouring `package.json` `exports`/`browser` fields.
- **Fewer round trips**: hundreds of small modules become a handful of chunks. Even with HTTP/2 multiplexing, deep unbundled import chains create waterfalls, because the browser only discovers an import after downloading its parent.
- **Smaller payloads**: tree shaking removes unused exports; minification (Terser, esbuild, SWC) shortens identifiers and removes whitespace; scope hoisting merges modules to cut wrapper overhead; dead branches like `if (process.env.NODE_ENV !== 'production')` disappear.
- **Code splitting**: `import()` boundaries become separate chunks, so a route or heavy widget loads only when needed. Shared vendor code is split out so it caches independently.
- **Caching**: output names like `app.3f9a1c.js` change only when content changes, so you can serve them with `Cache-Control: max-age=31536000, immutable`.
- **Transforms**: TypeScript/JSX compilation, syntax lowering for your browserslist targets, CSS modules, PostCSS, importing images/fonts/SVG/WASM as URLs or inlined data.
- **Environment handling**: replacing `import.meta.env.*` constants at build time.
- **Developer experience**: dev server, hot module replacement that preserves state, source maps, error overlays.
- **Analysis**: bundle visualisers show what's heavy; budgets can fail CI when a chunk grows.

## Trade-offs

- **Config complexity** (historically webpack), though Vite and framework defaults hide most of it.
- **Build time** on large codebases; Rust/Go-based tools (esbuild, Rspack, Rolldown, Turbopack) target this.
- **Over-bundling**: one giant chunk means any change invalidates the whole cache and delays interactivity. Over-splitting creates too many tiny requests. Tune chunking by route and by stability (vendor vs app code).
- **Abstraction leaks**: dev and prod can differ (Vite serves unbundled ESM in dev, bundles with Rollup/Rolldown for prod), so test production builds.

## Do you always need one?

Small sites can ship native ESM with import maps and `modulepreload`. Libraries often publish ESM built with a lighter tool (tsup, Rollup) and leave final bundling to the app. For a sizeable application, a bundler (usually via the framework: Next.js, Remix/React Router, Nuxt, SvelteKit, Angular CLI) is still the norm.

## In an interview, mention…

- Graph resolution → transform → optimise → split → hash.
- Code splitting and caching strategy as the biggest real-world performance levers.
- Bundle analysis and size budgets as a lead-level practice.
- How the tool landscape is moving towards faster native-language bundlers.
