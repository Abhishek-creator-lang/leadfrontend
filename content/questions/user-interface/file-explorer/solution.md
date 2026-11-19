## Component architecture

Three small pieces:

- `FileExplorer` owns state and prepares data.
- `TreeList` renders one level as a `<ul>`.
- `TreeNode` renders one item. A folder recursively renders a `TreeList` of its children.

Recursion in JSX mirrors the recursive data, so the code stays the same no matter how deep the tree goes. Keys are the node `id`s, never array indices: sorting changes positions, and index keys would attach the wrong state to the wrong row.

## State design

The only interactive state is **which folders are open**. There are two reasonable places to keep it:

| Option | Pros | Cons |
|---|---|---|
| `useState(false)` inside each `TreeNode` | Very simple, fully local | When a parent collapses, its children unmount and **lose** their state (requirement 6 fails). Can't do "collapse all" or persist to the URL. |
| A `Set` of open ids at the root | Survives unmounting; easy "expand all", persistence, controlled mode | A toggle creates a new `Set`, which re-renders the tree |

The solution lifts a `Set<id>` to the root. Updates always build a **new** `Set` (mutation would keep the same reference and React would skip the render). `onToggle` is wrapped in `useCallback` so it is stable. If rendering ever became expensive you could wrap `TreeNode` in `React.memo` and pass `isOpen` instead of the whole set, so only the toggled branch re-renders.

An alternative that also preserves state is rendering collapsed children with `hidden` instead of unmounting them, but that keeps every node in the DOM, which doesn't scale to large trees.

## Sorting

Sorting is **derived data**: do it with `useMemo` over the `data` prop, not by storing a sorted copy in state (which goes stale when props change). `sortTree` returns a new tree and never mutates the input. Comparison uses `Intl.Collator` with `sensitivity: 'base'` (case-insensitive, locale-aware) and `numeric: true` so `file2` sorts before `file10`. Creating the collator once is faster than calling `localeCompare` with options in every comparison.

A node is a folder if it **has a `children` array**, so an empty folder (`children: []`) is still a folder. Checking `children?.length` is a common bug: empty folders would show up as files.

## Accessibility

- Folders are native `<button type="button">` elements, so mouse, Enter and Space all work without extra code, and `aria-expanded` announces "collapsed"/"expanded".
- The structure is nested `<ul>`/`<li>`. Screen readers announce "list, 4 items" and nesting levels for free. Decorative icons and carets are `aria-hidden`.
- The tree is wrapped in `<nav aria-label="Files">` so it's reachable as a landmark.
- This is the **disclosure** pattern, which is a good fit for a simple sidebar: every folder is a tab stop. For an editor-grade experience you'd switch to the WAI-ARIA **tree** pattern (`role="tree"`, `treeitem`, roving tabindex, arrow keys). That is *File Explorer II*. Don't half-apply `role="tree"`: it promises arrow-key behaviour to screen-reader users, so if you add the roles you must add the keyboard model too.

## Edge cases

- Empty folders: expandable, show an "Empty" hint.
- Duplicate names in different folders: fine, because keys are ids.
- Mixed case (`README.md` vs `package.json`): handled by the collator.
- Very deep nesting: indentation grows; cap it visually or switch to a breadcrumb UI on narrow screens.

## Scaling it

- **Lazy loading.** Real file systems are fetched one directory at a time. Store children in a normalized map (`{ [id]: { name, childIds, status } }`), fetch on first expand, show a spinner row (`aria-busy`), and cache results. Guard against out-of-order responses by keying by folder id.
- **Large trees.** Flatten the *visible* nodes into an array (depth-first, skipping collapsed folders) and render it with a virtualized list (fixed row height, only rows in the viewport). The flattening is `O(visible nodes)` and is memoized on `[tree, expanded]`.
- **Operations.** Rename, create, delete and drag-to-move all become simple with a normalized map: they update one or two entries instead of rebuilding nested arrays.

## Follow-ups

- "Expand all / collapse all": collect all folder ids once, set them in one update.
- Persist open folders to `localStorage` or the URL; that's trivial with a `Set` of ids.
- Selection and an active file highlight: add `selectedId` state and `aria-current` (or `aria-selected` in the tree pattern).
