Build a `CheckboxTree` for choosing permissions in an admin panel. Permissions are grouped into nested categories, and every item, group or leaf, has a checkbox.

The starter renders the nested data as plain, independent checkboxes. Make them behave as a tree.

## Requirements

1. **Downward:** checking or unchecking a group applies the same value to *all* of its descendants.
2. **Upward:** a group's checkbox is derived from its children:
   - **checked** if every descendant leaf is checked,
   - **unchecked** if none are,
   - **indeterminate** (the "–" state) if only some are.
3. Clicking an indeterminate group checks everything below it.
4. Show a summary below the tree: "*N* of *M* permissions selected" (counting leaves only).
5. Use native `<input type="checkbox">` elements with proper `<label>`s. The indeterminate state can only be set from JavaScript (`input.indeterminate = true`); there is no HTML attribute for it.
6. The data can be any depth.

## Follow-up

- Add a "Select all" master checkbox. Do you need any new state?
- Some permissions are disabled (locked by the organisation). How does that change the group logic?
- The tree has 10,000 leaves. Where is the cost, and how do you avoid it?
