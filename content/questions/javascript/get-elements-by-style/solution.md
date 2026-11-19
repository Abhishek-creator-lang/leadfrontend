## Approach

Two parts: **normalise the target value once**, then **walk the tree** comparing computed values.

### 1. Normalise through the browser

Writing a colour parser (named colours, 3/4/6/8-digit hex, `rgb`, `hsl`...) and a length parser would take the whole interview and still miss cases. The browser already knows how to do it. Create a temporary element, apply the target style to it, attach it to the document, and read its computed value:

```js
function normalize(doc, property, value) {
  const probe = doc.createElement('div');
  probe.style.setProperty(property, value);
  doc.body.appendChild(probe);
  const normalized = doc.defaultView.getComputedStyle(probe).getPropertyValue(property);
  probe.remove();
  return normalized;
}
```

Now `'red'`, `'#f00'` and `'rgb(255,0,0)'` all become `'rgb(255, 0, 0)'`, and `'0'` becomes `'0px'`. Both sides of the comparison go through the same pipeline, which is what makes it reliable.

The probe must be **in the document**: computed values for detached elements are not reliably available in browsers (some return empty strings).

### 2. Walk the tree

A pre-order DFS over `root`'s descendants (explicit stack, children pushed in reverse) checks `getComputedStyle(el).getPropertyValue(property) === normalized`.

## Complexity

O(N) elements visited. In a browser, each `getComputedStyle(...).getPropertyValue` may force a **style recalculation** if styles are dirty, so the real cost depends on what else is happening. Don't interleave reads with DOM writes in the loop.

## Specified vs computed vs used vs resolved

- **Specified:** what the stylesheet or `style` attribute says (`'red'`, `'50%'`).
- **Computed:** after resolving keywords, inheritance and relative units where possible (`'rgb(255, 0, 0)'`, `font-size: 2em` becomes px).
- **Used:** after layout (`width: 50%` becomes an actual pixel width).
- **Resolved:** what `getComputedStyle` returns. It's the computed value for most properties, but the **used** value for some layout properties such as `width` and `height` on rendered elements.

That's why `getComputedStyle(el).width` can force a **synchronous layout** (reflow), which is expensive. In tests running in jsdom there's no layout engine, so layout-dependent values aren't meaningful; this exercise sticks to properties that don't need layout.

## Edge cases

- **Inherited properties** (`color`, `font-size`): a child with no style of its own still has a computed value inherited from its parent, so it matches. That's correct, and different from checking `el.style`.
- **Invalid `value`:** `setProperty` ignores it, so the probe has whatever the default or inherited value is. You could detect this with `probe.style.getPropertyValue(property) === ''` and return `[]`.
- **Shorthands:** `margin` vs `margin-top`. Compare longhands; shorthand computed values are not reliably serialised across browsers.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Comparing `el.style.color === 'red'` | Misses stylesheet and inherited styles, and `#f00` never equals `red` |
| Normalising only one side | `'red' !== 'rgb(255, 0, 0)'` |
| Probing with a detached element | Empty computed values in real browsers |
| Forgetting to remove the probe | Leaves junk elements in the page |
| Using `camelCase` with `getPropertyValue` | `getPropertyValue('fontSize')` returns `''`; it needs kebab-case |

## Real-world connection

- **Testing Library / jest-dom's `toHaveStyle`** normalises expected styles by applying them to an element and comparing computed values, which is the same trick.
- **Accessibility checkers** (axe-core) read computed `color` and `background-color` to compute contrast ratios, and computed `display`/`visibility` to decide what's hidden.
- **Visual-regression and design-lint tools** scan the DOM for off-palette colours this way.

## Follow-ups

- **Visible elements:** `display` isn't enough; check `visibility`, `opacity`, `content-visibility`, ancestors with `display: none`, and zero-size boxes. `el.checkVisibility()` now does much of this natively.
- **Batch reads:** collect all elements first, then read styles in one pass, to avoid layout thrashing.
- **Multiple properties:** accept an object `{ color: 'red', 'font-weight': 'bold' }` and normalise each entry once.
