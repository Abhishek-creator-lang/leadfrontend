## TL;DR

The View Transitions API animates between two DOM states. The browser **snapshots the old state**, you **update the DOM**, it captures the new state, and then it **cross-fades and morphs** between them using a tree of pseudo-elements you can style with ordinary CSS animations. Elements with the same **`view-transition-name`** in both states get a "shared element" morph (e.g. a thumbnail growing into a hero image). **Same-document** transitions (`document.startViewTransition()`) are supported in all major browsers as of late 2025. **Cross-document** transitions for multi-page apps (`@view-transition { navigation: auto; }`) work in Chromium and Safari, with Firefox support still pending, so treat them as progressive enhancement.

## Same-document (SPA)

```js
async function showProduct(id) {
  if (!document.startViewTransition) return render(id);      // fallback
  const vt = document.startViewTransition(() => render(id)); // callback may be async
  await vt.finished;
}
```

```css
.thumb.is-active, .product-hero { view-transition-name: product-image; }

::view-transition-old(root),
::view-transition-new(root) { animation-duration: 200ms; }

::view-transition-group(product-image) {
  animation-duration: 350ms;
  animation-timing-function: cubic-bezier(.2, .8, .2, 1);
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) {
    animation: none;
  }
}
```

## The pseudo-element tree

```
::view-transition
└─ ::view-transition-group(product-image)     ← animates size and position
   └─ ::view-transition-image-pair(product-image)
      ├─ ::view-transition-old(product-image)  ← screenshot of the old state
      └─ ::view-transition-new(product-image)  ← live rendering of the new state
```

`root` is the default group for the whole page. Each `view-transition-name` must be **unique in the document** at snapshot time; duplicates abort the transition. Newer additions (`view-transition-class`, `match-element` auto-naming, and transition **types** for direction-aware animations) are spreading across browsers; check support before depending on them.

## Cross-document (MPA)

```css
/* On both the old and the new page (same origin only) */
@view-transition { navigation: auto; }
.site-header { view-transition-name: header; }
```

- Works for same-origin navigations: links, forms, back and forward.
- `pageswap` and `pagereveal` events let you customise the transition (set names dynamically, skip it for some routes).
- Combined with speculation rules prerendering, an MPA can feel as smooth as an SPA without client-side routing.

## Pitfalls

- **Interaction is blocked** during the transition (the pseudo-element overlay sits on top). Keep animations short (≈ 200–400 ms).
- **Slow DOM updates delay everything**: the old snapshot stays frozen on screen until your callback resolves. Don't fetch inside the callback; fetch first, then start the transition. Cross-document transitions are skipped if the new page takes too long to render.
- **Unique names**: lists where every item gets a name need generated names (`view-transition-name: card-42`), and only for the elements involved.
- **Aspect-ratio changes** cause stretched snapshots by default. Adjust with `object-fit` on `::view-transition-old/new`.
- **Accessibility**: honour `prefers-reduced-motion`, and manage focus after the DOM update as you would without the animation.
- **Framework integration**: React and others must flush the DOM update synchronously inside the callback (`flushSync`), or use the router's built-in view transition support. React has been adding a `<ViewTransition>` component, initially in canary and experimental channels.

## In an interview, mention…

- Snapshot → update → animate, and the pseudo-element tree you style.
- Shared-element morphs via `view-transition-name` and the uniqueness rule.
- SPA vs MPA modes and the current support picture, with feature detection.
- Reduced motion, interaction blocking, and keeping the update callback fast.
