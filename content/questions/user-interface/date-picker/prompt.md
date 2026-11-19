Build a **date picker**: a text input for the date plus a **Choose date** button that opens a calendar dialog. Follow the WAI-ARIA **Date Picker Dialog** pattern.

The starter renders the input, the button and a static month grid.

## API

```js
export function DatePicker({
  value,            // 'YYYY-MM-DD' or ''
  onChange,         // (isoString) => void
  label = 'Date',
  today = new Date(), // injectable for tests
  locale = 'en-US',
})
```

## Requirements

**Input**

1. The input shows the value as `YYYY-MM-DD` with a visible format hint. Typing a valid date and leaving the field (or pressing <kbd>Enter</kbd>) commits it. An invalid date shows `Enter a date as YYYY-MM-DD` and sets `aria-invalid`. Reject impossible dates like `2026-02-30`.

**Dialog**

2. **Choose date** opens a dialog (`role="dialog"`, `aria-modal="true"`) labelled by its month heading, for example `March 2026`. The button's accessible name includes the current selection: `Choose date, selected date is Sunday, March 15, 2026`.
3. The dialog has **Previous year**, **Previous month**, **Next month** and **Next year** buttons and a **Cancel** button. Clicking the month buttons changes the month without moving focus.
4. The days are a `role="grid"` table with weekday column headers (Su–Sa, with full names as `abbr`). Each day cell is named by its full date (`Monday, March 16, 2026`). The selected day has `aria-selected="true"` and today has `aria-current="date"`.
5. When the dialog opens, focus goes to the **selected** date, or to **today** if nothing is selected. The grid uses a roving tabindex: only the focused day is tabbable.

**Grid keyboard**

| Key | Moves focus to |
|---|---|
| <kbd>←</kbd>/<kbd>→</kbd> | Previous / next day (crossing months as needed) |
| <kbd>↑</kbd>/<kbd>↓</kbd> | Same weekday in the previous / next week |
| <kbd>Home</kbd>/<kbd>End</kbd> | First (Sunday) / last (Saturday) day of the week |
| <kbd>Page Up</kbd>/<kbd>Page Down</kbd> | Same day in the previous / next month, clamped (Jan 31 → Feb 28) |
| <kbd>Shift</kbd>+<kbd>Page Up</kbd>/<kbd>Page Down</kbd> | Same day in the previous / next year |
| <kbd>Enter</kbd>/<kbd>Space</kbd> | Select the date, close, and return focus to the button |

6. <kbd>Escape</kbd> or **Cancel** closes without changing the value and returns focus to the button. <kbd>Tab</kbd> stays inside the dialog (focus trap). Clicking outside closes it.
7. All date maths uses **local** calendar dates. No time-zone off-by-one bugs.

## Follow-up

- Add `min` / `max` and disabled dates.
- Localise: first day of week, month names, right-to-left layouts.
- Why not just use `<input type="date">`?
