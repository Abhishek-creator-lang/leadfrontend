## TL;DR

Physical properties (`margin-left`, `padding-right`, `top`, `width`) are tied to the screen. **Logical properties** are tied to the **flow of text**: the **inline** axis (the direction text runs) and the **block** axis (the direction lines stack). `margin-inline-start` is the left margin in English but the right margin in Arabic or Hebrew, and something else again in vertical Japanese. Writing layouts logically means **RTL and vertical writing modes work without a parallel set of override styles**. They're supported across all modern browsers and should be the default in new code and design systems.

## The mapping

| Physical | Logical (horizontal LTR mapping) |
|---|---|
| `margin-left` / `margin-right` | `margin-inline-start` / `margin-inline-end` |
| `margin-top` / `margin-bottom` | `margin-block-start` / `margin-block-end` |
| `padding-left` + `padding-right` | `padding-inline` (shorthand) |
| `width` / `height` | `inline-size` / `block-size` |
| `min-width` / `max-height` | `min-inline-size` / `max-block-size` |
| `top` / `left` / `right` / `bottom` | `inset-block-start` / `inset-inline-start` / … / `inset` |
| `border-top-left-radius` | `border-start-start-radius` |
| `text-align: left` | `text-align: start` |
| `float: left` | `float: inline-start` |

```css
.alert {
  padding-block: .75rem;
  padding-inline: 1rem 2.5rem;      /* room for a close button at the end */
  border-inline-start: 4px solid var(--accent);
  text-align: start;
}
.alert__close {
  position: absolute;
  inset-block-start: .5rem;
  inset-inline-end: .5rem;
}
```

Set direction on the document (`<html dir="rtl" lang="ar">`) or per element (`dir="auto"` for user-generated text), and everything above flips correctly.

## Why it matters at senior level

- **Cost of RTL support**: without logical properties, teams maintain RTL override stylesheets or build-time flipping tools (e.g. RTLCSS), and every new component risks a bug. With logical properties, RTL is mostly free.
- **Design tokens and components**: spacing APIs in a design system should be named `start`/`end`, not `left`/`right` (e.g. `iconPosition="start"`).
- **Vertical writing** (`writing-mode: vertical-rl`) for CJK typography or rotated table headers just works.

## What doesn't flip automatically

- **Transforms and some backgrounds**: `translateX()` and `background-position` are physical. Use `:dir(rtl)` (Baseline since 2023) or custom properties to flip them.
- **Directional icons**: arrows, "back" chevrons and progress indicators should mirror. Logos, media play buttons and checkmarks usually shouldn't. Mirror selectively with `:dir(rtl) .icon-back { transform: scaleX(-1); }`.
- **Flex and grid** already follow the inline direction, so `row` becomes right-to-left automatically. Hard-coded `row-reverse` hacks become double-reversed bugs.
- **JavaScript** positioning code (tooltips, popovers) that computes `left` offsets. Consider CSS anchor positioning, which accepts logical keywords. It's newer and support is still rolling out, so check it.
- Mixed bidirectional text (numbers, URLs, user names) needs `dir="auto"` or `<bdi>`, which is a separate topic from layout.

## Migration approach

- Lint new code with Stylelint rules or plugins that flag physical properties.
- Convert component by component, and test with `dir="rtl"` in Storybook or visual regression tests.
- Keep physical properties when the intent really is physical (a shadow offset, a fixed-position element on the right edge regardless of language).

## In an interview, mention…

- Inline vs block axes and how they map per writing mode.
- That RTL support becomes nearly free, and the exceptions (transforms, icons, JS positioning).
- Design-system naming (`start`/`end`) and linting to enforce it.
