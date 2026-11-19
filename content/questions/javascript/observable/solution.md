## Approach

An observable is just a **function that connects an observer to a producer**. Almost all the complexity is in the guarantees, which we put in one place: a `Subscriber` object created per `subscribe` call.

### The `Subscriber` (safe observer)

It wraps the user's partial observer and keeps two pieces of state:

- `closed`: once `true`, every method is a no-op.
- `teardown`: the cleanup function returned by the producer.

```text
next(v)      -> if !closed: observer.next?.(v)
error(e)     -> if !closed: closed = true; observer.error?.(e); runTeardown()
complete()   -> if !closed: closed = true; observer.complete?.(); runTeardown()
unsubscribe  -> if !closed: closed = true; runTeardown()
```

`runTeardown` clears the stored teardown before calling it, so it can never run twice.

### `subscribe`

1. Normalise the argument: a function becomes `{ next: fn }`.
2. Create the `Subscriber`.
3. Call `subscribeFn(subscriber)` inside `try/catch`; a throw becomes `subscriber.error(err)`.
4. Store the returned teardown on the subscriber. **Edge case:** `Observable.of(1, 2)` calls `complete()` synchronously, before `subscribeFn` has returned its teardown. When the teardown arrives and the subscriber is already closed, run it immediately. Otherwise resources such as event listeners would leak.
5. Return `{ unsubscribe, get closed() }`.

### Operators

An operator is a function from observable to observable. `map(fn)` returns `(source) => new Observable((observer) => { ... })`. The inner subscribe function subscribes to `source`, transforms values and forwards `error`/`complete`. It returns `() => inner.unsubscribe()` as its teardown, which is how **unsubscription propagates up the chain** to the original producer.

Transformation functions run inside `try/catch`, and errors go to `observer.error`, so a bug in a `map` callback ends the stream cleanly instead of throwing into the producer.

`pipe(...ops)` is `ops.reduce((obs, op) => op(obs), this)`. This "pipeable operator" design (RxJS 5.5+) replaced prototype-patched `.map()` methods because standalone functions are tree-shakeable.

## Complexity

Each `next` passes through O(number of operators) functions. Memory is O(operators) per subscription.

## Cold vs hot

These observables are **cold**: each `subscribe` runs `subscribeFn` again, so two subscribers to an HTTP observable make two requests. A **hot** observable shares one producer among many subscribers (a `Subject`, or `share()`), like DOM events. Interviewers love this distinction because it explains duplicate network requests in Angular apps.

## Observables vs promises

| | Promise | Observable |
|---|---|---|
| Values | Exactly one | Zero to infinity |
| Eagerness | Starts when created | Starts on subscribe (lazy) |
| Cancellation | None built in (needs `AbortController`) | `unsubscribe()` runs the teardown |
| Delivery | Always async (microtask) | Synchronous unless the producer is async |

## Common mistakes

| Mistake | Consequence |
|---|---|
| Not guarding with `closed` | Values delivered after `complete`, or `complete` called twice |
| Ignoring a teardown returned after a synchronous complete | Leaked listeners and intervals |
| Operators that don't return the inner unsubscribe | Unsubscribing downstream leaves the source running |
| Running `subscribeFn` in the constructor | The observable becomes eager and shared |
| Letting operator callback errors throw | They crash the producer instead of reaching `error` |

## Real-world connection

- **Angular**'s `HttpClient`, router events and reactive forms are RxJS observables; the `async` pipe unsubscribes on destroy.
- **Redux-observable** models side effects as `action$.pipe(...)` epics.
- **The TC39 Observable proposal** and the WHATWG proposal for `element.when('click')` returning an observable keep this exact contract.
- In React, an observable is an external store: subscribe in `useEffect` and return `() => sub.unsubscribe()`.

## Follow-ups

- **`takeUntil(notifier$)`:** subscribe to both; when the notifier emits, complete and unsubscribe from both.
- **`switchMap(fn)`:** for each outer value, unsubscribe the previous inner observable and subscribe to `fn(value)`. That's the standard way to cancel stale typeahead requests.
- **`Subject`:** an observable that is also an observer and multicasts to a list of subscribers.
