## Pick the right pattern first

"Dropdown" means three different things, and naming the right one is a senior signal:

| Use case | Pattern |
|---|---|
| A list of **actions** (Edit, Duplicate, Delete) | **Menu button**: `role="menu"`/`menuitem`, arrow keys, focus moves into the menu |
| Choosing a **value** for a form | Select-only **combobox** / listbox (or a native `<select>`) |
| Site **navigation** links | A **disclosure**: a button with `aria-expanded` revealing a plain list of links (no `role="menu"`) |

ARIA menus promise application-style keyboard behaviour. Putting `role="menu"` on site navigation forces screen-reader users into a mode they don't expect. This question is the menu button.

## State design

- `open: boolean`
- `activeIndex: number`: which item has focus (−1 when closed)

That's all. One effect turns `activeIndex` into real DOM focus (`itemRefs.current[i].focus()`), so every keyboard handler only does arithmetic on `activeIndex`. Items are `tabIndex={-1}`: focusable by script, not in the Tab order. The CSS styles `:focus`, so there's exactly one "highlighted" item whether the user is on a mouse or a keyboard (`mousemove` also updates `activeIndex`).

## Keyboard model (APG Menu Button)

| Where | Key | Behaviour |
|---|---|---|
| Button | <kbd>Enter</kbd> / <kbd>Space</kbd> / <kbd>↓</kbd> | Open and focus the first item. `preventDefault` stops the synthetic click from toggling it shut again. |
| Button | <kbd>↑</kbd> | Open and focus the last item |
| Menu | <kbd>↓</kbd> / <kbd>↑</kbd> | Next / previous, wrapping |
| Menu | <kbd>Home</kbd> / <kbd>End</kbd> | First / last |
| Menu | a printable character | Typeahead: the next item whose label starts with it, searching *after* the current item so repeated presses cycle |
| Menu | <kbd>Enter</kbd> / <kbd>Space</kbd> | Activate, close, focus the button |
| Menu | <kbd>Escape</kbd> | Close, focus the button |
| Menu | <kbd>Tab</kbd> | Close. Focus goes back to the button *synchronously inside the keydown handler*, without `preventDefault`, so the browser's default Tab moves on from the button to the next control, as the pattern expects. |

**Disabled items** are focusable with `aria-disabled="true"`, so screen-reader users learn the action exists but is unavailable. `activate` ignores them. Removing them entirely, or using `disabled`, hides that information.

## Focus management

- **Return focus to the button** after selecting or pressing Escape. Otherwise focus is left on an unmounted element and falls to `<body>`, so keyboard users lose their place.
- **Outside click** closes the menu *without* restoring focus. The user clicked something else, and stealing focus back would fight them. The listener is on `mousedown`/`touchstart` (or `pointerdown`), not `click`, so it runs before the target's own handlers and also catches drags. It's attached only while open and cleaned up in the effect.
- **`useId`** creates the button and menu ids, so `aria-controls` and `aria-labelledby` are unique when multiple menus are on the page.

## Edge cases

- **Clicking the button while open:** it toggles closed. The outside-click listener ignores it because the button is inside `rootRef`.
- **Every item disabled:** focus can still move through them, and nothing activates.
- **The item list changes while open:** clamp `activeIndex` (not needed here, because items are static).
- **A selection that opens a dialog:** close the menu first, then open the dialog. The dialog then returns focus to the menu button when it closes.

## Positioning and layering (production concerns)

- **Clipping and overflow:** an `absolute` menu inside an `overflow: hidden` card gets clipped. Options: render the menu in a **portal** at `document.body`, positioned from `getBoundingClientRect()` (and update it on scroll and resize), or use the native **Popover API** (`popover` + top layer), together with CSS **anchor positioning** where it's supported.
- **Collision handling:** flip above the button when there isn't room below, and shift horizontally to stay within the viewport. This is what Floating UI does. A portal also needs focus handling, because the menu is no longer next to the button in the DOM. Keep the keyboard logic as written; it doesn't depend on DOM order.
- **z-index:** the top layer (popover/dialog) avoids z-index wars entirely.

## Scaling into a design-system component

- A **compound API**: `<Menu><Menu.Trigger/><Menu.Items><Menu.Item onSelect disabled/></Menu.Items></Menu>`, with context for state, so items can contain icons, shortcuts and separators (`role="separator"`, skipped by navigation).
- **Submenus:** <kbd>→</kbd> opens a submenu and focuses its first item, <kbd>←</kbd> or <kbd>Escape</kbd> closes it back to the parent item, and hovering needs an intent delay or a "safe triangle" so diagonal mouse movement doesn't close it.
- `menuitemcheckbox` / `menuitemradio` for toggles, with `aria-checked`.
- **Typeahead buffer:** collect characters typed within ~500 ms, so typing "de" jumps straight to "Delete".

## Follow-ups

- *"Why not `tabIndex=0` on every item?"* The menu would add N tab stops. The pattern is a single entry point (the button) plus arrow keys.
- *"How do you test it?"* With roles: `getByRole('menuitem', { name })`, assert `document.activeElement` after key presses, and check the ARIA attributes. That's exactly what the tests here do.
