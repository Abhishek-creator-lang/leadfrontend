## TL;DR

Media queries respond to the **viewport**. **Container queries** respond to the size of an **ancestor container**, so a component can adapt to the space it's actually given, whether that's a sidebar, a main column or a modal, without knowing the page layout. You mark an element as a container with **`container-type: inline-size`** and write **`@container (min-width: 30rem) { … }`**. Size container queries have been **Baseline in all major browsers since 2023**, which makes them the right default for responsive *components*. Media queries remain right for *page-level* layout and user preferences.

## How it works

```css
.card-slot {
  container-type: inline-size;   /* query my inline size */
  container-name: card;          /* optional; target a specific ancestor */
}

.card { display: grid; gap: 1rem; }

@container card (min-width: 28rem) {
  .card { grid-template-columns: 10rem 1fr; }  /* image beside text */
}

@container card (min-width: 45rem) {
  .card__title { font-size: clamp(1.25rem, 4cqi, 2rem); }
}
```

- An unnamed `@container` query matches the **nearest** ancestor container. Named containers let you skip levels.
- The container can't style **itself** based on its own size. Queries apply to descendants. That avoids circular dependencies.
- **Container query units**: `cqi`/`cqb` (1% of the container's inline/block size), `cqw`, `cqh`, `cqmin`, `cqmax`. They're useful for fluid type inside components.
- Range syntax works: `@container (400px <= width < 700px)`.

## The containment trade-off

`container-type: inline-size` applies **inline-size containment**: the container's width can no longer depend on its children. Usually harmless for block-level slots that fill their parent. But on an element that **shrink-wraps its content** (inline-block, a flex item with `flex: none`, an absolutely positioned popover), the container may collapse to zero width. Put the container on a wrapper whose width comes from the layout, not from content. `container-type: size` also contains the block size, so it requires an explicit height. Use it rarely.

## Style queries

```css
.theme-scope { --variant: compact; }
@container style(--variant: compact) {
  .card { padding: .5rem; }
}
```

Style queries for **custom properties** are supported in Chromium and Safari. Firefox support has lagged, so treat them as progressive enhancement. **Scroll-state queries** (e.g. styling a sticky header when it's "stuck") are newer and Chromium-only at the time of writing.

## Impact on design systems

- Components ship their own responsive behaviour. A `<ProductCard>` works in a 3-column grid, a sidebar and a carousel without page-specific overrides or `variant="small"` props.
- Designers specify breakpoints **per component**, in terms of available space, not device classes.
- Fewer JS `ResizeObserver` hacks for layout.

## When media queries are still right

- Page shell layout (when to show the sidebar).
- User preferences: `prefers-color-scheme`, `prefers-reduced-motion`, `prefers-contrast`.
- Input and device capabilities: `hover`, `pointer: coarse`.
- Print styles.

## Pitfalls

- Making every element a container. Each one adds containment and some layout cost. Containers belong on layout "slots".
- Containers collapsing inside shrink-to-fit parents, as described above.
- Mixing `vw` units into components that are supposed to be container-relative. Use `cqi`.

## In an interview, mention…

- Viewport vs container, and why container queries are the right tool for reusable components.
- `container-type: inline-size`, containment, and the shrink-wrap collapse pitfall.
- `cq*` units, style queries' support caveats, and keeping media queries for page and preference concerns.
