## Architecture

```
DatePicker (controlled: value 'YYYY-MM-DD', onChange)
├─ <input>  + hint + error             text entry, committed on blur / Enter
├─ <button aria-haspopup="dialog">     "Choose date, selected date is …"
└─ dialog (role=dialog, aria-modal)    labelled by the month heading
   ├─ « ‹  March 2026  › »             month and year navigation (focus stays on the button)
   ├─ <table role="grid">               weekday <th abbr>, day cells with a roving tabindex
   └─ Cancel
dateUtils.js                            pure local-date helpers (unit-testable)
```

The public value is an ISO **calendar date string**, not a `Date`. A string can't carry a time or a time zone, round-trips through forms and APIs unchanged, and compares with `===`.

## Date maths: avoid the classic bugs

- **Time zones:** `new Date('2026-03-15')` parses as **UTC midnight**, which is the 14th in the Americas. Every helper uses the local constructor `new Date(y, m, d)` and `getFullYear()`/`getMonth()`/`getDate()`.
- **Overflow:** `new Date(2026, 1, 30)` silently becomes March 2. `parseISO` round-trips the parts to reject impossible dates.
- **Month arithmetic:** `setMonth(m + 1)` on Jan 31 lands on March 3. `addMonths` clamps to the target month's length (Jan 31 → Feb 28), which is what users expect from Page Down.
- **DST:** adding days via `new Date(y, m, d + n)` rather than `+ n * 86_400_000` ms is immune to 23- and 25-hour days.
- `monthMatrix` builds Sunday-first weeks padded with `null`. Making the first weekday a parameter is the localisation hook (Monday in most of Europe; `Intl.Locale#getWeekInfo()` where it's supported).

## State design

| State | Purpose |
|---|---|
| `value` (prop) | The committed selection. The component is **controlled**. |
| `text` | What's typed in the input. It may be invalid, so it's separate from `value`. |
| `inputError` | Shown after committing invalid text |
| `open` | Whether the dialog is shown |
| `focusDate` | The **active** day in the grid. It also determines which month is displayed. |

Deriving the visible month from `focusDate` means keyboard navigation across a month boundary automatically re-renders the right month. There's no separate `viewMonth` to keep in sync. A `focusGridRef` flag says whether the next render should move DOM focus into the grid. That's true after opening and after grid keys, and false after clicking the month buttons, because the APG pattern keeps focus on those buttons.

## Accessibility (APG Date Picker Dialog)

- **Button:** named with the current value, so users know what's selected without opening the dialog. `aria-haspopup="dialog"` and `aria-expanded`.
- **Dialog:** `role="dialog"`, `aria-modal="true"`, labelled by the live month heading (`aria-live="polite"`, so month changes from the buttons are announced).
- **Grid:** `<table role="grid">` with `<th scope="col" abbr="Sunday">Su</th>`. Day cells are `gridcell`s with a full-date `aria-label` ("Monday, March 16, 2026"). A bare "16" is ambiguous. `aria-selected` marks the chosen date, and `aria-current="date"` marks today.
- **Roving tabindex:** only the active day has `tabIndex=0`, so Tab moves *between* controls, not across 31 days.
- **Keyboard:** arrows (±1/±7 days), Home/End (week start/end), Page Up/Down (month), Shift+Page Up/Down (year), Enter/Space to select, Escape to cancel.
- **Focus trap:** Tab and Shift+Tab wrap inside the dialog. Selecting, Escape and Cancel **return focus to the button**. An outside click closes the dialog without pulling focus back.
- **Text entry stays first-class:** many users (and screen-reader users in particular) find typing a date faster than navigating a grid. The format hint is visible and linked with `aria-describedby`, and errors set `aria-invalid` and are described too.

## Edge cases

- Clearing the input sets the value to `''`.
- Typing the same date again doesn't fire `onChange`.
- An external `value` change resyncs `text` (the effect on `value`).
- Opening with no value focuses today. Today itself is injectable for deterministic tests and SSR.
- Years before 1000 or after 9999 don't fit the regex. Decide with the interviewer whether that matters.

## Productionising

- **`min` / `max` / disabled dates:** mark cells `aria-disabled="true"` (still focusable, so navigation doesn't jump unpredictably), block selection, and clamp keyboard movement and the month buttons.
- **Localisation:** month and weekday names come from `Intl.DateTimeFormat`. Also cover the first day of the week, RTL (swap ←/→), and an input format per locale. Accept multiple formats on input, but always emit ISO.
- **Positioning:** render the dialog in a portal or in the top layer (`<dialog>.showModal()` or the Popover API) with collision-aware placement. On small screens, show a full-screen sheet.
- **Native `<input type="date">`:** it's free, accessible and mobile-optimised. Choose it unless you need custom styling, ranges, disabled dates or consistent cross-browser UX. Saying so is a strong signal.
- **Range pickers:** keep `{ start, end }` plus a hover preview, and announce the range length. The grid logic is reused unchanged.

## Follow-ups

- *"Why is the visible month derived from the focused date?"* So keyboard focus and the displayed month can never disagree.
- *"How do you test it?"* With a fixed `today`, query cells by their full-date names, drive the keys, and assert on `document.activeElement`, `aria-selected` and the emitted value. Unit-test `dateUtils` on its own, especially month clamping and leap years.
