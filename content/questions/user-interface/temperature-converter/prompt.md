Build a temperature converter with two text inputs: **Celsius** and **Fahrenheit**.

`F = C × 9/5 + 32` and `C = (F − 32) × 5/9`.

## Requirements

1. Typing in either input immediately updates the other.
2. Round the converted value to at most **4 decimal places** and drop trailing zeros (`37.7778`, not `37.77777777`; `212`, not `212.0000`).
3. **Never rewrite the field the user is typing in.** Typing `1.` or `-` must not be "corrected" while they type.
4. **Invalid input** (for example `abc`): leave the other field unchanged, mark the field as invalid (`aria-invalid="true"`), and show a short message linked with `aria-describedby`.
5. Clearing a field clears the other one.
6. Both inputs have visible labels. On mobile they should bring up a numeric keyboard that still allows a minus sign and decimal point.

## Follow-up

- Why not `<input type="number">`?
- Add Kelvin as a third field. How does your state design scale?
- Should you store both values in state, or one?
