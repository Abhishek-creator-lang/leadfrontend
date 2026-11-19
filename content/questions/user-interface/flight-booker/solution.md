## State design

State: `trip`, `departure`, `returnDate`, `booked` (the confirmation message), plus `today`, which is computed once with a lazy initialiser.

Derived during render: `isReturn`, `errors`, `valid`. No effects. Switching back to one-way doesn't need to "reset" the return date. It's simply ignored by validation and disabled in the UI, and the user's choice comes back if they switch again.

## Dates without pain

- **Use date-input strings directly.** `<input type="date">` gives and takes `"YYYY-MM-DD"`. ISO date strings sort lexicographically in date order, so `returnDate < departure` is a correct comparison with no `Date` parsing at all.
- **Local "today".** `new Date().toISOString().slice(0, 10)` is the classic bug. `toISOString` is UTC, so in Sydney before 10 am, or in California after 4 pm, it returns the wrong day. The helper builds the string from local `getFullYear/getMonth/getDate`.
- **Avoid `new Date('2026-12-01')`.** Date-only ISO strings parse as **UTC** midnight, so `getDate()` can return the previous day in western time zones. Another reason to keep strings.

## Validation and UX

- The native `min` attribute greys out impossible days in the browser's picker. It's a hint, not enforcement (typing or a script can still set any value), so validate in code too.
- `min` on the return input follows the departure date.
- Errors use `aria-invalid` and `aria-describedby`.
- **Disabled submit:** chosen here because the rules are simple and visible. The trade-off: disabled buttons are skipped by Tab and give no feedback about *why*, and some screen-reader users never discover them. Mitigations are inline errors that explain the problem (done here), or the alternative pattern of keeping the button enabled and showing errors on submit. For long forms, prefer the latter.
- The return input is `disabled` for one-way trips. That's the correct semantic, because the value doesn't apply at all.

## Accessibility

- Native `<select>` and `<input type="date">` bring keyboard support, screen-reader semantics and mobile pickers for free. Custom date pickers are a large accessibility project (see the APG date picker dialog).
- The confirmation is inside a `role="status"` container that is **always rendered**. Live regions must exist before their content changes or some screen readers won't announce it.
- Visible labels on every control.

## Edge cases

- The form stays open past midnight, so `today` goes stale. Acceptable here. Otherwise recompute on focus or with a timer at midnight.
- An empty date (the user cleared the input) gives a "choose a date" error.
- Time zones of the **airports** matter in real booking (departure in local airport time), and the server is the source of truth for availability.

## Testing date logic

Tests compute expected dates relative to the real "today" using the same local-date logic, so they pass on any day and in any time zone. Alternatives: inject a `now` prop or a clock function (`getToday = () => new Date()`) as a dependency, or use fake timers with a fixed system time in suites that allow it. Injecting the clock is the cleanest design, because it makes time an explicit dependency.

## Scaling it

- Real booking: airports (combobox with async search), passengers (steppers), cabin class, then a results page. Keep the search params in the URL so searches are shareable.
- Use a date library (date-fns, Temporal when available) once you need time zones or durations. `Temporal.PlainDate` models exactly "a calendar date without a time zone".
