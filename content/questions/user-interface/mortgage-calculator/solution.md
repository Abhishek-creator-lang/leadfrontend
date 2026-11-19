## State design

Three pieces of state, the **raw strings** of the inputs. Everything else (validation errors, monthly payment, total, interest) is computed during render.

Storing `monthlyPayment` in state and updating it in a `useEffect` is the classic anti-pattern here. It renders once with stale results, then again with fresh ones. It can drift out of sync, and it's more code. The React docs put it directly: *if you can calculate it from props or state, don't put it in state.* The calculation is a handful of floating-point operations, so `useMemo` isn't worth it either.

Inputs hold strings, not numbers, so partial input (`6.`) and empty fields are representable while the user types. Parse them only for the calculation.

## The maths

```js
const growth = Math.pow(1 + r, n);
return (principal * r * growth) / (growth - 1);
```

- `r = 0` would divide by zero (`growth - 1 === 0`), so it's a separate branch: `P / n`.
- `pow` is computed once and reused.
- `monthlyPayment` is exported as a pure function, so it can be unit-tested on its own.

## Money and floating point

- Displaying with `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })` rounds to cents and adds separators, and it adapts to the locale if you pass the user's.
- Floats are fine for an *estimate*. Real lenders round each payment to the cent and adjust the final payment. An amortisation schedule computed with floats drifts by cents over 360 rows, so financial systems use integer cents or a decimal library and specify the rounding rule explicitly (often banker's rounding).
- Totals are computed from the unrounded monthly payment. Mention that a bank would compute `round(M) × n` instead and the numbers would differ by a few cents.

## Validation

- Strict regexes reject `abc`, `-5`, `1e3` and empty strings, so `NaN` and `Infinity` can't reach the output.
- Rules: amount > 0, rate from 0 to 100, term a whole number from 1 to 50 years.
- Invalid fields get `aria-invalid` and a linked message, and the results show "—".
- A 0% rate is explicitly valid.

## Accessibility

- Labels include units: "Loan amount ($)", "Annual interest rate (%)". Units in placeholders or adornments alone get lost.
- `inputMode="decimal"` or `"numeric"` gives a numeric keyboard on mobile without `type="number"`'s scroll-wheel and empty-value pitfalls.
- Results use a **description list** (`<dl>`/`<dt>`/`<dd>`), the semantic structure for label/value pairs.
- `aria-live="polite"` with `aria-atomic="true"` on the results means screen-reader users hear the updated figures after they pause. For noisy typing, debounce what's announced, for example by announcing a summary sentence 500 ms after the last change.
- `tabular-nums` keeps digits aligned as values change.
- The form's `onSubmit` prevents a reload when the user presses <kbd>Enter</kbd>.

## Edge cases

- Huge amounts or long terms: `(1 + r)^n` stays finite for realistic inputs, and the 50-year limit caps `n`.
- A rate like `0.0001` makes the result approach `P / n`, which is fine numerically.
- Users who type thousands separators (`300,000`): strip commas before parsing, or format as they type (which is tricky with cursor position).

## Scaling it

- **Amortisation schedule:** generate rows from a pure function (each month: interest = balance × r, principal = M − interest). 360 rows render fine. For many schedules or for charts, compute in a `useMemo` keyed on the inputs, or in a Web Worker for Monte Carlo-style scenarios.
- **Extra inputs:** property tax, insurance and PMI. Keep the calculation in a domain module with tests, separate from the UI.
- **URL state:** put inputs in query params so results can be shared and bookmarked.

## Follow-ups

- **Slider and input pairs:** keep one source of truth (the string), with the slider showing the parsed number.
- **Testing:** check known values ($100k, 6%, 30y → $599.55), the 0% branch and invalid input. Use `getByText(term).nextElementSibling` or a `<dl>` query rather than test ids.
