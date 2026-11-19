## TL;DR

Cascade layers add a step to the cascade that is checked **before specificity**. When two declarations conflict, the one in the **later layer wins regardless of selector specificity**. Specificity only decides ties *within* the same layer. So you can declare an explicit order such as `@layer reset, base, vendor, components, utilities;` and stop fighting specificity wars with `!important` and ever-longer selectors. Two rules to remember: **unlayered styles beat all layered styles** (for normal declarations), and **`!important` reverses layer order**. Cascade layers have been Baseline in all major browsers since 2022.

## Where layers sit in the cascade

1. Origin and importance (user-agent, user, author; `!important`)
2. Context (Shadow DOM encapsulation)
3. Element-attached styles (`style=""`)
4. **Layers** ← new
5. Specificity
6. Order of appearance

## Setting it up

```css
/* Declare the order once, up front. First listed = lowest priority */
@layer reset, base, vendor, components, utilities;

@import url("normalize.css") layer(reset);
@import url("datepicker.css") layer(vendor);   /* tame a third-party library */

@layer base {
  a { color: var(--link); }
}

@layer components {
  .nav a { color: inherit; }     /* beats base, as expected */
}

@layer utilities {
  .text-danger { color: red; }   /* (0,1,0) beats #main .nav a in components */
}
```

- Layers can be **nested** (`@layer components.forms`) and appended to from multiple files. Order is set at first mention, so the up-front declaration statement is the source of truth.
- **Anonymous layers** (`@layer { … }`) can't be appended to later. Useful for isolating a block.
- `revert-layer` rolls a property back to the value from the previous layer.

## The two surprises

**1. Unlayered styles win.**
Any CSS not in a layer is treated as an implicit final layer. A legacy global stylesheet, or a library you didn't wrap, overrides everything layered, even with weaker selectors. During migration that's a feature (old CSS keeps working). Long-term, put everything in layers, or deliberately leave only overrides unlayered.

**2. `!important` inverts the order.**
For important declarations, **earlier** layers win: `reset !important` beats `utilities !important`. This is intentional: it lets a low layer (e.g. accessibility-critical reset rules) protect itself. But it surprises people who use `!important` in utilities. With layers you rarely need `!important` at all.

## Using it in a large codebase or design system

- Put **third-party CSS in a low layer** so your components override it without specificity hacks.
- Put the **design system's components below product code**, or provide a dedicated `overrides` layer, so consumers can customise without `!important`.
- Put **utilities on top**, so a utility class reliably wins over component styles. Tailwind v4 uses native cascade layers for exactly this.
- Combine with `:where()` for zero-specificity base styles and `@scope` (supported in Chromium and Safari, and in Firefox more recently) for proximity-based scoping.

## Pitfalls

- Forgetting the order declaration, so layer order follows first appearance, which depends on bundle import order.
- Assuming layers isolate styles. They only change precedence; selectors still match globally.
- CSS-in-JS or build tools that inject unlayered styles at runtime, which then override all layered CSS.
- Debugging: DevTools shows the layer for each rule. Train the team to look for it.

## In an interview, mention…

- Layer order is checked before specificity, and the explicit order statement.
- Unlayered-wins and `!important` inversion.
- A migration plan: wrap vendor and legacy CSS in low layers, move components in, utilities on top.
