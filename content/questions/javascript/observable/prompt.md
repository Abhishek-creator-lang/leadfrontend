Implement a minimal `Observable` class in the spirit of RxJS, plus two pipeable operators, `map` and `filter`.

An observable is a **lazy push-based stream**. Nothing happens until someone subscribes; then the producer pushes values with `next`, and finishes with either `complete` or `error`.

```js
const ticks = new Observable((observer) => {
  let n = 0;
  const id = setInterval(() => observer.next(n++), 100);
  return () => clearInterval(id); // teardown
});

const sub = ticks
  .pipe(
    filter((n) => n % 2 === 0),
    map((n) => n * 10)
  )
  .subscribe({
    next: (v) => console.log(v), // 0, 20, 40, ...
    complete: () => console.log('done'),
  });

setTimeout(() => sub.unsubscribe(), 1000); // runs the teardown, so the interval is cleared
```

## API

### `new Observable(subscribeFn)`

`subscribeFn(observer)` runs **once per `subscribe` call**. It receives an observer with `next(value)`, `error(err)` and `complete()`, and may return a teardown function.

### `observable.subscribe(observerOrNext)`

Accepts either a function (treated as `next`) or a partial observer `{ next?, error?, complete? }`. Returns a subscription `{ unsubscribe(), closed }`.

### `observable.pipe(...operators)`

Each operator is a function `(source: Observable) => Observable`. `pipe` applies them left to right. `pipe()` with no operators returns the same observable.

### `Observable.of(...values)` and `Observable.from(iterable)`

Emit each value synchronously, then complete.

### Named exports `map(fn)` and `filter(predicate)`

Operators that return new observables. `fn` and `predicate` receive `(value, index)`. If they throw, the error goes to the subscriber's `error`.

## Guarantees (the "safe subscriber")

- After `error` or `complete` has been delivered, or after `unsubscribe()`, further `next` / `error` / `complete` calls are ignored.
- The teardown runs **exactly once**: on `unsubscribe()`, after `complete`, or after `error`. If the producer completes synchronously before returning its teardown, the teardown runs as soon as it's returned.
- If `subscribeFn` throws, the error is delivered to the subscriber's `error`.
- `closed` is `true` once the subscription has ended for any reason.
- If an observer has no `error` handler, errors are ignored (RxJS would report them globally; you don't need to).
- Unsubscribing from a piped observable also unsubscribes from its source.

## Follow-up

- Observables vs promises: what's the difference in eagerness, cardinality and cancellation?
- What is the difference between a cold and a hot observable?
- How would you write `takeUntil` or `switchMap`?
