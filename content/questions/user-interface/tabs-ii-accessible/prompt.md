The starter is a working tabs component with the correct ARIA roles. Its keyboard support is poor, though: every tab is a separate Tab stop and arrow keys do nothing. Bring it up to the WAI-ARIA Tabs pattern.

## Requirements

1. **Roving tabindex.** Only the selected tab is in the page's tab sequence (`tabIndex=0`). All other tabs get `tabIndex=-1`. Pressing <kbd>Tab</kbd> from the tab list moves into the active panel.
2. **Arrow keys.** <kbd>→</kbd> and <kbd>←</kbd> move focus to the next or previous tab and **wrap** around at the ends. <kbd>Home</kbd> and <kbd>End</kbd> jump to the first or last tab.
3. **Activation mode** via an `activation` prop:
   - `"automatic"` (default): moving focus also selects the tab.
   - `"manual"`: arrows only move focus. <kbd>Enter</kbd> or <kbd>Space</kbd> selects the focused tab.
4. **Disabled tabs** (`disabled: true` on an item) are skipped by arrow navigation and can't be selected.
5. Arrow keys must not scroll the page.
6. Keep everything from Tabs I: `aria-selected`, `aria-controls`/`aria-labelledby`, `useId`-based ids, a labelled tablist.

## Follow-up

- When would you pick manual activation over automatic?
- How do you support `aria-orientation="vertical"`?
- What changes in a right-to-left layout?
