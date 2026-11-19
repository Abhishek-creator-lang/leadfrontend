## TL;DR

DOM operations are cheap individually; what's expensive is the **style, layout and paint work they trigger**, and **touching too many nodes**. Optimise by **batching writes** (and separating them from reads), **building off-document** (`DocumentFragment`, `<template>`, a single `replaceChildren`), **using event delegation** instead of thousands of listeners, **keeping the DOM small** (virtualization, `content-visibility`), and **animating compositor-only properties**. Let frameworks do targeted updates, but still watch for unnecessary re-renders.

## 1. Batch insertions

```js
// slow: 1,000 insertions into the live document
for (const item of items) list.appendChild(renderItem(item));

// faster: build once, insert once
const frag = document.createDocumentFragment();
for (const item of items) frag.append(renderItem(item));
list.append(frag);

// replace everything in one call
list.replaceChildren(...items.map(renderItem));
```

Modern engines already coalesce style/layout until something reads it, so the real win is avoiding interleaved reads (see below) and reducing per-node overhead. Cloning a prepared `<template>` (`tpl.content.cloneNode(true)`) is faster than building complex nodes element by element.

## 2. Separate reads from writes (avoid layout thrashing)

```js
// thrashing: each offsetHeight read forces layout after the previous write
boxes.forEach((b) => { b.style.width = `${b.parentNode.offsetWidth / 2}px`; });

// batched
const widths = boxes.map((b) => b.parentNode.offsetWidth); // all reads
boxes.forEach((b, i) => { b.style.width = `${widths[i] / 2}px`; }); // all writes
```

Layout-forcing reads include `offsetTop/Width/Height`, `clientWidth`, `scrollTop`, `getBoundingClientRect()`, `getComputedStyle()`, `innerText` and `focus()`. Schedule writes in `requestAnimationFrame` when coordinating many components (libraries like FastDOM formalise this).

## 3. Change classes, not many inline styles

```js
el.classList.add('is-expanded'); // one style invalidation, CSS does the rest
```

Prefer toggling one class high in the tree over editing styles on hundreds of descendants, but be aware that a class change on `<body>` can restyle the whole page. Keep selectors simple so style recalculation stays cheap.

## 4. Event delegation

```js
// one listener for any number of rows, works for rows added later
table.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action="delete"]');
  if (btn) deleteRow(btn.closest('tr').dataset.id);
});
```

Fewer listeners mean less memory and faster rendering of large lists.

## 5. Keep the DOM small

- **Virtualize** long lists (render only visible rows): TanStack Virtual, react-window.
- **`content-visibility: auto`** with `contain-intrinsic-size` lets the browser skip rendering off-screen sections.
- **Paginate or "load more"** instead of rendering thousands of nodes.
- Remove hidden UI from the DOM rather than keeping huge `display: none` subtrees when they're rarely shown.
- Lighthouse warns at around 1,400 nodes; deep nesting makes style and layout costlier.

## 6. Animate cheaply

Animate `transform` and `opacity` (compositor-only), not `top`/`left`/`width`/`height`. Use the Web Animations API or CSS transitions; reserve `will-change` for elements about to animate.

## 7. Avoid expensive APIs in hot paths

- `innerHTML +=` re-parses and rebuilds the whole subtree. Use `insertAdjacentHTML` or `append`.
- `textContent` instead of `innerText` when you don't need layout-aware text.
- Cache node references instead of re-querying in loops; `getElementById` is fast but repeated `querySelectorAll` over large trees adds up.
- Use `MutationObserver`/`ResizeObserver`/`IntersectionObserver` instead of polling layout.

## 8. Framework considerations

Virtual DOM or signals reduce manual work but don't remove the costs: stable `key`s for lists, avoid re-rendering whole trees for small changes, and avoid forcing synchronous layout in effects (`useLayoutEffect` measurements run before paint and can block it).

## Measuring

The Performance panel shows purple "Recalculate Style"/"Layout" blocks and flags **forced reflows** with a warning. The Rendering drawer's "Paint flashing" and "Layout Shift Regions" highlight what changes.

## In an interview, mention…

- Read/write batching and forced synchronous layout.
- Fragments/templates/`replaceChildren`, delegation, and virtualization.
- `content-visibility` and compositor-only animations.
- That you'd confirm with the Performance panel before and after.
