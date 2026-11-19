## The grid

```css
grid-template-columns: 200px minmax(0, 1fr) 200px;
grid-template-rows: auto 1fr auto;
grid-template-areas:
  'header header header'
  'nav    main   aside'
  'footer footer footer';
min-height: 100dvh;
```

Each requirement maps to one declaration:

| Requirement | How |
|---|---|
| Fixed side columns, fluid centre | `200px … 200px` and `1fr` |
| Equal-height columns | Grid items in the same row stretch by default (`align-items: stretch`) |
| Sticky footer | Container `min-height: 100dvh` plus a `1fr` middle row that absorbs the spare space |
| Footer pushed down by long content | `min-height`, not `height`, so the grid can grow |
| Responsive stacking | Redefine `grid-template-areas` in a media query. The markup doesn't change. |

`grid-template-areas` makes the layout readable as ASCII art, and the responsive version is just a second "picture".

## `minmax(0, 1fr)` and overflow

A plain `1fr` means `minmax(auto, 1fr)`. Its minimum is the content's min-content width, so a long URL or a wide `<pre>` pushes the column wider than the viewport. `minmax(0, 1fr)` lets the column shrink, and `overflow-wrap: anywhere` breaks long strings. Code blocks and tables inside main should get their own `overflow-x: auto`.

## `100dvh` vs `100vh`

On mobile, `100vh` is the viewport height with the browser toolbars *hidden*, so a `100vh` page is taller than the visible area and the footer starts off-screen. `dvh` (dynamic viewport height) tracks the actual visible area. The declaration is repeated with `100vh` first as a fallback for older browsers.

## Semantics and accessibility

- **Landmarks:** `header` (banner), `nav`, `main`, `aside` (complementary) and `footer` (contentinfo). Screen-reader users jump between them with landmark navigation. `header` and `footer` only map to banner and contentinfo when they aren't nested inside `article`, `section` and so on.
- **Names:** `aria-label="Primary"` on the nav and `"On this page"` on the aside distinguish them when a page has several of the same landmark.
- **Skip link:** the first focusable element. It's off-screen until focused, then visible. It targets `#main`, and `tabIndex={-1}` on `<main>` ensures focus actually moves there in every browser (not just the scroll position), so the next Tab continues from the content.
- `aria-current="page"` marks the current nav item.
- **Source order:** keep DOM order equal to visual order (header, nav, main, aside, footer). Grid makes it tempting to reorder visually with `grid-area` or `order`, but keyboard and screen-reader users follow the DOM, so a mismatch creates a confusing focus order (WCAG 1.3.2 and 2.4.3). The old "main first for SEO" argument no longer holds. The skip link solves the "get to content quickly" problem properly.

## How it used to be done

- **Floats** with negative margins, padding tricks and "faux columns" (background images) for equal heights, plus clearfix hacks. The original 2006 article is famous precisely because it was so hard.
- **Flexbox:** a column flex container (header, row, footer) with `flex: 1` on the middle row, and an inner row flex (`nav` and `aside` at `flex: 0 0 200px`, `main` at `flex: 1; min-width: 0`). It works well, but it's a two-level structure. Grid does it in one container, with two-dimensional control.

## Variants and follow-ups

- **Collapsible sidebars:** toggle a class that changes `grid-template-columns` (to `0 1fr 200px`), and use `inert` or `hidden` on the collapsed region so its links aren't focusable.
- **Sticky sidebars:** `position: sticky; top: 0; align-self: start; max-height: 100dvh; overflow: auto` on the nav.
- **Container queries:** if the layout is a component inside other layouts, use `@container` instead of viewport media queries.
- **Subgrid:** to align content inside the columns to a shared grid.
