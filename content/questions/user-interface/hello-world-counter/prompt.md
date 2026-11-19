Build the "hello world" of React: a counter.

The starter renders the markup but nothing is wired up yet.

## Requirements

1. The count starts at **0** and is displayed in a large number.
2. **Increment** adds 1 and **Decrement** subtracts 1.
3. The count can never go below 0. The **Decrement** button is disabled while the count is 0.
4. **Reset** sets the count back to 0. It's disabled when the count is already 0.
5. Screen-reader users should hear the new value after each change, without the focus moving. Put the number in an element with `role="status"`.
6. Each button has a clear accessible name: "Increment", "Decrement", "Reset". If you use symbols such as `+` and `−` as the visible text, add an `aria-label`.

## Follow-up

- Add a "step" input so each click adds or subtracts N.
- Why does calling `setCount(count + 1)` three times in one handler only add 1? How do you fix it?
- How would you make this a reusable `useCounter({ min, max, step })` hook?
