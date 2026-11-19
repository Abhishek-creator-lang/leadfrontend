Implement `sleep(duration)`. It returns a promise that fulfills with `undefined` after **at least** `duration` milliseconds. Inside an `async` function, `await sleep(ms)` pauses that function without blocking anything else.

```js
async function greet() {
  console.log('Hello');
  await sleep(1000);
  console.log('...one second later');
}

sleep(200).then(() => console.log('200ms passed'));
console.log('this logs first, sleep does not block');
```

## Requirements

- Return a promise that fulfills with `undefined`.
- `duration` defaults to `0`. Even then, the promise fulfills asynchronously, in a later macrotask.
- Must **not** block the thread. Other timers and code keep running while a sleep is pending.

## Follow-up

- Why can't you write a sleep that blocks, the way `Thread.sleep` does in Java, without freezing the page?
- How would you make the sleep cancellable?
