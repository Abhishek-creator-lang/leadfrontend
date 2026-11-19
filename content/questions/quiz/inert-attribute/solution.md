## TL;DR

The global **`inert`** attribute makes an element and its whole subtree **non-interactive**: it can't be focused or clicked, its text can't be selected or found with find-in-page, and it's **removed from the accessibility tree**. One attribute replaces the fragile combination of `aria-hidden="true"` + `tabindex="-1"` on every focusable descendant + `pointer-events: none`. It's Baseline in all major browsers since 2023. Use it for **content behind custom overlays, off-screen drawers and carousel slides, and in-progress states**.

## Why the old approaches fall short

| Technique | Hides from screen readers | Removes from tab order | Blocks clicks |
|---|---|---|---|
| `aria-hidden="true"` | ✓ | ✗, so focusable children are still reachable, which is an a11y bug ("focusable element inside aria-hidden") | ✗ |
| `tabindex="-1"` | ✗ | Only that element, not its descendants | ✗ |
| `pointer-events: none` | ✗ | ✗ | ✓ (mouse only) |
| `display: none` / `hidden` | ✓ | ✓ | ✓, but also invisible |
| **`inert`** | ✓ | ✓ (whole subtree) | ✓ |

`inert` is the only option that keeps content **visible** but **completely non-interactive**.

## Use cases

```html
<!-- Off-canvas navigation: closed drawer stays rendered for animation -->
<nav id="drawer" class="drawer" inert>…</nav>

<!-- Custom overlay: make the rest of the app inert while it's open -->
<div id="app" inert>…</div>
<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="t">…</div>

<!-- Carousel: only the current slide is interactive -->
<li class="slide" inert>…</li>
<li class="slide is-current">…</li>
<li class="slide" inert>…</li>
```

```js
function openDrawer() {
  drawer.inert = false;
  main.inert = true;          // background content can't be reached
  drawer.querySelector('a, button')?.focus();
}
function closeDrawer() {
  drawer.inert = true;
  main.inert = false;
  toggleButton.focus();       // return focus explicitly
}
```

Other uses: disabling a form section while a request is in flight (`fieldset[disabled]` is better for form controls only), and hiding a step-by-step wizard's future steps that are visible but not yet available.

## Relationship to `<dialog>`

`dialog.showModal()` makes everything outside the dialog **implicitly inert** for you. Reach for `inert` manually when you're building something modal that isn't a `<dialog>` (e.g. a bottom sheet with custom behaviour) or for non-modal cases like drawers and carousels.

## Styling and UX caveats

- Browsers don't change appearance for inert content. Add a visual cue if the content looks interactive (`[inert] { opacity: .5; }`), otherwise users click things that don't respond.
- If the currently focused element becomes inert, focus is lost (it moves to `<body>`). Move focus deliberately **before** setting `inert`.
- `inert` on an ancestor can't be overridden by a descendant. You can't make one child "un-inert". Structure the DOM so the active content is outside the inert subtree, which is why modals are usually rendered as siblings of `#app`, via portals.

## Pitfalls

- Applying `inert` to content that should still be read by screen readers (e.g. a disabled-but-informative section). Use `aria-disabled` and keep it focusable instead.
- Forgetting to remove `inert` on close, leaving the app unusable for keyboard users, a severe bug that automated tests should catch.

## In an interview, mention…

- What `inert` covers (focus, pointer, find-in-page, accessibility tree) in one attribute.
- Why `aria-hidden` alone is an anti-pattern for focusable content.
- Practical uses (drawers, carousels, custom overlays) and its relation to `showModal()`.
- Explicit focus management around toggling it.
