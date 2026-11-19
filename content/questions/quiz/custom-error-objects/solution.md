## TL;DR

**Extend `Error` with a class**, call `super(message, options)` (so `cause` works), set **`this.name`**, and add domain fields like `status` or `code`. Callers can then use **`instanceof`** or a stable **`code`** to branch, and you keep stack traces. Use custom errors to distinguish *kinds* of failure (validation, not found, network) at boundaries, not for every possible message.

## The modern pattern

```js
class AppError extends Error {
  constructor(message, { code, cause, details } = {}) {
    super(message, { cause });   // ES2022: preserves the underlying error
    this.name = new.target.name; // 'AppError', or the subclass name
    this.code = code;            // stable, machine-readable identifier
    this.details = details;
  }
}

class HttpError extends AppError {
  constructor(response, body) {
    super(`HTTP ${response.status} for ${response.url}`, { code: `HTTP_${response.status}` });
    this.status = response.status;
    this.body = body;
  }
  get isRetryable() {
    return this.status >= 500 || this.status === 429;
  }
}

class ValidationError extends AppError {
  constructor(fieldErrors) {
    super('Validation failed', { code: 'VALIDATION', details: fieldErrors });
  }
}
```

Usage:

```js
async function request(url, init) {
  let res;
  try {
    res = await fetch(url, init);
  } catch (err) {
    throw new AppError('Network unavailable', { code: 'NETWORK', cause: err });
  }
  if (!res.ok) throw new HttpError(res, await res.text());
  return res.json();
}

try {
  await request('/api/orders', { method: 'POST', body });
} catch (err) {
  if (err instanceof ValidationError) showFieldErrors(err.details);
  else if (err instanceof HttpError && err.status === 401) redirectToLogin();
  else if (err instanceof HttpError && err.isRetryable) scheduleRetry();
  else throw err;
}
```

## Details that matter

- **`name`**: without it, stack traces and `String(err)` show `Error`. Setting `this.name = new.target.name` (or `this.constructor.name`) makes subclasses label themselves. Minifiers can mangle class names, so for reporting and branching prefer explicit `code` strings, or hard-code `name`.
- **Stack traces**: native `class extends Error` captures them automatically. In V8 you can hide constructor frames with `Error.captureStackTrace?.(this, new.target)`.
- **`instanceof` caveats**: it fails across realms (iframes, separate bundles shipping duplicate copies of your error module, worker boundaries). Checking `err.code` or `err.name` is more robust. `Error.isError()` is a new built-in for realm-safe "is this an Error?" checks; verify support.
- **Old transpilation**: compiling `extends Error` to ES5 broke the prototype chain (`instanceof` returned false). Targeting ES2015+ fixes it; with legacy output you needed `Object.setPrototypeOf(this, new.target.prototype)`.
- **Serialization**: `JSON.stringify(err)` gives `{}` for built-in properties (`message`, `stack` are non-enumerable), but includes your own fields. Add a `toJSON()` if errors cross the network or go to logs. `structuredClone` and `postMessage` keep `name`/`message` (and `cause` in newer engines) for built-in error types only.
- **TypeScript**: add `override readonly name = 'HttpError'` or declare fields; narrow `unknown` in `catch` with `instanceof` or a type guard.

## Design advice

- Keep a **small hierarchy**: a base `AppError` plus a few meaningful categories. Explosions of one-off classes are hard to handle consistently.
- **Wrap, don't replace**: always pass the low-level error as `cause`.
- Separate the **user-facing message** (translated UI copy) from the developer message. Map `code` to UI text at the edge.
- Mark **operational** errors (expected, recoverable) differently from programmer bugs so monitoring can prioritise.

## In an interview, mention…

- `class extends Error`, `super(message, { cause })`, `name`, and a `code`.
- `instanceof` limitations across realms and with old transpilation.
- How custom errors map to handling: retry, redirect, field errors, generic fallback.
