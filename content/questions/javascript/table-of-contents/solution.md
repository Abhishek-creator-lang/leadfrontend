## Approach

The problem has three independent parts. Solving them separately keeps the code small.

### 1. Collect headings in document order

`root.querySelectorAll('h1, h2, h3, h4, h5, h6')` returns matches in **document order** regardless of the order in the selector, which is exactly what a TOC needs. The level is `Number(heading.tagName[1])`.

### 2. Build the tree with a stack

This is the key insight. Keep a stack of the "open" entries along the current path from the top level down. For each heading:

```js
while (stack.length && stack[stack.length - 1].level >= entry.level) stack.pop();
const parent = stack[stack.length - 1];
(parent ? parent.children : roots).push(entry);
stack.push(entry);
```

- Pop every entry whose level is the same or deeper. Those sections are now closed.
- Whatever remains on top is the closest preceding heading with a lower level: the parent.
- Push the new entry, since it may be the parent of what follows.

Skipped levels fall out naturally: an `h4` after an `h2` pops nothing (2 < 4), so it becomes the `h2`'s child. An `h2` that appears before any `h1` just becomes a top-level entry. The same stack technique parses indentation-based outlines, Markdown lists and matching brackets.

### 3. Unique ids

Start a `Set` with every id already used inside `root` (`root.querySelectorAll('[id]')`), so generated slugs never collide with existing anchors. For a heading without an id:

```js
let id = base, n = 1;
while (used.has(id)) id = `${base}-${n++}`;
used.add(id);
heading.id = id;
```

Writing the id back onto the heading is what makes `href="#install-1"` actually scroll somewhere. Headings that already have an id keep it.

### Rendering

A recursive function: `''` for an empty list, otherwise `<ul>` + one `<li>` per entry with the link and `render(children)` + `</ul>`. All interpolated text goes through an escape function, since heading text is content and may contain `<` or `&`.

## Complexity

O(H) for H headings to build the tree (each entry is pushed and popped at most once), plus O(N) to collect existing ids. Rendering is O(H). Slug deduplication is O(k) per heading for k collisions, which is small in practice.

## Edge cases

- Duplicate heading text: `install`, `install-1`, `install-2`.
- A generated slug that equals an existing element's id elsewhere in `root`: skipped.
- Text with only punctuation or non-Latin characters (`"???"`, `"日本語"`): slug is empty, so fall back to `section`. (A production slugger would keep Unicode letters; GitHub's does.)
- Empty `id=""` attributes count as "no id".
- No headings: `[]` and `''`.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Nesting by "level === parent.level + 1" only | Skipped levels (h2 to h4) are lost or crash |
| Querying `h1`, then `h2`, ... separately and concatenating | Document order is destroyed |
| Not writing generated ids back to the DOM | Links point at nothing |
| Deduping only against generated ids | Collides with ids authors already used |
| Rendering text without escaping | A heading like `<img onerror=...>` becomes markup |

## Accessibility

Wrap the list in `<nav aria-label="Table of contents">` so screen-reader users can jump to it as a landmark. Mark the active link with `aria-current="true"` (or `"location"`). Nested `<ul>`s convey hierarchy to assistive technology for free. Avoid relying on colour alone for the active state.

## Real-world connection

- **Docusaurus, VitePress, Nextra and GitHub's README view** generate heading ids with a slugger that dedupes with `-1`, `-2` (GitHub's `github-slugger` behaves that way) and build the "On this page" sidebar from headings.
- **Scroll spy:** an `IntersectionObserver` watching each heading (with a `rootMargin` that treats the top of the viewport as "current") updates the active link without listening to `scroll` events.
- **Live content:** a `MutationObserver` on the article can rebuild the TOC when content changes, debounced.

## Follow-ups

- Limit depth (only h2–h3) via an options object.
- Return DOM nodes instead of an HTML string, which avoids escaping entirely.
- Smooth scrolling with `scroll-margin-top` on headings so a sticky header doesn't cover the target.
