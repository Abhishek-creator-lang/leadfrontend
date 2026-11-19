## State design

Two independent facts need storing:

1. **Membership and order:** which items are in which list. Two ordered arrays, `left` and `right`.
2. **Check state:** which items are ticked. One `Set<id>` shared by both lists.

A single shared `Set` works because an id is only ever in one list. Everything else (checked items per list, header counts, whether a button is enabled, the header's tri-state) is **derived** during render. Storing `leftChecked` as separate state would be redundant and is the most common source of bugs in this question (moving items but forgetting to clear their check state, so they arrive pre-checked).

Alternatives worth mentioning:

- Store `items` once plus a `Map<id, 'left' | 'right'>`. That's fine, but "append to the end of the destination" then needs an order field, so two arrays are simpler.
- Store a `checked` boolean on each item object. That mixes UI state into domain data and forces copying objects on every tick.

## Moving items

`move(moving, setFrom, setTo)` is one function for all four buttons:

1. Collect the ids being moved in a `Set` for O(1) lookups.
2. Remove them from the source with `filter` (relative order is preserved).
3. Append them to the destination.
4. Remove them from `checked`, so they arrive unchecked.

All three state updates happen in one event handler, so React 18 batches them into one render. Every update uses the functional form and creates new arrays/sets; nothing is mutated.

## Select-all header

The header checkbox is derived: `checked` when every item in the list is checked, `indeterminate` when some are, disabled when the list is empty. `indeterminate` is a DOM property with no HTML attribute, so it's set in an effect via a ref. Clicking it in the mixed state *checks* all (target value `!all`), which matches what Gmail and most design systems do.

## Accessibility

- **Button names.** Glyphs like `›` are read as "single right-pointing angle quotation mark". Each button gets an `aria-label` ("Move checked to Selected") and the glyph is `aria-hidden`. A visible tooltip helps sighted users too.
- **Disabled state.** Native `disabled` removes the button from the tab order. That's acceptable here because the reason is visible (the counts), but some design systems prefer `aria-disabled="true"` so the control stays discoverable; mention the trade-off.
- **Lists are labelled** by their headings (`aria-labelledby` on both the `<section>` and the `<ul>`), so screen-reader users hear "Selected, list, 2 items".
- Each item is a real checkbox wrapped in its `<label>`, so the whole row is clickable and Space toggles.
- A polite live region announcing "2 items moved to Selected" is a nice touch for screen-reader users, since focus doesn't follow the items.

Why not `role="listbox"` with `aria-multiselectable`? A listbox is better for long lists (one tab stop, arrow keys, Shift-select), but it's more work to get right. Checkboxes in a list are simple, robust and fully accessible; say you'd upgrade to the APG listbox pattern if lists can be long.

## Edge cases

- Buttons disabled when they'd do nothing; this also stops pointless renders.
- Header checkbox disabled for an empty list (otherwise it would show as unchecked but clickable with no effect).
- Moving everything leaves an empty-state message rather than a blank box.
- If the `items` prop changes, `useState(items)` ignores it (initial value only). Either reset with a `key` on the component or make it controlled.

## Scaling it

- **Large lists:** derived `filter` calls are O(n) per render, fine for thousands. Beyond that, virtualize each list and memoize rows with `React.memo` so ticking one checkbox re-renders one row.
- **Search:** keep a `query` per panel and derive `visibleItems`. Decide (and say) whether "select all" and "move checked" apply to only the visible items. The safest UX is: select-all selects only visible items; move moves whatever is checked.
- **Controlled API:** `value: string[]` (right-hand ids, in order) plus `onChange`, so it drops into a form library. Check state stays internal because it's ephemeral UI state.

## Follow-ups

- Reordering on the right: up/down buttons (accessible) and/or drag and drop with a keyboard alternative.
- Double-click an item to move it immediately.
- Persist the chosen columns to user preferences on the server, with optimistic updates.
