## TL;DR

Code splitting uses dynamic `import()` to break one bundle into chunks that load **when needed**, so the first page ships less JavaScript to download, parse and execute. Split first by **route**, then by **heavy, rarely-used features** (editors, charts, modals, admin tools), and keep **shared vendor code in stable chunks** for caching. The failure modes are **request waterfalls, too many tiny chunks, loading spinners on every click and broken deploys** when old chunks disappear.

## Where to split

| Boundary | Example | Gain |
|---|---|---|
| Route | `/checkout`, `/settings` | Biggest, easiest win; frameworks do it automatically |
| Interaction-triggered feature | Rich-text editor, date picker, image cropper, a chart library | Large libraries load only when the user opens them |
| Below-the-fold or conditional UI | Comments, recommendations, a chat widget | Faster initial render |
| Role or feature flag | Admin panel, experiments | Most users never pay for them |
| Polyfills / legacy | Differential loading | Modern browsers skip them |

```jsx
const Editor = lazy(() => import('./Editor'));

function Post() {
  const [editing, setEditing] = useState(false);
  return editing ? (
    <Suspense fallback={<EditorSkeleton />}>
      <Editor />
    </Suspense>
  ) : (
    <button
      onPointerEnter={() => import('./Editor')} // warm the chunk on intent
      onClick={() => setEditing(true)}>
      Edit
    </button>
  );
}
```

Prefetching on hover, focus or idle hides most of the latency. `import()` is cached by the module system, so calling it twice is free.

## How to decide with data

- Run a **bundle analyser** (`rollup-plugin-visualizer`, `webpack-bundle-analyzer`, `source-map-explorer`) on the production build to find big dependencies in the entry chunk.
- Use DevTools **Coverage** to see how much of the loaded JS actually executes on first load.
- Set **per-route budgets** in CI (e.g. ≤ 170 KB compressed JS for the initial route) so regressions are caught at review time.

## What goes wrong

- **Waterfalls.** Route chunk loads, *then* requests data, *then* lazy-loads a child component. Fetch data and code in parallel (route loaders, `modulepreload`, framework-level preloading).
- **Over-splitting.** Hundreds of 2 KB chunks add request overhead and hurt compression ratios. HTTP/2 multiplexing helps but doesn't make requests free. Group related modules.
- **Spinner fatigue.** Splitting tiny components that appear on most clicks just moves the wait from load time to interaction time, which hurts INP and perceived quality.
- **Unstable hashes.** If adding one route changes every chunk's hash, returning users re-download everything. Use content hashing and deterministic module IDs, and keep the vendor chunk stable.
- **Deploy skew.** A user on the old HTML requests `chunk-abc.js`, which the new deploy deleted, and gets a 404 or `ChunkLoadError`. Keep old assets for some days, and catch dynamic-import failures by prompting a reload.
- **SSR and hydration.** A lazily-loaded component the server already rendered must be loaded before hydration, or the client shows a fallback over server HTML. Frameworks handle this; hand-rolled setups often don't.
- **Barrel files** (`index.ts` that re-exports everything) can pull whole libraries into a chunk when tree shaking can't prove side-effect freedom.

## In an interview, mention…

- Route-first, then heavy interaction-triggered features, guided by analyser and coverage data.
- Prefetch on intent to remove the latency you introduced.
- Waterfalls and deploy skew (`ChunkLoadError`) as the classic production incidents.
- Budgets in CI so the gains last.
