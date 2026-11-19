Build two small overlay components and use them in a toolbar.

## Part A: `Tooltip`

```jsx
<Tooltip content="Bold (Ctrl+B)">
  <button aria-label="Bold">B</button>
</Tooltip>
```

1. Shows **immediately on keyboard focus** and after a **300 ms delay on hover**. A quick pass of the mouse shouldn't flash it.
2. Hides on blur, on mouse leave, and on <kbd>Escape</kbd> (without moving focus).
3. **Hoverable:** moving the pointer from the trigger onto the tooltip keeps it open (WCAG 1.4.13).
4. `role="tooltip"` with an id, and the trigger gets `aria-describedby` pointing at it.
5. Positioned above the trigger with a small arrow. It contains **plain text only**, nothing interactive.

## Part B: `Popover`

```jsx
<Popover label="Text settings" trigger="Settings">
  …interactive content…
</Popover>
```

1. A button with `aria-expanded` and `aria-controls` toggles a panel with `role="dialog"` and an accessible name.
2. Opening moves focus to the first focusable element in the panel.
3. <kbd>Escape</kbd> closes it and **returns focus to the trigger**. Clicking **outside** (anywhere except the panel and the trigger) closes it.
4. The panel can contain interactive controls. The demo has two checkboxes.

## Follow-up

- When is a tooltip the wrong choice? (Touch devices, essential information, interactive content.)
- How would you position overlays that might overflow the viewport? What do the Popover API and CSS anchor positioning add?
- Why use `mousedown`/`pointerdown` for outside clicks instead of `click`?
