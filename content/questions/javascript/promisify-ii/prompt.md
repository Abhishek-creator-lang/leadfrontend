This builds on the **Promisify** question. Implement `promisify(fn)` for Node-style callback functions (callback last, called as `(error, value)`), **plus** support for a custom promisified implementation, modelled on Node's [`util.promisify.custom`](https://nodejs.org/api/util.html#custom-promisified-functions).

Some functions can't be promisified mechanically. For example, a callback might receive several values, or the function might not use the error-first convention. Their authors can attach a hand-written promise version under a well-known symbol, and `promisify` returns that instead.

```js
// Expose the symbol as a property of promisify:
promisify.custom === Symbol.for('nodejs.util.promisify.custom'); // true

function legacyStat(path, callback) {
  callback(null, 1024, 'file'); // two values, which mechanical promisify would truncate
}
legacyStat[promisify.custom] = (path) => Promise.resolve({ size: 1024, type: 'file' });

const stat = promisify(legacyStat);
stat === legacyStat[promisify.custom]; // true: the custom version is returned as-is
await stat('/tmp/a'); // { size: 1024, type: 'file' }
```

## Requirements

- `promisify.custom` is `Symbol.for('nodejs.util.promisify.custom')`. Using the **global** symbol registry means separately bundled code can agree on the symbol without importing it from your module.
- If `fn[promisify.custom]` is defined:
  - and it's a function, return it **unchanged**.
  - and it's not a function, throw a `TypeError`.
- Otherwise build the wrapper as in Promisify: forward arguments, append the callback, reject on a truthy error, fulfill with the first value, preserve `this`, and turn synchronous throws into rejections.
- Store the wrapper on itself under `promisify.custom`, so promisifying it again returns the same function: `promisify(promisify(f)) === promisify(f)`.
- Throw a `TypeError` if `fn` is not a function.

## Follow-up

- Why `Symbol.for` rather than `Symbol()`?
- What other built-in protocols use well-known or registered symbols this way?
