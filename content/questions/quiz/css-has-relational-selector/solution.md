## TL;DR

`:has()` is a **relational pseudo-class**: `A:has(B)` matches an `A` that has something matching the **relative selector** `B` (a descendant by default, or a sibling with `+`/`~`). It's the long-requested "parent selector", and more generally lets you **style an element based on what comes after or inside it**. That removes a lot of JS that only toggled classes. It has been **Baseline in all major browsers since December 2023**. Gotchas: it takes the **specificity of its most specific argument**, it uses an **unforgiving selector list** (one invalid selector in the list breaks the rule), and very broad patterns like `body:has(...)` can be costly to re-evaluate on large, frequently changing DOMs.

## What it unlocks

```css
/* Parent styling: card with an image gets a different layout */
.card:has(> img) { grid-template-columns: 8rem 1fr; }

/* Form state without JS */
.field:has(input:invalid:not(:placeholder-shown)) { --border: var(--danger); }
.field:has(input:focus-visible) { outline: 2px solid var(--focus); }

/* Previous-sibling styling */
h2:has(+ p.lede) { margin-block-end: .25rem; }

/* Page-level state: lock scroll while a modal dialog is open */
html:has(dialog[open]:modal) { overflow: hidden; }

/* Quantity queries: switch layout when there are 5+ items */
.list:has(> li:nth-child(5)) { columns: 2; }

/* "Everything except the hovered one" */
.grid:has(.item:hover) .item:not(:hover) { opacity: .6; }
```

## Specificity

`:has()` contributes the specificity of its **most specific argument**, like `:is()` and `:not()`:

```css
.card:has(#promo)     /* (1,1,0): the id inside counts */
.card:has(.badge, p)  /* (0,2,0) */
```

That can make overrides surprisingly hard. Keep arguments simple, or wrap low-priority rules in `:where()` or a cascade layer.

## Limitations

- `:has()` can't be nested inside another `:has()`, and pseudo-elements aren't allowed inside it.
- Unlike `:is()`, `:has()` uses an **unforgiving** selector list: if one argument is invalid or unsupported, the whole rule is dropped. That matters for feature detection.
- Feature-detect with `@supports selector(:has(a))` for a fallback in very old browsers.

## Performance

The browser has to re-check `:has()` matches when descendants or siblings change. Engines optimise with invalidation filters, and typical component-scoped usage is fine. Risky patterns:
- **Anchoring on the root** (`html:has(...)`, `body:has(...)`) with a frequently changing argument. Every DOM mutation anywhere may require re-checking.
- **Unscoped descendant arguments** like `:has(.x)` on many elements in deep trees.
- Combining `:has()` with sibling combinators over long lists.

Prefer anchoring on the nearest component (`.card:has(...)`) and child combinators (`:has(> img)`). Profile style recalculation in DevTools if a page with `:has()` feels sluggish.

## When JS is still better

- Logic that depends on data, not DOM structure.
- State that must be announced to assistive tech: CSS can change appearance, but ARIA attributes (`aria-expanded`, `aria-invalid`) still need to be set correctly, and those can be styled with attribute selectors.

## In an interview, mention…

- Relative selectors, and that `:has()` covers both parent and previous-sibling selection.
- Practical uses: form validation styling, layout variants, quantity queries, modal scroll lock.
- Specificity behaviour and unforgiving lists.
- Scoping for performance, and that it's Baseline since late 2023.
