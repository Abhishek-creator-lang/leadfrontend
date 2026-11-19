## The key design question: what is state?

The obvious "single source of truth" design stores one number (Celsius) and derives both inputs from it. It breaks as soon as the user types:

- Typing `1.` parses to `1`, which is formatted back as `1`, and the dot disappears under the cursor.
- Typing `-` parses to nothing, so the field can't hold it at all.
- Typing in Fahrenheit is round-tripped through Celsius, so `98.6` might come back as `98.60000000000001`.

So the state is **the raw text of each field**. The rule is: *the field being edited keeps exactly what the user typed, and every other field is recomputed from it.* That's the classic "two-way binding" problem, solved by making the edited field authoritative for that change.

```js
next[k] = k === key ? raw : format(SCALES[k].fromC(celsius));
```

Conversions go through a **pivot unit** (Celsius). Each scale only defines `toC` and `fromC`, so adding Kelvin is one line (`toC: k => k - 273.15`), not N² conversion functions.

## Parsing and formatting

- `Number('')` is `0` and `parseFloat('12abc')` is `12`. Both would silently accept bad input, so a strict regex decides what counts as a number.
- `String(Number(n.toFixed(4)))` rounds to 4 decimals and drops trailing zeros. `toFixed` alone returns `"212.0000"`.
- Floating point: `(98.6 - 32) * 5 / 9` is `37.00000000000001`. Rounding for display hides that. Never compare floats for equality.

## Invalid and empty input

- Invalid: keep the user's text (never erase what they typed), flag the field with `aria-invalid` and an `aria-describedby` message, and leave the other field showing the last valid conversion.
- Empty: clear everything, which is the least surprising result.

## Accessibility

- Visible `<label htmlFor>` on each input.
- `type="text"` with `inputMode="decimal"` shows a numeric keypad on mobile without `type="number"`'s problems:
  - `value` is `""` while the content is invalid or partial (`-`, `1e`), so you can't tell "empty" from "invalid".
  - The scroll wheel and arrow keys change the value by accident.
  - Spinners are inconsistent across browsers, and screen readers announce it as a spin button.
  - Locale decimal separators (`,`) aren't accepted consistently.
- The `=` sign is decorative (`aria-hidden`).
- The error message explains what to type.

Consider a polite live region that announces the conversion result ("21 degrees Celsius is 69.8 degrees Fahrenheit") for screen-reader users, since they won't see the other field change. Debounce it so each keystroke doesn't trigger an announcement.

## Edge cases

- Below absolute zero (−273.15 °C): physically impossible. Flag it as a validation warning if the product cares.
- Locales: accept `,` as the decimal separator by normalising before parsing, and format with `Intl.NumberFormat` for display.
- Very large numbers or exponents (`1e5`): the regex rejects them. Allow them if needed.

## Follow-ups

- **Kelvin:** add one entry to `SCALES`. The loop handles any number of fields.
- **Controlled vs uncontrolled:** both inputs must be controlled, because each one's value is set from the other.
- **Testing:** use `fireEvent.change` with partial input such as `1.` to prove the field isn't rewritten. Most naive solutions fail exactly that test.
