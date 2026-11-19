## TL;DR

`innerHTML` reads and writes an element's content **as HTML markup**: on write, the string is parsed and turned into DOM nodes. `textContent` reads and writes **plain text only**: on write, the string becomes a single text node, so `<b>` shows up literally. Prefer `textContent` for any text, because it is **faster and cannot inject markup**. Use `innerHTML` only with trusted or sanitized HTML.

## Reading

```html
<p id="p">Hello <b>world</b><span hidden>!</span></p>
```

```js
const p = document.getElementById('p');
p.innerHTML;   // 'Hello <b>world</b><span hidden="">!</span>'  (serialized markup)
p.textContent; // 'Hello world!'  (all text nodes, including hidden ones)
p.innerText;   // 'Hello world'   (rendered text only, needs layout)
```

- `innerHTML` serializes the subtree back to markup. Attribute order and quoting may differ from the source.
- `textContent` concatenates every descendant text node, including `<script>`/`<style>` contents and hidden elements. It does no layout, so it's cheap.
- `innerText` is the third option people forget: it is **layout-aware** (respects CSS `display: none`, `text-transform`, line breaks). Reading it forces a style/layout calculation, which can cause layout thrashing in loops.

## Writing

```js
const name = '<img src=x onerror="alert(1)">';

el.textContent = `Hi ${name}`; // shows the literal string, safe
el.innerHTML  = `Hi ${name}`;  // creates an <img>, onerror runs → XSS
```

Both setters **remove all existing children**. That has side effects:

- Event listeners attached to the old child nodes are gone (the nodes are discarded).
- Form state, focus and scroll positions inside the subtree are lost.
- References you held to old children now point to detached nodes.

`el.innerHTML += '<li>…</li>'` is a classic anti-pattern: it serializes the whole subtree, re-parses it and rebuilds everything, wiping listeners on the existing items. Use `insertAdjacentHTML('beforeend', …)` or `append()` instead.

## Security notes

- `<script>` tags inserted via `innerHTML` do **not** execute, but event-handler attributes (`onerror`, `onload`) and `javascript:` URLs do. So "scripts don't run" doesn't make it safe.
- If you must render user-supplied HTML (rich text, Markdown output), sanitize it first with a library like DOMPurify. The newer `Element.setHTML()` (HTML Sanitizer API) and Trusted Types (`require-trusted-types-for 'script'` in CSP) help enforce this across a codebase.
- Frameworks mirror this split. React escapes text by default and makes raw HTML explicit through `dangerouslySetInnerHTML`.

## Performance

- `textContent = ''` is a fast way to clear an element (`replaceChildren()` is the modern, more explicit alternative).
- For large lists, build nodes in a `DocumentFragment` or with a single `innerHTML` assignment of trusted template output rather than many incremental writes.

## In an interview, mention…

- `textContent` = text in, text out; `innerHTML` = markup parsed into nodes.
- The XSS risk of `innerHTML` with untrusted input, plus sanitizers and Trusted Types.
- `innerText` exists and triggers layout; `textContent` doesn't.
- Setting either one destroys the children and their listeners.
