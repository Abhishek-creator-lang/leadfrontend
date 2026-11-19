Implement `getElementsByStyle(root, property, value)`. It returns an array of every element **below** `root` (not `root` itself), in document order, whose **computed** value of the CSS `property` equals `value`.

The catch: the same style can be written many ways. `red`, `#f00`, `#ff0000` and `rgb(255,0,0)` are the same colour, and `getComputedStyle` reports all of them as `rgb(255, 0, 0)`. Your function must treat equivalent values as equal.

```js
document.body.innerHTML = `
  <div id="root">
    <p style="color: red">A</p>
    <p style="color: #ff0000">B</p>
    <p style="color: blue">C</p>
  </div>`;

const root = document.getElementById('root');
getElementsByStyle(root, 'color', 'red').map((el) => el.textContent);        // ['A', 'B']
getElementsByStyle(root, 'color', 'rgb(255,0,0)').map((el) => el.textContent); // ['A', 'B']
```

## Requirements

- `property` is a CSS property name in kebab-case (`'font-size'`, `'background-color'`).
- Read each element's value with `window.getComputedStyle(el).getPropertyValue(property)`.
- Normalise `value` **the same way**, so equivalent spellings compare equal.
- Results are in document order. Only elements are returned.
- `root` is attached to the document.

## Follow-up

- Why is calling `getComputedStyle` in a loop potentially slow in a real browser?
- What's the difference between specified, computed, used and resolved values?
- How would you find elements that are actually *visible*?
