## TL;DR

Sass and Less variables are **compile-time constants**. They're substituted during the build and disappear from the output. **CSS custom properties** (`--brand: #0a7`) are **live, cascading values in the browser**: they inherit down the DOM, can be overridden per element, media query or container, can be read and written from JavaScript, and changing one updates everything that uses it without a rebuild. That makes custom properties the right tool for **theming, dark mode, design tokens and component APIs**. Preprocessor variables are still fine for build-time concerns such as breakpoint lists or loops.

## Side by side

| | Sass `$var` | CSS `--var` |
|---|---|---|
| Resolved | At build time | At computed-value time, in the browser |
| Scope | Lexical (file and block) | **DOM inheritance** + cascade |
| Changes at runtime | No | Yes: `:root`, media queries, classes, JS `style.setProperty` |
| Usable in media query conditions | Yes | **No** (`@media (min-width: var(--bp))` is invalid) |
| Typed | Sass types (numbers, colours, maps) | Untyped token streams, unless registered with `@property` |
| Animatable | — | Only when registered with `@property` and a syntax |
| Visible in DevTools | No | Yes, with the computed value |

## Theming pattern: tokens in layers

```css
/* 1. Primitive tokens: the palette */
:root {
  --blue-600: oklch(52% 0.18 255);
  --gray-50: oklch(98% 0 0);
  --gray-900: oklch(20% 0 0);
}

/* 2. Semantic tokens: what components use */
:root {
  --color-bg: var(--gray-50);
  --color-text: var(--gray-900);
  --color-accent: var(--blue-600);
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-bg: var(--gray-900);
    --color-text: var(--gray-50);
  }
}
[data-theme="dark"] { --color-bg: var(--gray-900); --color-text: var(--gray-50); }

/* 3. Component tokens: a public, overridable API */
.button {
  --button-bg: var(--color-accent);
  background: var(--button-bg);
  color: var(--button-fg, white);   /* fallback if not set */
}
.checkout .button { --button-bg: var(--green-600); }  /* scoped override */
```

Components reference **semantic** tokens, never raw hex values, so themes and brands only swap the semantic layer. Custom properties also pierce Shadow DOM boundaries by inheritance, which makes them the standard theming API for web components.

## `@property`: typed custom properties

```css
@property --angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}
.spinner {
  animation: spin 1s linear infinite;
  background: conic-gradient(from var(--angle), var(--color-accent), transparent);
}
@keyframes spin { to { --angle: 360deg; } }
```

Registration gives type checking, a real initial value, control over inheritance, and the ability to **animate** the value. `@property` is Baseline across all major browsers since 2024.

## Gotchas

- **Invalid at computed-value time**: `--size: red; width: var(--size)` doesn't fall back to the previous `width` declaration. The property becomes `unset`, which surprises people.
- The `var(--x, fallback)` fallback only applies when `--x` is **not defined** (or is the guaranteed-invalid value), not when its value is wrong for the property.
- Changing a custom property on `:root` invalidates styles for every element that uses it. That's fine for theme switches. Avoid it for per-frame animation on huge pages; scope the property to the animated element.
- Not usable in media query conditions. Use preprocessor variables or `@custom-media` (not yet widely supported) for breakpoints.

## In an interview, mention…

- Compile-time vs runtime, lexical vs DOM-inherited scope.
- Token layering (primitive → semantic → component) and dark mode or multi-brand theming.
- `@property` for typing and animation.
- The invalid-at-computed-value-time and fallback semantics.
