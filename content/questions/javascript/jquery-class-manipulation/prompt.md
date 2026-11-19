Implement a small `$` function inspired by jQuery's class helpers.

`$(target)` accepts a CSS selector string (matched against `document`) or a single `Element`, and returns a wrapper object. Every method applies to **all** matched elements and returns the wrapper so calls can be chained, except `hasClass`, which returns a boolean.

```js
document.body.innerHTML = `
  <button class="btn">Save</button>
  <button class="btn primary">Send</button>`;

$('.btn').addClass('large rounded').removeClass('primary');
// both buttons: class="btn large rounded"

$('.btn').toggleClass('active');      // adds "active" to both
$('.btn').toggleClass('active');      // removes it again
$('.btn').toggleClass('active', true); // force: always add

$('.btn').hasClass('large');   // true
$('.nothing').addClass('x');   // no matches: does nothing, still chainable
```

## API

| Method | Behaviour |
|---|---|
| `length` | Number of matched elements. |
| `addClass(names)` | Adds each class in the whitespace-separated `names`. |
| `removeClass(names?)` | Removes each class in `names`. With no argument, removes **all** classes. |
| `toggleClass(names, force?)` | Toggles each class. If `force` is `true`, always adds; if `false`, always removes. |
| `hasClass(name)` | `true` if **any** matched element has the class `name`. |

## Requirements

- Class lists are whitespace-separated: `addClass('  a   b ')` adds `a` and `b`.
- Don't create duplicate classes; don't touch unrelated classes.
- Each element toggles **independently**: if one element has `active` and another doesn't, `toggleClass('active')` flips each one.
- Works with zero matched elements.

## Follow-up

- Why did jQuery's API become less necessary over time?
- How would you add `.css()`, `.on()` or `.each()` to this wrapper?
- What is the cost of calling `$('.btn')` repeatedly inside a loop?
