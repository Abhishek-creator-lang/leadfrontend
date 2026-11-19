Build a reusable **dropdown menu** (an "actions" menu button) that follows the WAI-ARIA **Menu Button** pattern.

The starter renders an **Actions** button and a static list of items that's always visible.

## API

```js
export function MenuButton({ label, items }) // items: [{ id, label, onSelect, disabled? }]
```

The demo `App` uses the items Edit, Duplicate, Archive (disabled) and Delete, and shows `Last action: <label>` after a selection.

## Requirements

**Mouse**

1. Clicking the button toggles the menu.
2. Clicking an enabled item runs its `onSelect`, closes the menu and returns focus to the button. Clicking a disabled item does nothing.
3. Clicking anywhere outside the button and menu closes it.

**Keyboard** (focus moves *into* the menu; items aren't in the Tab order)

4. On the button: <kbd>Enter</kbd>, <kbd>Space</kbd> or <kbd>↓</kbd> opens the menu and focuses the **first** item. <kbd>↑</kbd> opens it and focuses the **last** item.
5. In the menu:
   - <kbd>↓</kbd>/<kbd>↑</kbd> move focus and wrap around. <kbd>Home</kbd>/<kbd>End</kbd> jump to the first and last item.
   - <kbd>Enter</kbd>/<kbd>Space</kbd> activate the focused item.
   - Typing a character moves to the next item starting with that letter (typeahead).
   - <kbd>Escape</kbd> closes the menu and returns focus to the button.
   - <kbd>Tab</kbd> closes the menu and lets focus continue to the next element on the page.
6. Disabled items are focusable (so they can be discovered) but can't be activated.

**ARIA**

7. The button has `aria-haspopup="menu"`, `aria-expanded` and `aria-controls`. The menu has `role="menu"` and is labelled by the button. Items have `role="menuitem"`, and disabled ones have `aria-disabled="true"`.

## Follow-up

- The menu opens near the bottom of the viewport and gets clipped. How do you position it?
- Add submenus. What changes in the keyboard model?
- When should you use `role="menu"` versus a plain list of links in a disclosure?
