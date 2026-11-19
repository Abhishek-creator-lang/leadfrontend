## Approach

1. **Resolve the target to an array of elements.** A string goes through `document.querySelectorAll` (converted to an array so it's a static snapshot), and an `Element` becomes `[element]`.
2. **Parse class strings** with `names.trim().split(/\s+/)`, filtering out empty strings, so any amount of whitespace works and `''` produces no tokens.
3. **Delegate to `classList`.** `DOMTokenList` already handles "no duplicates" (`add`), "ignore missing" (`remove`) and per-element toggling (`toggle(name, force)`).
4. **Return the wrapper** from every mutating method for chaining. That's the "fluent interface" pattern jQuery made famous.

```js
toggleClass(names, force) {
  const list = split(names);
  elements.forEach((el) => list.forEach((name) => el.classList.toggle(name, force)));
  return this;
}
```

`classList.toggle(name, undefined)` behaves like a normal toggle, so passing `force` straight through handles both cases. (`toggle` treats a **missing** second argument and an explicit `undefined` the same way.)

`removeClass()` with no argument uses `el.removeAttribute('class')`, or `el.className = ''`; both remove every class.

## Complexity

Each method is O(E × C), for E elements and C class names. Selector matching is done once, when `$` is called.

## Edge cases

- **No matches:** every method iterates an empty array and still returns the wrapper. `hasClass` returns `false`.
- **Empty string arguments:** `split` returns `[]`. Passing `''` to `classList.add` would throw a `SyntaxError`, so filtering empties matters.
- **Mixed state toggles:** per element, because we call `toggle` on each element.
- **`hasClass('a b')`:** jQuery checks for the literal string; here we just pass the single class name to `contains`.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `el.className += ' ' + name` | Duplicates and stray spaces |
| `el.className.replace(name, '')` | Removing `btn` breaks `btn-primary` |
| Returning `undefined` from methods | Chaining throws |
| Toggling based on the *first* element's state | Elements with mixed state all end up the same |
| `classList.add('a b')` | Throws `InvalidCharacterError`: tokens can't contain spaces |

## Why jQuery matters less now

jQuery papered over browser inconsistencies (old IE had no `classList`, `querySelectorAll` or `addEventListener`). Modern DOM APIs cover most of it natively, and component frameworks (React, Vue, Svelte) render class names declaratively from state (`className={clsx('btn', { active })}`) instead of mutating them. Imperative class toggling is still common in design-system web components, animations and progressive enhancement scripts.

## Performance note

`$('.btn')` runs `querySelectorAll` every time. Inside a loop or a scroll handler, cache the wrapper (`const $btns = $('.btn')`). Batch class changes so the browser recalculates styles once, not once per element (style recalcs are lazy, but reading layout between writes forces them).

## Follow-ups

- **`.each(fn)`** iterating with `fn.call(el, index, el)`.
- **`.css()`:** see *jQuery CSS*.
- **`.on(event, selector, handler)`** with event delegation.
- Make the wrapper array-like (`wrapper[0]`, `wrapper.length`) like a real jQuery object.
