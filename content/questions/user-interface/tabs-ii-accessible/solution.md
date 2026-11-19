## What changes from Tabs I

The markup and roles stay the same. This exercise is about **keyboard interaction and focus**, the part of the APG Tabs pattern most implementations get wrong.

## Roving tabindex

```jsx
tabIndex={isSelected ? 0 : -1}
```

A tab list is a **single composite widget**, so it should cost one <kbd>Tab</kbd> press, not N. The selected tab holds `tabIndex=0`, so Tab enters the widget on the selected tab, and the next Tab goes to the panel (`tabIndex={0}`). The others are `-1`: still focusable from script, but skipped by Tab.

The alternative is `aria-activedescendant`, where focus stays on the container and you point at the "virtually focused" child. That suits listboxes and comboboxes where DOM focus has to stay in an input. For tabs, roving tabindex is simpler and screen readers handle it more consistently.

## Arrow-key handling

- Navigation runs over the **enabled** items only, so disabled tabs are skipped naturally. Wrapping is index arithmetic on that filtered list.
- Refs live in a `Map` keyed by value. A ref callback adds and removes entries, so the map stays correct when items change. An index-keyed array can leave stale entries behind.
- `preventDefault()` only for keys we handle. Otherwise <kbd>→</kbd> scrolls horizontally-overflowing pages, and swallowing *every* key would break Tab and screen-reader shortcuts.
- <kbd>Enter</kbd>/<kbd>Space</kbd> need no code: they fire `click` on a native `<button>`, which selects the tab. That's what makes manual mode work.

## Automatic vs manual activation

| | Automatic (default) | Manual |
|---|---|---|
| Arrow keys | Move focus **and** select | Move focus only |
| Good for | Panels that render instantly | Panels that fetch data or are expensive to render |
| Risk | Arrowing past 5 tabs fires 5 fetches | One extra keypress |

APG recommends automatic activation unless showing a panel causes noticeable latency.

## Disabled tabs

Native `disabled` removes the button from focus entirely. Some design systems prefer `aria-disabled="true"` so users can still discover the tab with arrows and hear why it's unavailable. APG allows focusable disabled tabs. Either choice is defensible; say which one you're making and why.

## Edge cases

- `selected` points at a disabled or removed item: fall back to the first enabled item (via `defaultValue ?? firstEnabled`). For a controlled API, validate in render.
- All items disabled: `enabled` is empty and `next` is undefined, which we guard against.
- **RTL:** in `dir="rtl"`, Left/Right should be swapped. Read `getComputedStyle(el).direction` or take a `dir` prop.
- **Vertical:** set `aria-orientation="vertical"` and map Up/Down instead of Left/Right.

## Scaling it

Extract the logic into a reusable **`useRovingFocus({ items, orientation, loop, onMove })`** hook. Toolbars, menus, radio groups and listboxes all use it. Radix (`RovingFocusGroup`) and React Aria (`useFocusManager`) are built this way. In a design-system component, combine it with the compound API (`Tabs.List`, `Tabs.Trigger`, `Tabs.Content`) and register triggers through context so their order follows DOM order.

## Follow-ups

- **Why not put `onKeyDown` on the tablist?** You can, and delegation means one handler. You then need the focused value from `event.target`, for example a `data-value` attribute.
- **Typeahead:** pressing a letter could jump to the next tab starting with it. Common in menus, optional for tabs.
- **Testing:** `fireEvent.keyDown` and asserting `document.activeElement`. The return value of `fireEvent` is `false` when `preventDefault()` was called, which the tests use to check that scrolling is suppressed.
