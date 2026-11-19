## TL;DR

A Fragment (`<>…</>` or `<Fragment>…</Fragment>`) lets a component **return multiple elements without adding an extra DOM node**. This matters because a component returns a single value, and wrapper `<div>`s can **break HTML semantics** (tables, lists, definition lists), **break CSS layouts** (flex/grid children), and add DOM bloat. Use the long form `<Fragment key={…}>` when you need a **key** in a mapped list.

## Basic use

```jsx
function Columns() {
  return (
    <>
      <td>Name</td>
      <td>Email</td>
    </>
  );
}

function Table() {
  return (
    <table>
      <tbody>
        <tr><Columns /></tr>
      </tbody>
    </table>
  );
}
```

A `<div>` around the `<td>`s would produce invalid HTML (`<tr><div><td>`). Browsers repair it unpredictably, and React warns about invalid nesting (which also causes hydration problems).

## Keyed fragments

```jsx
import { Fragment } from 'react';

function Glossary({ terms }) {
  return (
    <dl>
      {terms.map(t => (
        <Fragment key={t.id}>
          <dt>{t.word}</dt>
          <dd>{t.definition}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
```

`<dl>` expects `<dt>`/`<dd>` pairs as direct children, so a keyed fragment is the only clean way to emit pairs. The short syntax `<>` can't take `key` or any other attribute.

## Why not just use a wrapper div?

- **Semantics:** `<ul>` → `<li>`, `<table>` → `<tr>` → `<td>`, `<select>` → `<option>`, and `<dl>` all have strict content models.
- **Layout:** in `display: flex` or `grid` containers, an extra wrapper becomes the flex/grid item and breaks the layout. (`display: contents` is a CSS workaround but has had accessibility bugs in some browsers.)
- **DOM size and styling:** fewer nodes, fewer surprising `:first-child`/`>` selector breakages.

## Fragments and state

A Fragment has no DOM node but still matters for reconciliation. React special-cases **one level** of fragment: switching between `<Child />`, `<><Child /></>` and `[<Child />]` keeps `Child`'s state. Go deeper (`<><><Child /></></>` vs `<Child />`) and the tree shape no longer matches, so **`Child` remounts and loses its state**. Keep the structure consistent between conditional branches.

## Other notes

- Arrays are also valid return values (`return [<li key="a" />, <li key="b" />]`), but they need keys and read worse than a fragment.
- Fragments accept only `key` (and, in canary/experimental builds, a `ref` for fragment refs). There's no `className` or event handlers, because there's no DOM node.
- Since the automatic JSX runtime, `<>` doesn't need `React` in scope.

## In an interview, mention…

- Fragments group children without a DOM node, so they preserve semantics and layout.
- Use keyed `<Fragment>` in lists (and remember `<>` can't take a key).
- Concrete cases: table rows/cells, `<dl>` pairs, flex/grid children.
- They're still part of the reconciled tree, so changing the structure can affect state preservation.
