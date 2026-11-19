Implement `promisify(fn)`. `fn` follows the Node.js callback convention: its **last** argument is a callback with the signature `(error, value) => void`. `promisify` returns a new function that takes the same arguments **minus** the callback and returns a promise instead.

```js
function readConfig(name, callback) {
  setTimeout(() => {
    if (name === 'missing') callback(new Error('Not found'));
    else callback(null, { name, debug: true });
  }, 10);
}

const readConfigAsync = promisify(readConfig);
await readConfigAsync('app'); // { name: 'app', debug: true }
await readConfigAsync('missing'); // rejects with Error('Not found')
```

## Requirements

- Forward all the call's arguments, then append the callback.
- If the callback receives a **truthy** `error`, reject with it. Otherwise fulfill with the second callback argument.
- Preserve `this`: `obj.method = promisify(fn); obj.method()` must call `fn` with `this === obj`.
- If `fn` throws synchronously, the returned promise rejects. The promisified function must never throw.
- If the callback is called more than once, only the first call counts.

## Follow-up

- How would you support callbacks that pass several values, like `(err, bytesRead, buffer)`?
- Go the other way: write `callbackify(asyncFn)`. What's the subtle bug to watch for?
