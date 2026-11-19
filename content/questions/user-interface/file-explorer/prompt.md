Build a `FileExplorer` that renders a project's folder structure, similar to the sidebar of a code editor.

The starter contains the data as a nested array. Each node has an `id` and a `name`. Folders also have a `children` array (which may be empty); files don't.

```js
{ id: 1, name: 'src', children: [{ id: 2, name: 'index.js' }] }
```

## Requirements

1. Render the whole tree. Nested items are indented under their parent.
2. Folders start **collapsed**. Clicking a folder toggles it open or closed and shows an open/closed indicator.
3. Files are not clickable (they're plain text for this question).
4. Within every folder (and at the root), list **folders first, then files**, each group sorted alphabetically, case-insensitively.
5. An empty folder can still be expanded; show nothing (or an "Empty" hint) inside it.
6. A folder's open state is preserved when its parent is collapsed and re-opened.
7. Accessibility: folders are real `<button>`s with `aria-expanded`; the structure is a nested list so screen readers announce levels and item counts.

## Follow-up

- Add full keyboard support with the WAI-ARIA tree pattern (see *File Explorer II*).
- The data comes from an API one level at a time (lazy loading). What changes?
- The tree has 50,000 nodes. How do you keep it fast?
