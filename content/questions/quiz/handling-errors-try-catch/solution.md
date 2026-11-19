## TL;DR

Wrap code that may throw in **`try { … }`**; if anything inside throws, control jumps to **`catch (err) { … }`** with the thrown value; **`finally { … }`** always runs afterwards for cleanup. `try/catch` only catches errors thrown **synchronously** in that block, or from an **`await`ed** promise in an `async` function. Catch errors where you can **do something useful** (recover, add context, show UI), and rethrow the rest.

## Basic shape

```js
function parseConfig(text) {
  try {
    return JSON.parse(text);
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.warn('Invalid config, using defaults');
      return {};
    }
    throw err; // not ours to handle
  } finally {
    console.log('parse attempted'); // always runs
  }
}
```

Optional catch binding (ES2019) when you don't need the error: `try { … } catch { … }`.

## With async code

```js
async function loadProfile(id) {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`, { cause: res });
    return await res.json(); // await here so a JSON error is caught too
  } catch (err) {
    throw new Error(`Could not load profile ${id}`, { cause: err });
  }
}
```

What `try/catch` **doesn't** catch:

```js
try {
  setTimeout(() => { throw new Error('later'); }, 0); // runs after try has exited
} catch { /* never reached */ }

try {
  fetch('/x').then((r) => r.json()); // promise not awaited → unhandled rejection
} catch { /* never reached */ }

try {
  return promise; // in an async function: rejection escapes; use `return await promise`
} catch {}
```

Callbacks and un-awaited promises need their own handling (`.catch()`, `try` inside the callback, or the global `unhandledrejection` event).

## Practices that matter in real code

- **Don't swallow errors.** An empty `catch {}` hides bugs. If ignoring is intentional, comment why.
- **Narrow what you catch.** Check `instanceof` or `err.name`, and rethrow unknown errors.
- **Keep `try` blocks small** so you know which operation failed and don't accidentally catch bugs in unrelated code.
- **Add context with `cause`** instead of losing the original error.
- **Catch at boundaries**: request handlers, event handlers, route loaders, React error boundaries (which catch render errors but not event-handler or async errors).
- **Report**: send unexpected errors to monitoring (Sentry etc.) with context, and show the user a recoverable state.
- **Type safety**: in TypeScript, `err` is `unknown`; narrow it before reading `.message`.

## Control flow subtleties

```js
function f() {
  try { return 'try'; }
  finally { console.log('cleanup'); } // runs before the function actually returns
}
```

A `return` or `throw` inside `finally` overrides the `try`/`catch` result, which can silently discard an error. Avoid that.

## Performance

Modern engines optimise functions containing `try/catch` well. Throwing is relatively costly (stack capture), so don't use exceptions for normal control flow in hot loops.

## In an interview, mention…

- Sync vs async scope of `try/catch`, and `return await` inside `try`.
- Catch-narrow-rethrow and `cause` chaining.
- Where errors should be handled in an app (boundaries) and how they're reported.
