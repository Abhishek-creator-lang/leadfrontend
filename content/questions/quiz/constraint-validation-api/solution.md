## TL;DR

The **Constraint Validation API** is the browser's built-in form validation. You declare rules in HTML (`required`, `type="email"`, `min`/`max`, `minlength`, `pattern`, `step`), and each control exposes **`validity`** (a `ValidityState` with flags like `valueMissing`, `typeMismatch`, `patternMismatch`), **`validationMessage`**, **`checkValidity()`**, **`reportValidity()`** and **`setCustomValidity()`** for custom rules. Combine it with your own UI for accessible, consistent errors.

## Declaring constraints

```html
<form id="signup" novalidate>
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required aria-describedby="email-err">
  <p id="email-err" class="error" aria-live="polite"></p>

  <label for="pw">Password</label>
  <input id="pw" name="pw" type="password" required minlength="12">

  <label for="pw2">Confirm password</label>
  <input id="pw2" name="pw2" type="password" required>

  <button>Sign up</button>
</form>
```

`novalidate` turns off the browser's native bubbles on submit so you can render your own messages, while the API still works.

## Using the API

```js
const form = document.getElementById('signup');
const pw = form.elements.pw;
const pw2 = form.elements.pw2;

function checkMatch() {
  // a non-empty string makes the field invalid (customError = true)
  pw2.setCustomValidity(pw2.value && pw2.value !== pw.value ? 'Passwords do not match' : '');
}
pw.addEventListener('input', checkMatch);
pw2.addEventListener('input', checkMatch);

function showError(input) {
  const out = document.getElementById(`${input.id}-err`);
  if (!out) return;
  const v = input.validity;
  let msg = '';
  if (v.valueMissing) msg = 'This field is required.';
  else if (v.typeMismatch) msg = 'Enter a valid email address.';
  else if (!v.valid) msg = input.validationMessage; // localized browser message
  out.textContent = msg;
  input.setAttribute('aria-invalid', String(!v.valid));
}

form.addEventListener('submit', (e) => {
  checkMatch();
  if (!form.checkValidity()) {          // fires 'invalid' on each bad control
    e.preventDefault();
    [...form.elements].forEach((el) => el.willValidate && showError(el));
    form.querySelector(':invalid')?.focus();
  }
});
```

## Key pieces

| Member | Meaning |
|---|---|
| `el.validity.valid` | All constraints pass |
| `valueMissing`, `typeMismatch`, `patternMismatch`, `tooShort`, `tooLong`, `rangeUnderflow`, `rangeOverflow`, `stepMismatch`, `badInput`, `customError` | Which rule failed |
| `checkValidity()` | Returns boolean, fires `invalid` events |
| `reportValidity()` | Same, plus shows native UI |
| `setCustomValidity(msg)` | Custom error; **must reset with `''`** or the field stays invalid forever |
| `willValidate` | False for disabled, readonly, hidden or button controls |

CSS hooks: `:valid`, `:invalid`, `:required`, `:in-range`, and **`:user-invalid`** (only matches after the user has interacted), which avoids shouting red errors at an untouched form.

## Pitfalls

- Forgetting to clear `setCustomValidity`.
- `pattern` is anchored automatically and compiled with the `v` flag in modern browsers, so some characters need escaping inside classes.
- `minlength`/`maxlength` checks only apply to user edits, not values set by script.
- Native bubbles aren't consistently accessible or styleable. Custom messages need `aria-describedby`, `aria-invalid` and focus management on submit.
- **Client-side validation is UX, not security.** The server must validate everything again.
- Form-associated custom elements can join this system via `ElementInternals.setValidity()`.

## In an interview, mention…

- Declarative constraints first, JS only for cross-field or async rules.
- `novalidate` + API + own UI for a consistent, accessible experience.
- `:user-invalid` for timing errors well, and re-validating on the server.
