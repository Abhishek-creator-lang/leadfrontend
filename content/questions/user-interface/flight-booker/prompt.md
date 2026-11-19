Build a small flight booking form.

## Requirements

1. A **Trip type** select with two options: "One-way flight" (default) and "Return flight".
2. A **Departure date** and a **Return date**, both `<input type="date">`. Both default to **today** (in the user's local time zone).
3. The return date is **disabled** for one-way trips.
4. Validation:
   - The departure date can't be in the past.
   - For return trips, the return date can't be before the departure date.
   - Invalid dates get `aria-invalid="true"` and a message linked with `aria-describedby`. Also set the native `min` attributes so the date picker greys out impossible days.
5. The **Book** button is disabled while the form is invalid.
6. Booking shows a confirmation in a `role="status"` element:
   - "You booked a one-way flight departing 2026-12-01."
   - "You booked a return flight departing 2026-12-01 and returning 2026-12-08."

## Follow-up

- What goes wrong if you compute "today" with `new Date().toISOString().slice(0, 10)`?
- Should Book be disabled, or enabled with errors shown on click? Discuss the accessibility trade-off.
- How do you test date logic that depends on the current day?
