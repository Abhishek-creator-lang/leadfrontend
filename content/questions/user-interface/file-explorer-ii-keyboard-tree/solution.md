## What changes from Part I

Part I used the **disclosure** pattern: every folder is a button and a separate tab stop. That's fine for a short sidebar but painful with 200 files. The **tree view** pattern makes the whole tree a *single* tab stop and moves focus inside it with the arrow keys, the way native file managers work. The roles (`tree`, `treeitem`, `group`) tell screen readers to expect that behaviour, so if you add the roles you are committing to the full keyboard model.

## State design

| State | Type | Why |
|---|---|---|
| `expanded` | `Set<id>` | Which folders are open (same as Part I) |
| `focusedId` | `id` | The roving tab stop. It's state, not just DOM focus, because `tabIndex` must be rendered from it |
| `selectedId` | `id \| null` | Selected file (separate from focus, which is the APG recommendation for file managers) |

Everything else is **derived** with `useMemo`:

- `sorted`: the folders-first, alphabetical tree.
- `byId`: `Map<id, { node, parentId }>`, so <kbd>←</kbd> can find the parent in O(1) without parent pointers in the data.
- `visible`: the depth-first list of ids the user can currently see. Up/Down/Home/End/type-ahead are just index arithmetic on this array. That's the core insight of the question: **keyboard navigation in a tree is navigation over the flattened visible list**, plus two special keys (<kbd>→</kbd>/<kbd>←</kbd>) that use the hierarchy.
- `tabStopId`: `focusedId`, or its nearest visible ancestor if a mouse click collapsed a folder above it. Without this the tree can end up with **zero** elements at `tabIndex=0` and becomes unreachable by keyboard.

## Focus management

- Each `treeitem` registers its element in a `Map` of refs through a callback ref. A callback ref that also handles `null` (unmount) keeps the map from leaking detached nodes.
- `focusItem(id)` sets state **and** calls `.focus()` synchronously. The target is always already mounted: the APG model deliberately splits "open" and "move into" across two <kbd>→</kbd> presses, so we never need to focus something that is about to render. (If you did need that, focus in a `useLayoutEffect` keyed on `focusedId`, guarded so it only runs when focus is already inside the tree, so you don't steal focus on mount.)
- One `onKeyDown` and one `onFocus` sit on the `role="tree"` element (event delegation). The target item is found with `closest('[role="treeitem"]')`. `onFocus` only accepts focus when the item *itself* is the target, because React's focus events bubble through nested treeitems.
- Every handled key calls `preventDefault()` so arrows don't scroll the page and <kbd>Space</kbd>/<kbd>Enter</kbd> don't trigger anything else.

## Accessibility details

- `role="tree"` with `aria-label`; items are `<li role="treeitem">`; children are in `<ul role="group">` **inside** the parent treeitem, so the DOM nesting gives screen readers the hierarchy.
- `aria-level`, `aria-posinset` and `aria-setsize` are set explicitly. Browsers can compute them from the DOM, but explicit values become *required* once you virtualize, so it's a good habit.
- **Accessible names.** A treeitem's name is computed from its content, which would include every descendant's name ("src index.js components Header.js…"). `aria-labelledby` pointing at the label span fixes that. IDs come from `useId` so two trees never collide.
- `aria-expanded` only on folders (on a file it would announce a bogus "collapsed"). `aria-selected` only on selectable items.
- Selection is announced through an `aria-live="polite"` status line.
- The focus ring is drawn on the focused item's *row* (`.treeitem:focus-visible > .row`), not on the whole `li`, which would outline the entire subtree.

## Edge cases

- <kbd>↓</kbd> on the last item / <kbd>↑</kbd> on the first: stay put (the APG tree doesn't wrap).
- <kbd>→</kbd> on an open but empty folder: nothing to move into, so do nothing.
- <kbd>←</kbd> on a top-level item: `parentId` is `null`, `focusItem(null)` is a no-op.
- Type-ahead ignores modifier combos (so <kbd>Ctrl</kbd>+<kbd>R</kbd> still reloads) and whitespace, and wraps around. A production version buffers keys typed within ~500 ms so "pa" jumps to `package.json`.
- Data changes while an id is focused or selected: derived maps recompute; `tabStopId` falls back to the first visible item if the id no longer exists.

## Performance and scaling

- Handlers close over `visible`, `expanded` and `byId`, which only change when the tree actually changes. For thousands of nodes, pass primitive props (`isOpen`, `isTabStop`, `isSelected`) and wrap `TreeItem` in `React.memo`, so moving focus re-renders two rows, not the whole tree.
- **Virtualization.** Render the `visible` array as a flat, windowed list (each row an `li role="treeitem"` with explicit `aria-level/posinset/setsize`, which is why we set them). Focusing an item that's scrolled out means scrolling it into view first, then focusing after it mounts (`useLayoutEffect`).
- **Lazy loading.** Mark unloaded folders with `aria-expanded="false"` and an `aria-busy` loading row while fetching; <kbd>→</kbd> triggers the fetch.

## Follow-ups

- **Multi-select:** `aria-multiselectable="true"` on the tree, `selected` becomes a `Set`, <kbd>Shift</kbd>+<kbd>↓</kbd> extends the range over `visible`, <kbd>Ctrl</kbd>+<kbd>A</kbd> selects all.
- <kbd>*</kbd>: add all sibling folder ids of the focused item to `expanded` in one update.
- **Testing:** query by role and name (`getByRole('treeitem', { name: 'src' })`) and assert on `document.activeElement`, `tabindex` and `aria-expanded`, which is exactly what assistive technology sees.
