## TL;DR

JavaScript has a base **`Error`** and built-in subclasses: **`SyntaxError`** (invalid code or `JSON.parse` input), **`ReferenceError`** (undeclared variable, TDZ access), **`TypeError`** (wrong type, e.g. calling `undefined`), **`RangeError`** (value outside allowed range), **`URIError`**, **`EvalError`** (legacy), and **`AggregateError`** (several errors at once). Platform APIs add **`DOMException`** (with names like `AbortError`, `NotAllowedError`). Beyond the classes, it's useful to classify errors as **syntax vs runtime vs logical**, and **operational vs programmer** errors.

## Built-in error constructors

```js
JSON.parse('{bad json}');      // SyntaxError
console.log(notDeclared);      // ReferenceError: notDeclared is not defined
{ console.log(x); let x = 1; } // ReferenceError: Cannot access 'x' before initialization
null.foo;                      // TypeError: Cannot read properties of null
const c = 1; c = 2;            // TypeError: Assignment to constant variable
new Array(-1);                 // RangeError: Invalid array length
(1.5).toFixed(200);            // RangeError
decodeURIComponent('%');       // URIError: URI malformed
await Promise.any([Promise.reject(1), Promise.reject(2)]);
                               // AggregateError: All promises were rejected (err.errors = [1, 2])
function f() { f(); } f();     // RangeError: Maximum call stack size exceeded (V8)
```

`EvalError` is kept for compatibility; modern engines don't throw it.

A **parse-time** `SyntaxError` stops the whole script from running, which is why one bad line in a bundle can break an entire page, and why you can't `try/catch` your way around invalid syntax in the same file (only in `eval`, `new Function` or `JSON.parse`).

## Common properties

```js
try { null.x; } catch (err) {
  err instanceof TypeError; // true
  err.name;                 // 'TypeError'
  err.message;              // human-readable text (engine-specific, don't parse it)
  err.stack;                // non-standard but universal stack trace string
  err.cause;                // ES2022: wrapped underlying error, if provided
}
```

## DOM and platform errors

```js
try {
  await navigator.clipboard.writeText('x');
} catch (err) {
  if (err instanceof DOMException && err.name === 'NotAllowedError') showPermissionHint();
}
// fetch abort → DOMException 'AbortError'; AbortSignal.timeout → 'TimeoutError'
// storage full → 'QuotaExceededError'
```

Check `err.name` for `DOMException`s, not the class.

## Useful conceptual categories

| Category | Example | Handling |
|---|---|---|
| Syntax errors | Missing bracket | Caught by linters/compilers before shipping |
| Runtime errors | `TypeError` from bad data | Defensive code, validation, error boundaries |
| Logical errors | Off-by-one, wrong total | No exception at all; caught by tests |
| Operational errors | Network failure, 500, permission denied | Expected; retry, fallback UI, user messaging |
| Programmer errors | Calling an undefined function | Bugs; fail loudly, report to monitoring, fix |

## Throwing non-errors

`throw 'oops'` and `Promise.reject(404)` are legal but lose the stack trace and break `instanceof` checks. Always throw `Error` instances (ESLint `no-throw-literal`, `prefer-promise-reject-errors`). When catching, remember the value can be anything, which is why TypeScript types `catch (e)` as `unknown`.

## In an interview, mention…

- The built-in subclasses with one realistic trigger each, plus `AggregateError` and `DOMException`.
- `cause` for wrapping errors (ES2022) and why you throw `Error` objects.
- Operational vs programmer errors drive *how* you handle them.
- Global reporting via `window.onerror` / `unhandledrejection` and a monitoring tool.
