Implement `compose(middlewares)`. It takes an array of middleware functions and returns a single function `run(context, next?)` that executes them as a pipeline.

Each middleware has the signature `(context, next) => any`. Calling `next()` runs the rest of the pipeline and returns a **promise** that settles when the downstream middlewares have finished. A middleware can therefore do work before `next()`, wait for it, and then do more work afterwards. This is the "onion" model used by Koa.

```js
const log = [];

const run = compose([
  async (ctx, next) => {
    log.push('timer start');
    await next();
    log.push('timer end');
  },
  async (ctx, next) => {
    ctx.user = 'ada';
    await next();
  },
  async (ctx) => {
    ctx.body = `hello ${ctx.user}`; // doesn't call next: the pipeline stops here
  },
]);

const ctx = {};
await run(ctx);
// ctx.body -> 'hello ada'
// log -> ['timer start', 'timer end']
```

## Requirements

- Middlewares run in array order, all sharing the same `context` object.
- `run` always returns a promise. It resolves (with `undefined`) once the first middleware has finished.
- If a middleware does not call `next`, the downstream middlewares don't run.
- If `run` is given a `next` function, it is called after the last middleware calls `next()`. Otherwise, the last `next()` resolves immediately.
- A middleware that throws, synchronously or asynchronously, rejects the promise returned by its caller's `next()`. An upstream middleware can therefore `try/catch` around `await next()` to handle errors. An unhandled error rejects `run`'s promise.
- Calling `next()` more than once in the same middleware rejects with an `Error`.
- `run` can be called many times; each call is independent.

## Follow-up

- How does Express's `next(err)` error handling differ from this?
- How is Redux's `applyMiddleware` related?
- How would you write a timeout middleware?
