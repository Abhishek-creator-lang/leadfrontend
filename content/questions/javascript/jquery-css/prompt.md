Implement `$(target)`, which returns a wrapper with a jQuery-style `css` method. `target` is a CSS selector string (matched against `document`) or a single `Element`.

`css` is both a **getter** and a **setter**, depending on its arguments:

```js
document.body.innerHTML = '<div class="box"></div><div class="box"></div>';

$('.box').css('width', 120);                  // number -> '120px' on both boxes
$('.box').css({ backgroundColor: 'red', opacity: 0.5, 'z-index': 3 });
$('.box').css('color', 'blue').css('margin-top', '1em'); // chainable

$('.box').css('opacity');  // '0.5'  (getter: computed value of the FIRST match)
$('.box').css('color');    // 'rgb(0, 0, 255)'

$('.box').css('width', null);  // removes the inline width
$('.missing').css('color');    // undefined
```

## Behaviour

| Call | Result |
|---|---|
| `css(name)` | Returns `getComputedStyle(first).getPropertyValue(name)` for the **first** matched element, or `undefined` if nothing matched. |
| `css(name, value)` | Sets the inline style on **every** match. Returns the wrapper. |
| `css({ name: value, ... })` | Sets every entry on every match. Returns the wrapper. |

## Requirements

- Property names may be **camelCase** (`backgroundColor`) or **kebab-case** (`background-color`). CSS custom properties (`--brand`) are used as-is.
- A **number** value gets `px` appended, **except** for unitless properties: `opacity`, `z-index`, `font-weight`, `line-height`, `flex`, `flex-grow`, `flex-shrink`, `order` and `zoom`. Custom properties never get units.
- `null` or `''` **removes** the inline property.
- Invalid values are ignored by the browser (no error).

## Follow-up

- Why is reading `css('width')` inside a loop that also sets styles a performance problem?
- Why does the getter use computed styles while the setter writes inline styles?
- How does React decide whether to append `px` to a numeric `style` value?
