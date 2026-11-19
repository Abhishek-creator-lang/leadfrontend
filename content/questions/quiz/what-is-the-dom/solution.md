## TL;DR

The **DOM (Document Object Model)** is the browser's **live, in-memory tree of objects** representing the page, built by parsing HTML (or created by script). Each piece of the document is a **node**: the `Document` at the root, then **element nodes**, **text nodes**, comments and so on. JavaScript reads and changes the page through the DOM API, and the browser **re-renders** to reflect those changes. The DOM is **not** the HTML source and **not** what's painted; it sits between them.

## The structure

```html
<!DOCTYPE html>
<html lang="en">
  <head><title>Shop</title></head>
  <body>
    <h1 class="title">Cart</h1>
    <!-- items -->
    <ul id="items"><li>Apple</li></ul>
  </body>
</html>
```

```
Document
├── DocumentType (html)
└── <html>
    ├── <head>
    │   └── <title> → Text "Shop"
    └── <body>
        ├── Text "\n    "          ← whitespace is a text node too
        ├── <h1 class="title"> → Text "Cart"
        ├── Comment " items "
        └── <ul id="items">
            └── <li> → Text "Apple"
```

## Node types and interfaces

| Node type | `nodeType` | Example |
|---|---|---|
| Element | 1 | `<div>`, `<svg>` |
| Text | 3 | text inside elements, including whitespace |
| Comment | 8 | `<!-- … -->` |
| Document | 9 | `document` |
| DocumentType | 10 | `<!DOCTYPE html>` |
| DocumentFragment | 11 | off-tree container, `<template>.content`, shadow roots |

Interfaces form an inheritance chain: `HTMLButtonElement → HTMLElement → Element → Node → EventTarget`. That's why every element can do `addEventListener` (EventTarget), `appendChild` (Node), `querySelector` (Element) and has `.hidden` (HTMLElement).

## Navigating

```js
const list = document.getElementById('items');
list.parentElement;        // <body>
list.children;             // HTMLCollection of element children (live)
list.childNodes;           // NodeList incl. text/comment nodes (live)
list.firstElementChild;    // <li>
list.previousElementSibling; // <h1>
document.documentElement;  // <html>
list.closest('body');      // nearest ancestor (or self) matching a selector
```

Prefer the `*Element*` variants (`children`, `firstElementChild`) to skip whitespace text nodes.

## How it relates to rendering

1. HTML is parsed into the **DOM**; CSS into the **CSSOM**.
2. They combine into a **render tree** (no `display: none` elements, but includes pseudo-elements).
3. **Layout** computes geometry, then **paint** and **composite**.

DOM changes invalidate style/layout; the browser batches the work until the next frame. Reading layout properties (`offsetHeight`, `getBoundingClientRect`) right after writes forces a synchronous layout (**layout thrashing**), so batch reads before writes.

## Things worth knowing

- **It's live and mutable.** Scripts, extensions and the parser (for streamed HTML) can change it at any time. `MutationObserver` lets you react to changes.
- **The DOM can differ from the source:** the parser fixes invalid markup (inserting `<tbody>`, closing tags), and frameworks build it entirely at runtime. DevTools' Elements panel shows the DOM, while "View source" shows the original HTML.
- **Shadow DOM** gives components encapsulated subtrees with their own styles, attached to a host element.
- **The DOM is a standard** (WHATWG DOM Living Standard), and the same API exists for XML/SVG documents.
- **Virtual DOM** (React) is a JS description of UI that's diffed to produce minimal real DOM updates. It's an abstraction over the DOM, not a replacement.

## In an interview, mention…

- Tree of nodes, node types, and the interface hierarchy ending in `EventTarget`.
- Differences between DOM, HTML source and the render tree.
- Performance implications: batching, layout thrashing, and why frameworks minimise DOM writes.
