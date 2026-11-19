## TL;DR

There are four main levers, from most to least preferred: **toggle classes** (`classList`), **set CSS custom properties** (`style.setProperty('--x', …)`), **set inline styles** (`el.style.prop`), and **edit stylesheets** (`CSSStyleSheet`, constructable stylesheets). Read computed values with `getComputedStyle()`. Keep styling in CSS and let JavaScript change **state**, not individual pixels.

## 1. Classes: the default choice

```js
el.classList.add('is-open');
el.classList.remove('is-loading');
el.classList.toggle('is-active', isActive); // second arg forces on/off
el.classList.contains('is-open');
el.classList.replace('theme-light', 'theme-dark');
```

Styles stay in CSS where they can use media queries, transitions, `:hover` and the cascade. For state that maps to semantics, prefer attributes like `aria-expanded="true"` or `data-state="open"` and select on them in CSS. That keeps accessibility and styling in sync.

## 2. CSS custom properties: dynamic values

```js
el.style.setProperty('--progress', `${pct}%`);
document.documentElement.style.setProperty('--accent', userColor);
```

```css
.bar { width: var(--progress); background: var(--accent); }
```

This is the clean way to pass *values* (positions, colours, sizes) from JS while CSS still decides how they're used. Theming usually works this way.

## 3. Inline styles

```js
el.style.backgroundColor = 'tomato'; // camelCase
el.style.setProperty('background-color', 'tomato', 'important'); // kebab-case + priority
el.style.removeProperty('background-color');
el.style.cssText = 'color: red; padding: 4px'; // replaces all inline styles
Object.assign(el.style, { top: '10px', left: '20px' });
```

- Numbers need units (`'10px'`, not `10`). Invalid values are silently ignored.
- `el.style` only reflects **inline** styles, not what comes from stylesheets.
- Inline styles have high specificity, which makes overriding them from CSS painful. Good for truly per-element dynamic values like a drag position (prefer `transform` there for performance).

## 4. Reading the actual style

```js
const cs = getComputedStyle(el);
cs.getPropertyValue('font-size'); // '16px', resolved value
cs.getPropertyValue('--accent');  // custom properties too
getComputedStyle(el, '::before').content;
```

Reading computed style or geometry (`offsetWidth`, `getBoundingClientRect`) can force a synchronous style/layout recalculation. Interleaving reads and writes in a loop causes **layout thrashing**, so batch reads first, then writes (or write inside `requestAnimationFrame`).

## 5. Stylesheets

```js
const sheet = new CSSStyleSheet();
sheet.replaceSync('.card { border-radius: 8px; }');
document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
```

Constructable stylesheets are useful for Web Components (shared across shadow roots) and for injecting rules once instead of styling many elements individually. `sheet.insertRule()` works on existing sheets too.

## Animations

For JS-driven animation, the Web Animations API (`el.animate(keyframes, options)`) gives you CSS-performance animations with JS control (pause, reverse, `finished` promise). Animate `transform` and `opacity` to stay on the compositor.

## In an interview, mention…

- Class/attribute toggling as the default, so CSS owns presentation.
- Custom properties for dynamic values, inline styles only for per-element values.
- `getComputedStyle` vs `el.style`, and the layout-thrashing risk of reads.
- CSP: inline `style` *attributes* in HTML can be blocked by `style-src` without `'unsafe-inline'`, but setting `el.style` from script is allowed.
