## TL;DR

**`document.getElementById('x')`** looks up **one element by its `id`**: no selector parsing, only available on `document` (and `DocumentFragment`/shadow roots), and returns `null` if not found. **`querySelector('selector')`** accepts **any CSS selector**, returns the **first match in document order**, and can be called on **any element** to search within it. `getElementById` is marginally faster, but in practice the difference is negligible. Choose based on what you're matching and the scope you need.

## Basic usage

```html
<form id="signup">
  <input name="email" class="field" />
  <button type="submit" class="btn primary">Join</button>
</form>
```

```js
document.getElementById('signup');                 // <form>
document.querySelector('#signup');                 // same element
document.querySelector('#signup .btn.primary');    // descendant + multiple classes
form.querySelector('input[name="email"]');         // scoped to the form
document.querySelector('.missing');                // null
```

## Differences

| | `getElementById` | `querySelector` |
|---|---|---|
| Argument | Raw id string, no `#` | CSS selector |
| Called on | `document` (and fragments/shadow roots) | `document`, any element, fragments |
| Returns | Element or `null` | First match or `null` |
| Invalid input | Just returns `null` | Throws `SyntaxError` for invalid selectors |
| Speed | Direct id map lookup | Parses the selector, then matches (browsers fast-path simple `#id`) |
| Multiple results | n/a (ids should be unique) | Use `querySelectorAll` (static `NodeList`) |

## Escaping gotcha

IDs can contain characters that are special in CSS:

```js
// <div id="user:42">, <div id="1st-item">
document.getElementById('user:42');            // works
document.querySelector('#user:42');            // SyntaxError / wrong match (":42" parsed as pseudo-class)
document.querySelector(`#${CSS.escape('1st-item')}`); // works: ids starting with a digit need escaping
```

Use `CSS.escape` whenever you build selectors from dynamic values.

## Static vs live collections

```js
const a = document.querySelectorAll('.item');       // static NodeList snapshot
const b = document.getElementsByClassName('item');  // live HTMLCollection
document.body.append(Object.assign(document.createElement('div'), { className: 'item' }));
a.length; // unchanged
b.length; // +1
```

Static lists are safer to loop over while you mutate the DOM. `NodeList` from `querySelectorAll` also has `forEach`.

## When to use which

- **`getElementById`**: you have a known, unique id. Clear intent, works with odd characters.
- **`querySelector`**: anything else, especially **scoped queries** inside a component root (`root.querySelector('[data-role="close"]')`), attribute selectors, or `:scope > li` for direct children.
- **`element.closest(selector)`** for going **up** the tree, typically in event delegation.

## Pitfalls

- **Duplicate ids**: both methods return the first one, silently. Duplicate ids also break `label for`, ARIA references and fragment links.
- **Global id variables**: browsers expose elements with ids as `window.signup`. Don't rely on it; it's fragile and shadowed by real globals.
- **Querying before the element exists**: scripts in `<head>` without `defer` run before the body is parsed, so you get `null`.
- **In frameworks**, prefer refs (`useRef`) over global queries; ids may be duplicated when a component renders twice. React's `useId` helps generate unique ids.
- **Shadow DOM**: `document.querySelector` doesn't pierce shadow roots; query the `shadowRoot` itself.

## In an interview, mention…

- Selector power and scoping vs a direct id lookup; performance is rarely the deciding factor.
- `CSS.escape` for dynamic selectors and the static vs live collection difference.
- Practical modern guidance: scoped queries, `closest`, refs in frameworks.
