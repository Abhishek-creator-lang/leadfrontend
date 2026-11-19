Build a `Tabs` component. A row of tab buttons sits above a content area, and only the selected tab's panel is visible.

The starter has the data (`items` with `value`, `label`, `panel`) and renders every panel at once.

## Requirements

1. The **first** tab is selected by default. Accept an optional `defaultValue` prop to start on a different tab.
2. Clicking a tab selects it and shows **only** its panel.
3. The selected tab is visually distinct (not just by colour: add an underline or a border too).
4. Use the tab roles:
   - the button row is a `role="tablist"` with an `aria-label`
   - each button is a `role="tab"` with `aria-selected` and `aria-controls`
   - each panel is a `role="tabpanel"` with `aria-labelledby` pointing back to its tab.
5. IDs must be unique even when two `Tabs` render on one page.

Arrow-key navigation is **not** required here. It's covered in *Tabs II*.

## Follow-up

- Should hidden panels stay mounted? When does it matter (form state, video playback, expensive renders)?
- How would you support a controlled `value` / `onChange` API?
- What would you change to sync the selected tab to the URL?
