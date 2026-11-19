Build a mortgage calculator for a fixed-rate loan with monthly payments.

**Inputs:** Loan amount ($), Annual interest rate (%), Loan term (years).

**Formula:** with principal `P`, monthly rate `r = annualRate / 100 / 12` and `n = years × 12` payments:

```
M = P × r × (1 + r)^n / ((1 + r)^n − 1)
```

## Requirements

1. Results update **as the user types**. There's no Calculate button.
2. Show:
   - **Monthly payment**
   - **Total paid** (`M × n`)
   - **Total interest** (`total − P`)
3. Format money as US dollars with two decimals and thousands separators (`$1,234.56`).
4. A **0% interest rate** is valid. The payment is then simply `P / n`.
5. Invalid input (empty, negative, a loan amount of 0, a term that isn't a whole number from 1 to 50): mark the field `aria-invalid`, explain the problem, and show "—" for the results instead of `NaN` or `Infinity`.
6. Defaults: $300,000, 6.5%, 30 years.
7. Results are announced politely to screen readers when they change.

## Follow-up

- Why compute the results during render instead of storing them in state?
- Floating-point and money: what can go wrong, and what would a bank do?
- How would you add an amortisation schedule for 360 rows efficiently?
