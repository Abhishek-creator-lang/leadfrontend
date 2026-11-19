## TL;DR

`finally` holds **cleanup code that must run no matter how the `try` block exits**: normal completion, `return`, `break`/`continue`, or a thrown error (caught or not). Typical uses: releasing resources, resetting loading flags, clearing timers, closing handles, removing listeners. Promises have the equivalent **`.finally()`**, and the newer explicit resource management syntax (`using`) automates the common case.

## Runs on every exit path

```js
function demo(mode) {
  try {
    if (mode === 'return') return 'returned';
    if (mode === 'throw') throw new Error('boom');
    return 'normal';
  } catch (e) {
    return 'caught';
  } finally {
    console.log('cleanup for', mode); // always logs
  }
}
demo('return'); // logs, then returns 'returned'
demo('throw');  // logs, then returns 'caught'
```

`try … finally` without `catch` is valid: the error still propagates, but only after cleanup.

## Real-world examples

```js
async function save(form) {
  setSaving(true);
  try {
    await api.save(form);
    toast('Saved');
  } catch (err) {
    toast('Save failed');
    report(err);
  } finally {
    setSaving(false); // spinner never gets stuck, whatever happened
  }
}
```

```js
const ctrl = new AbortController();
const timer = setTimeout(() => ctrl.abort(), 5000);
try {
  return await fetch(url, { signal: ctrl.signal });
} finally {
  clearTimeout(timer); // no stray timer either way
}
```

## Promise `.finally()`

```js
showSpinner();
fetchData()
  .then(render)
  .catch(showError)
  .finally(hideSpinner); // receives no arguments; passes the original result/rejection through
```

Unlike `.then`, a `.finally` callback's return value is ignored (unless it throws or returns a rejected promise, which replaces the outcome).

## Gotchas

**1. Control-flow statements in `finally` override the outcome.**

```js
function f() {
  try { throw new Error('lost'); }
  finally { return 'ok'; } // error silently discarded!
}
f(); // 'ok'
```

A `return`, `throw`, `break` or `continue` in `finally` replaces whatever the `try`/`catch` was doing. Linters flag this (`no-unsafe-finally`).

**2. Return values are computed before `finally` runs.**

```js
function g() {
  let x = 1;
  try { return x; }   // value 1 is captured here
  finally { x = 2; }  // doesn't change the returned value
}
g(); // 1
```

**3. `finally` doesn't run if the process/page dies** (tab closed, `process.exit()`, infinite loop in `try`). Don't rely on it for persistence across unloads.

## Modern alternative: `using`

```js
{
  using conn = openConnection(); // object with [Symbol.dispose]()
  await using file = await openFile(path); // [Symbol.asyncDispose]()
  // … work
} // disposed automatically in reverse order, even on throw
```

Explicit resource management (`using`, `DisposableStack`) is the structured version of try/finally cleanup. It's shipping in engines and supported by TypeScript 5.2+; check your targets.

## In an interview, mention…

- "Always runs" semantics on every exit path, including uncaught errors.
- Loading-flag/timer/lock cleanup as the canonical use, and `.finally()` for promises.
- The override gotcha and `using` as the newer pattern.
