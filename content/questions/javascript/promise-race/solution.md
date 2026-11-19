## Approach

`race` needs no bookkeeping at all. Hand the outer `resolve` and `reject` to every input:

```js
for (const item of items) {
  Promise.resolve(item).then(resolve, reject);
}
```

A promise can only settle once. Whichever input calls one of these first decides the result, and every later call is silently ignored. That's the whole trick, and it's worth saying out loud in an interview because it shows you understand the "settle once" guarantee.

## Why `Promise.resolve(item)`?

It normalizes plain values and thenables into promises so `.then` always exists. It also determines the winner when several inputs are already settled. `.then` callbacks run as microtasks in the order they were registered, so the first already-settled item in iteration order wins:

```js
promiseRace([Promise.resolve('a'), 'b']); // 'a'
```

## Empty input

With no items nothing calls `resolve` or `reject`, so the promise stays pending forever. That's the spec behaviour, and many people find it surprising. Racing against nothing never produces a winner. Code that builds the input list dynamically should guard against an empty list.

## Complexity

O(n) to attach handlers. Settlement time is that of the fastest input.

## Common mistakes

- **Adding a `settled` flag.** It is harmless but unnecessary, and suggests you don't trust the promise guarantees.
- **Resolving with `[]` or rejecting for empty input.** Native `race` does neither.
- **Calling `item.then` directly**, which crashes on plain values.
- **Treating `race` as "first success".** That's `any`.

## Timeouts with `race`, and the leak

```js
const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms));
await promiseRace([fetch(url), timeout(5000)]);
```

This pattern has two clean-up problems a senior candidate should mention:

1. **The timer keeps running** after `fetch` wins. In Node it can keep the process alive, and in tests it can fire after the test finishes. Clear it in a `finally` (see the `promise-timeout` question).
2. **The loser isn't cancelled.** The `fetch` keeps downloading after the timeout wins. Pass an `AbortSignal` (or use `AbortSignal.timeout(ms)` in modern runtimes) so the request is actually aborted.

## Follow-ups

- **Memory:** racing against a promise that never settles, repeatedly, inside a loop can retain closures. Each `race` attaches a new reaction to the long-lived promise, and those reactions are only released when it settles.
- **Use cases beyond timeouts:** first response among redundant sources when failures should surface immediately, or "whichever user action happens first" in a UI flow.
