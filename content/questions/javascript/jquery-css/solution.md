## Approach

### Normalise names

`setProperty` and `getPropertyValue` take **kebab-case** names. Convert camelCase with a regex, and leave custom properties untouched (they are case-sensitive, so `--brandColor` must not become `--brand-color`):

```js
const toKebab = (name) => (name.startsWith('--') ? name : name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`));
```

Using `setProperty` / `getPropertyValue` instead of `el.style[name] = value` is deliberate: they work for **every** property, including custom properties, which can't be set through the camelCase property accessors.

### Normalise values

- `null` or `''`: `el.style.removeProperty(name)`.
- `number`: append `px` unless the property is in the unitless set (or is a custom property).
- Anything else: `String(value)`.

### Dispatch on arguments

```js
css(nameOrMap, value) {
  if (typeof nameOrMap === 'object') { for each entry: set(...); return this; }
  if (value === undefined) return elements.length ? getComputedStyle(elements[0]).getPropertyValue(toKebab(nameOrMap)) : undefined;
  set(nameOrMap, value); return this;
}
```

Checking `arguments.length` would be stricter, but `value === undefined` matches how jQuery treats `css('x', undefined)` as a getter.

## Getter vs setter asymmetry

- **Setter: inline style.** It's the only place JavaScript can write per-element styles without managing stylesheets, and inline styles win over normal (non-`!important`) stylesheet rules.
- **Getter: computed style.** The caller usually wants "what is the colour right now", which may come from a stylesheet, inheritance or a previous inline write. Reading `el.style.color` only sees inline styles and returns `''` for everything else.

## Complexity

O(E × P) for E elements and P properties set. The getter is O(1) but may trigger **style recalculation**, or for geometry properties a **synchronous layout**.

## Layout thrashing

```js
boxes.forEach((box) => {
  const w = $(box).css('width');               // read (forces layout if dirty)
  $(box).css('width', parseFloat(w) * 2);      // write (makes layout dirty)
});
```

Alternating reads and writes forces a layout per iteration. Batch all reads first, then all writes, or schedule writes with `requestAnimationFrame`. Libraries like FastDOM formalised this.

## Edge cases

- **`0`** is a valid number: set `0px`, don't treat it as "remove".
- **Unitless properties with numbers:** `opacity: 0.5` stays `0.5`; `0.5px` would be invalid and ignored.
- **Invalid values:** `setProperty` silently ignores them, so the previous value remains.
- **No matches:** setters are no-ops, the getter returns `undefined`.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `el.style[name] = value` with kebab-case names | `el.style['background-color']` works in browsers, but custom properties don't |
| Appending `px` to every number | `opacity: 1px` and `z-index: 3px` are invalid and dropped |
| Reading `el.style` in the getter | Stylesheet-defined values come back as `''` |
| Treating `0` as falsy | `css('margin', 0)` removes the margin instead of setting it |

## Real-world connection

React does almost exactly this when applying the `style` prop: numbers get `px` appended unless the property is in its `isUnitlessNumber` list (`opacity`, `zIndex`, `flexGrow`, `lineHeight`...), custom properties go through `style.setProperty`, and `null`/`''` removes the property. Styled-components and Emotion maintain similar unitless lists.

## Follow-ups

- **Vendor prefixes:** try `webkitX` / `mozX` if the unprefixed property isn't supported (`name in el.style`).
- **`!important`:** `setProperty(name, value, 'important')`.
- **Animations:** prefer toggling classes or the Web Animations API (`el.animate`) over setting styles every frame.
