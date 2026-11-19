Build a verification-code screen like the ones used for two-factor sign-in. The code is **6 digits**, and each digit has its own box.

The starter renders six empty inputs and a submit button. Make them behave like a single field.

## Requirements

1. Only digits are accepted. Anything else is ignored.
2. Typing a digit fills the current box and **moves focus to the next box**. Typing into a box that already has a digit replaces it.
3. <kbd>Backspace</kbd>:
   - in a box with a digit, clears it and keeps focus there;
   - in an empty box, moves focus to the previous box and clears it.
4. <kbd>←</kbd>/<kbd>→</kbd> move focus between boxes. <kbd>Home</kbd>/<kbd>End</kbd> jump to the first/last box.
5. **Pasting** a code (for example `"482 913"` from an SMS) into any box distributes the digits from that box onwards and focuses the box after the last pasted digit.
6. The **Verify** button is disabled until all six digits are filled. Submitting shows a status message: `Code 482913 submitted`.
7. Accessibility:
   - The boxes are grouped and labelled (`role="group"` + a visible label).
   - Each box has its own accessible name: `Digit 1 of 6`, `Digit 2 of 6`, …
   - Mobile keyboards should show a numeric keypad, and the OS should be able to autofill a code received by SMS.
   - The status message is announced to screen readers.

## Follow-up

- Make the length configurable and expose an `onComplete(code)` callback that fires as soon as the last digit is entered.
- How would you support alphanumeric codes?
- Would a single `<input>` styled to look like six boxes be better? What are the trade-offs?
