## Tooltip vs popover: pick the right one

| | Tooltip | Popover (non-modal dialog) |
|---|---|---|
| Trigger | Hover or focus | Click or <kbd>Enter</kbd> |
| Content | Short plain text that **describes** the trigger | Anything, including interactive controls |
| Focus | Never moves | Moves into the panel, and returns on close |
| Role | `role="tooltip"` + `aria-describedby` on the trigger | `role="dialog"` + `aria-expanded`/`aria-controls` on the trigger |
| Touch | Effectively unavailable | Works |

Rule of thumb: if the content matters, or if users need to interact with it, it's not a tooltip. Tooltips are supplementary hints (keyboard shortcuts, the label of an icon button). Information that users *need* must also be available without hovering.

## Tooltip implementation

- **State:** `open` plus a timer ref for the hover delay. The timer is cleared on hide and on unmount.
- **Show:** immediately on focus (keyboard users deliberately landed there), and after 300 ms on hover, so moving the mouse across a toolbar doesn't flash tooltips.
- **Hide:** on blur, mouse leave, or Escape. Escape is handled at the document level while open, and it **doesn't move focus**. WCAG 1.4.13 (*Content on Hover or Focus*) requires the content to be **dismissible** (Escape), **hoverable** (the pointer can move onto it) and **persistent** (it stays until dismissed or no longer relevant).
- **Hoverable:** the mouse handlers sit on a wrapper that *contains* both trigger and tooltip, and a transparent `::before` "bridge" covers the 8 px gap, so moving the pointer upwards doesn't cross a dead zone that closes it.
- **ARIA:** the tooltip element is **always rendered** (with `hidden` when closed), so `aria-describedby` always resolves. Descriptions are computed even from hidden elements, which means screen readers announce "Bold, button, Bold (Ctrl+B)" on focus whether or not it's visible.
- `cloneElement` adds the props to the child **and composes** its existing `onFocus`/`onBlur` instead of overwriting them. The child must be a single element that forwards those props, which is a known limitation of this API. The alternative is a render prop (`children(triggerProps)`) or a `useTooltip()` hook that returns props to spread.

## Popover implementation

- The trigger has `aria-expanded`, `aria-controls` → panel and `aria-haspopup="dialog"`. The panel is `role="dialog"`, labelled by its heading, and **non-modal**: no `aria-modal`, no focus trap, and the page stays usable.
- **Open:** focus the first focusable element (or the panel itself) in an effect after it's visible.
- **Escape:** close and **return focus to the trigger**, so keyboard users don't lose their place.
- **Outside click** uses `mousedown`, not `click`:
  - it fires before focus moves and before the clicked control acts, so the popover closes as you press, not after
  - with `click`, the opening click itself can bubble to the document listener and immediately close the popover, depending on how listeners are attached.

  The check excludes the trigger, so clicking the trigger toggles normally instead of close-then-reopen.
- Tab out of the panel: some designs close on `focusout` when focus leaves both panel and trigger. That's worth adding for non-modal popovers so they don't linger.

## Positioning

The CSS uses simple absolute positioning above or below the trigger. Production needs:

- **Collision handling:** flip to the other side or shift along the axis when near the viewport edge. Floating UI is the standard library. Measure with `getBoundingClientRect` in `useLayoutEffect` and update on scroll and resize.
- **Clipping:** an `overflow: hidden` ancestor clips absolute children. Portal to `body`, or use the **Popover API** (`popover` attribute + `popovertarget`), which renders in the **top layer**, gives light-dismiss (outside click and Escape) for free and handles stacking. **CSS anchor positioning** (`anchor-name`, `position-anchor`, `position-try-fallbacks`) is the native way to tether and flip without JavaScript where it's supported.

## Edge cases

- **Touch:** there's no hover. Tooltips appear on focus after a tap, which is unreliable. Never put essential information in them.
- **Disabled buttons don't fire mouse events** in some browsers, so the tooltip never shows. Use `aria-disabled` instead of `disabled` when the button needs a tooltip explaining *why* it's disabled.
- **Several tooltips:** only one should be open. A shared "tooltip group" also lets the second tooltip open instantly once one has been shown (skip the delay), as native OS tooltips do.

## Follow-ups

- **Testing:** focus and blur via `act(() => el.focus())`, Escape via `keyDown`, outside clicks via `mouseDown` on unrelated content. Assert on roles (`tooltip`, `dialog`) and on `document.activeElement`.
