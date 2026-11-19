## State design

The single source of truth is an **array of six strings**, one per box, with `''` for an empty box. The joined code (`digits.join('')`) and "is it complete?" are **derived** during render, never stored separately, so they can't drift out of sync.

The input component is **controlled** (`value` + `onChange`). The parent needs the code to enable the submit button, and controlled state also makes "clear the code after a failed attempt" a one-liner.

Focus is not state. It lives in the DOM, and we move it imperatively with an array of refs (`refs.current[i].focus()`). Putting "active index" in React state would mean a render plus an effect for every keystroke, and it would fight with the user clicking a box.

## One `fill(start, chars)` function for every input path

Typing, pasting and OS autofill all reduce to "write these digits starting at box *i*, then focus the box after the last one written":

- **Typing** gives one character.
- **Paste** gives a string such as `"482 913"`. We `preventDefault()` the paste, strip non-digits and distribute.
- **OTP autofill.** `autocomplete="one-time-code"` on the first box lets iOS/Android offer the SMS code, and the OS writes the *whole* code into that one input as a change event. Because `handleChange` routes multi-character values through `fill`, autofill spreads across the boxes for free. This is also why we **don't** set `maxLength={1}`: it would truncate the autofilled code to one digit.

Typing into a box that already holds a digit produces a two-character value (the old digit plus the new one). We keep the character that isn't the old digit. Selecting the content on focus (`onFocus → select()`) makes the common case a plain replace.

## Keyboard

| Key | Behaviour |
|---|---|
| digit | fill, advance |
| <kbd>Backspace</kbd> | clear current; if already empty, step back and clear the previous one |
| <kbd>←</kbd>/<kbd>→</kbd>, <kbd>Home</kbd>/<kbd>End</kbd> | move focus |
| <kbd>Tab</kbd> | default browser behaviour, still moves through each box |

`Backspace` is handled in `keydown` (with `preventDefault`) rather than in `change`. An empty input fires no `change` event when you press Backspace, so the "go back" behaviour can only live in `keydown`.

## Accessibility

- `role="group"` + `aria-labelledby` on the wrapper gives screen-reader users the context ("Enter the 6-digit code…") once, when they enter the group.
- Each input has its own name, `Digit 3 of 6`. Without it, a screen reader announces six identical "edit text" fields.
- `inputMode="numeric"` (plus `pattern="[0-9]*"` for older iOS) shows a numeric keypad. Avoid `type="number"`: it adds spinners, allows `e`/`-`, drops leading zeros and has odd `value` semantics.
- The result message is in a `role="status"` live region so it's announced without moving focus.
- Submit stays a real `<button type="submit">` in a `<form>`, so <kbd>Enter</kbd> submits from any box.

## Edge cases

- Pasting more digits than there are boxes left: extra digits are ignored.
- Pasting text with spaces, dashes or letters (`"482-913"`): non-digits are stripped.
- Pasting in the middle fills from that box onwards. Some products instead always fill from box 1. Ask the interviewer which they want.
- Clicking a later box while earlier ones are empty is allowed. Some designs force focus back to the first empty box. That's a product decision, but forcing focus can be disorienting for screen-reader users.

## Alternative: a single input

One `<input maxLength={6}>` styled with a background that draws six cells (or with six decorative `aria-hidden` spans laid over it) gives native caret, selection, undo, paste and autofill handling with **no focus juggling**. Screen readers announce one field, "Verification code, edit text". Many production design systems use this approach for its robustness. The multi-input version is more common in interviews because it tests focus management, so be ready to discuss both.

## Productionizing

- Auto-submit via `onComplete(code)` when the last digit lands (and a guard against double submission).
- Server errors: set `aria-invalid` on the group's inputs, show the message linked with `aria-describedby`, clear the boxes and focus box 1.
- Rate limiting and a "Resend code" button with a cooldown timer announced politely.
- The WebOTP API (`navigator.credentials.get({ otp: { transport: ['sms'] } })`) on Android Chrome can read the SMS code automatically. Abort it with an `AbortController` in the effect cleanup.

## Follow-ups

- **Alphanumeric codes:** swap the `\D` filter for a configurable regex, use `inputMode="text"`, `autoCapitalize="characters"` and uppercase the value.
- **Configurable length:** already derived from `value.length`. Export the component with `length` and `onComplete` props.
- **Masking:** for PIN entry, use `type="password"` per box (or `-webkit-text-security`), and keep `inputMode="numeric"`.
