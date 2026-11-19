Documentation sites show a "On this page" sidebar built from the article's headings. Implement two functions:

1. `tableOfContents(root)` (default export) reads every `h1`–`h6` inside `root`, **ensures each heading has an `id`** so it can be linked to, and returns a nested tree.
2. `renderToc(tree)` (named export) turns that tree into nested `<ul>` HTML.

```js
document.body.innerHTML = `
  <article id="doc">
    <h1>Getting started</h1>
    <h2>Install</h2>
    <h3>With npm</h3>
    <h2 id="config">Configure</h2>
    <h4>Advanced flags</h4>
    <h2>Install</h2>
  </article>`;

const toc = tableOfContents(document.getElementById('doc'));
```

`toc` is:

```js
[
  {
    id: 'getting-started', text: 'Getting started', level: 1,
    children: [
      { id: 'install', text: 'Install', level: 2,
        children: [{ id: 'with-npm', text: 'With npm', level: 3, children: [] }] },
      { id: 'config', text: 'Configure', level: 2,
        children: [{ id: 'advanced-flags', text: 'Advanced flags', level: 4, children: [] }] },
      { id: 'install-1', text: 'Install', level: 2, children: [] },
    ],
  },
]
```

and `renderToc(toc)` returns (whitespace added here for readability; the real output has none):

```html
<ul>
  <li><a href="#getting-started">Getting started</a>
    <ul>
      <li><a href="#install">Install</a><ul><li><a href="#with-npm">With npm</a></li></ul></li>
      ...
    </ul>
  </li>
</ul>
```

## Rules

**Nesting.** Each heading becomes a child of the closest **preceding** heading with a **lower** level number. Skipped levels are allowed: an `h4` directly after an `h2` is a child of the `h2`. A heading with no lower-level heading before it is a top-level entry.

**Text.** The heading's `textContent` with whitespace runs collapsed to one space and trimmed.

**Ids.** Keep an existing non-empty `id`. Otherwise generate a slug and set it on the heading:
- lower-case the text, replace each run of characters other than `a–z` and `0–9` with `-`, and trim leading/trailing `-`;
- if that's empty, use `section`;
- if the slug is already used by **any element inside `root`** (or by a heading processed earlier), append `-1`, `-2`, … until it's unique.

**Rendering.** An empty tree renders as `''`. Otherwise output `<ul>`, then for each entry `<li><a href="#ID">TEXT</a>` + the rendered children (if any) + `</li>`, then `</ul>`. Escape `&`, `<`, `>` and `"` in the text and in the id.

## Follow-up

- How would you highlight the section currently on screen as the user scrolls?
- What accessibility markup should the rendered TOC have?
- How would you keep the TOC in sync if the content changes after load?
