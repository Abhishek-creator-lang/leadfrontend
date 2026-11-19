## The key decision: what is state?

The tempting design is to store `checked: true/false` for **every** node and write code that walks up and down the tree on each click to keep parents and children in sync. That's two sources of truth for the same fact, and it breaks in subtle ways (for example, unchecking the last checked child but forgetting to clear the grandparent).

Instead, store only the **leaves** that are checked:

```js
const [checked, setChecked] = useState(() => new Set()); // Set<leafId>
```

Every group's state is **derived** at render time:

| Checked leaves under the group | Group checkbox |
|---|---|
| all | `checked` |
| none | unchecked |
| some | `indeterminate` |

Now "upward propagation" doesn't exist as code at all; it falls out of rendering. "Downward propagation" is a single update: add or remove all of the group's leaf ids. This is React's "avoid redundant state" principle applied to a tree.

## Supporting index

`buildLeafIndex` does one post-order pass and maps every node id to the leaf ids beneath it (a leaf maps to itself). It's memoized on `data`, so toggling a group is `O(leaves in that group)` and never re-walks the tree.

`onToggle(id, value)` takes the *target* value. A group passes `!all`, so clicking an **indeterminate** group checks everything (the common UX convention, and what requirement 3 asks for). A naive `toggle` that flips the input's `checked` value happens to do the same, but one that flips "the group's previous value" can go either way. Passing the target value removes that ambiguity.

## The `indeterminate` property

There is no `indeterminate` HTML attribute and React has no prop for it. It's a DOM property, so it's set imperatively:

```js
useEffect(() => { ref.current.indeterminate = indeterminate; }, [indeterminate]);
```

Notes:

- `indeterminate` is purely visual; the input's `checked` value is independent. We render `checked={false}` for a mixed group.
- Browsers clear `indeterminate` when the user clicks the box. Because our effect depends on the derived value, the next render sets it back correctly.
- `useLayoutEffect` would avoid a one-frame flash in rare cases; `useEffect` is fine here because the change follows a user click.

## Accessibility

- Native `<input type="checkbox">` gives focus, Space to toggle, and form semantics for free. Browsers expose `indeterminate` to assistive tech as **"mixed"**, so don't also set `aria-checked` on a native checkbox (it conflicts).
- Each input has a `<label htmlFor>` with an id from `useId`, so the label text is clickable and becomes the accessible name.
- The tree is wrapped in `<fieldset>`/`<legend>` so screen readers announce "Permissions, group". Nested `<ul>`s convey hierarchy.
- The summary is an `aria-live="polite"` region, so changes made by a group click ("4 of 6 selected") are announced.
- If you build custom (non-native) checkboxes, follow the APG mixed checkbox: `role="checkbox"`, `aria-checked="true|false|mixed"`, `tabIndex=0`, Space toggles.

## Edge cases

- **Empty groups** (`children: []`): treated as leaves here. Decide with the interviewer; an empty group might better be hidden or disabled.
- **Disabled leaves:** a group should only toggle *enabled* leaves, and "all checked" should probably mean "all enabled leaves checked". Filter disabled ids out of the leaf index used for toggling.
- **Initial value / controlled mode:** accept `value: string[]` and `onChange`. Because state is a flat list of leaf ids, it maps directly onto what the backend wants to save.
- **Duplicate ids across branches** would break the index; ids must be unique.

## Performance

Each `Node` counts its checked leaves, so a render is `O(sum of leaves per node)` = `O(n · depth)`. For a few hundred nodes that's nothing. For very large trees:

- Compute all counts in a single memoized post-order pass (`Map<id, count>`) on `[data, checked]` and pass each node its own primitive `count`/`total`, then `React.memo` skips unchanged subtrees.
- Collapse groups by default and render children only when expanded; virtualize the flattened visible list.
- Batch "Select all" as one `setChecked(new Set(allLeaves))`.

## Follow-ups

- **"Select all":** no new state needed; it's just another derived node whose leaves are all leaves.
- **Search/filter:** checking a filtered group should only affect visible leaves; make that explicit.
- **Server sync:** debounce saving, or diff `prev` vs `next` sets to send `{ add: [], remove: [] }`.
