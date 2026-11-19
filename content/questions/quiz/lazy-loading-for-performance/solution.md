## TL;DR

**Lazy loading** defers loading a resource **until it's actually needed**: off-screen images and iframes, code for routes or widgets the user hasn't opened, data below the fold. It **shrinks the initial payload**, frees bandwidth and main-thread time for what's visible, and lowers cost for users who never scroll or click. The key rule: **never lazy-load what's needed for the first view**, especially the LCP image.

## Images and iframes: native

```html
<img src="/photos/beach.avif" alt="Beach at sunset"
     width="800" height="533" loading="lazy" decoding="async">

<iframe src="https://www.youtube-nocookie.com/embed/xyz" title="Product demo"
        loading="lazy" width="560" height="315"></iframe>
```

- The browser fetches them when they approach the viewport (with a distance threshold that depends on connection speed).
- Always set `width`/`height` (or CSS `aspect-ratio`) so the placeholder reserves space and nothing shifts (CLS).
- **Don't** add `loading="lazy"` to the hero/LCP image. Instead mark it `fetchpriority="high"`.

## Code: dynamic `import()`

```js
// load the heavy editor only when the user opens it
openButton.addEventListener('click', async () => {
  const { createEditor } = await import('./editor.js');
  createEditor(document.querySelector('#editor'));
});
```

```jsx
// React: route- or component-level splitting
const Settings = lazy(() => import('./Settings'));

<Suspense fallback={<Spinner />}>
  <Settings />
</Suspense>
```

Bundlers turn each `import()` into a separate chunk. Good candidates: routes, modals, charts, rich-text editors, maps, admin-only features.

## Custom lazy loading with IntersectionObserver

```js
const io = new IntersectionObserver((entries, obs) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    loadWidget(entry.target);   // fetch data / import code / swap src
    obs.unobserve(entry.target);
  }
}, { rootMargin: '200px' });    // start a bit before it's visible

document.querySelectorAll('[data-lazy-widget]').forEach((el) => io.observe(el));
```

Use it for components, infinite scroll, or analytics that should only fire when content is seen.

## Other forms

- **Data**: paginate or fetch below-the-fold sections on demand.
- **Rendering**: `content-visibility: auto` skips rendering off-screen sections while still loading them.
- **Third-party scripts**: load chat widgets or video players on interaction ("facade" pattern: show a static preview, load the real embed on click).
- **Fonts and icons**: subset and load extra weights later.

## Trade-offs and pitfalls

- **Delayed content**: lazy resources load later by definition. Combine with **prefetching on intent** (hover, viewport proximity, idle time) so it's ready when needed: `<link rel="prefetch">`, router prefetch, or `import()` on `pointerenter`.
- **Waterfalls**: lazy code that then fetches data that then loads images creates sequential round trips. Start data fetching in parallel with code loading.
- **Layout shifts** when placeholders don't reserve space.
- **SEO**: content that loads only on scroll or interaction may not be indexed; keep important content server-rendered.
- **Too many tiny chunks** add request overhead; split at meaningful boundaries.
- **Accessibility**: spinners need accessible labels, and focus should move sensibly when lazy content appears.

## Measuring the impact

Compare initial JS/bytes and LCP/INP before and after in Lighthouse and field data. A good outcome: smaller initial bundle, unchanged or better LCP, and no new CLS.

## In an interview, mention…

- Native `loading="lazy"` for images/iframes, `import()` + `Suspense` for code, IntersectionObserver for custom cases.
- Not lazy-loading the LCP element, and reserving space.
- Pairing lazy loading with prefetching to hide latency.
