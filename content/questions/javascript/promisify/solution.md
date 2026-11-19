## Approach

`promisify` is a higher-order function. It returns a wrapper that, on every call, creates a promise and passes a **callback that settles it** as the last argument to `fn`:

```js
return function promisified(...args) {
  return new Promise((resolve, reject) => {
    fn.call(this, ...args, (error, value) => {
      if (error) reject(error);
      else resolve(value);
    });
  });
};
```

Three details carry the senior signal:

1. **`function`, not an arrow, for `promisified`.** It must receive the caller's `this` so that methods keep working (`fs` methods don't need it, but class methods like `db.query` do). The **executor** is an arrow on purpose, so `this` inside it is still the wrapper's `this`.
2. **Calling `fn` inside the executor.** The `Promise` constructor catches synchronous throws from the executor and converts them into rejections. If you called `fn` outside the executor, a sync throw would escape as an exception, and callers using `.catch` would miss it.
3. **First call wins.** A misbehaving `fn` that calls back twice can't change the result, because a promise settles once. No flag needed.

## Complexity

O(1) overhead per call, plus O(n) to copy n arguments.

## Edge cases

- **Falsy errors:** Node's convention treats any truthy `error` as a failure, so `callback(null, v)`, `callback(undefined, v)` and even `callback(0, v)` all fulfill. A stricter variant could check `error != null`. Pick one rule and say which.
- **No value:** `callback(null)` fulfills with `undefined`.
- **Synchronous callbacks:** if `fn` calls back synchronously, the promise is already settled by the time it's returned. Callers still see the result asynchronously, because `.then` handlers always run as microtasks. That fixes the classic "Zalgo" problem (APIs that are sometimes sync, sometimes async).

## Common mistakes

| Mistake | Consequence |
|---|---|
| Arrow function wrapper | `this` is lost for methods |
| `fn(...args, cb)` without `.call(this, ...)` | Same: `this` is `undefined` |
| Calling `fn` before `new Promise` | Sync throws escape instead of rejecting |
| `if (error !== null)` | `callback(undefined, value)` rejects with `undefined` |
| Putting the callback first | Breaks the Node convention, where the callback is last |

## Follow-ups

- **Multiple values:** Node's built-in `util.promisify` resolves with only the first value, except for functions that define a custom promisified version (see `promisify-ii`). For `(err, a, b)`, a variant can resolve with an array or an object: `(err, ...values) => resolve(values)`. Node itself names the extra values for a few core functions, so `promisify(fs.read)` resolves with `{ bytesRead, buffer }`.
- **`callbackify(asyncFn)`:** return `function (...args) { const cb = args.pop(); asyncFn.apply(this, args).then((v) => cb(null, v), (e) => cb(e)); }`. The bug to avoid is `.then((v) => cb(null, v)).catch(cb)`: if the callback *itself* throws, `.catch` calls it a second time with its own error. Node also wraps a falsy rejection reason in an `Error` (`ERR_FALSY_VALUE_REJECTION`) so the callback can tell it apart from success.
- **Why it matters today:** many browser and Node APIs now have promise versions (`fs/promises`, `timers/promises`), but wrapping legacy SDKs and event-based APIs is still everyday work.
