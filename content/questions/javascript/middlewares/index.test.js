import compose from './index';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe('compose (middlewares)', () => {
  test('returns a function that returns a promise', async () => {
    const run = compose([]);
    const result = run({});
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBeUndefined();
  });

  test('runs middlewares in order with a shared context', async () => {
    const run = compose([
      (ctx, next) => {
        ctx.steps.push(1);
        return next();
      },
      (ctx, next) => {
        ctx.steps.push(2);
        return next();
      },
    ]);
    const ctx = { steps: [] };
    await run(ctx);
    expect(ctx.steps).toEqual([1, 2]);
  });

  test('implements the onion model: code after await next() runs on the way back', async () => {
    const log = [];
    const run = compose([
      async (ctx, next) => {
        log.push('a-in');
        await next();
        log.push('a-out');
      },
      async (ctx, next) => {
        log.push('b-in');
        await sleep(10);
        await next();
        log.push('b-out');
      },
      async () => {
        log.push('c');
      },
    ]);
    await run({});
    expect(log).toEqual(['a-in', 'b-in', 'c', 'b-out', 'a-out']);
  });

  test('stops when a middleware does not call next', async () => {
    const last = jest.fn();
    const run = compose([(ctx) => (ctx.body = 'early'), last]);
    const ctx = {};
    await run(ctx);
    expect(ctx.body).toBe('early');
    expect(last).not.toHaveBeenCalled();
  });

  test('calls the final next after the last middleware', async () => {
    const finalNext = jest.fn();
    const run = compose([(ctx, next) => next(), (ctx, next) => next()]);
    await run({}, finalNext);
    expect(finalNext).toHaveBeenCalledTimes(1);
  });

  test('works with synchronous middlewares', async () => {
    const run = compose([
      (ctx, next) => {
        ctx.n = 1;
        next();
      },
      (ctx) => {
        ctx.n += 1;
      },
    ]);
    const ctx = {};
    await run(ctx);
    expect(ctx.n).toBe(2);
  });

  test('rejects when a middleware throws synchronously', async () => {
    const run = compose([
      (ctx, next) => next(),
      () => {
        throw new Error('sync boom');
      },
    ]);
    await expect(run({})).rejects.toThrow('sync boom');
  });

  test('rejects when a middleware rejects', async () => {
    const run = compose([
      async () => {
        await sleep(5);
        throw new Error('async boom');
      },
    ]);
    await expect(run({})).rejects.toThrow('async boom');
  });

  test('an upstream middleware can catch downstream errors', async () => {
    const run = compose([
      async (ctx, next) => {
        try {
          await next();
        } catch (err) {
          ctx.status = 500;
          ctx.error = err.message;
        }
      },
      () => {
        throw new Error('handler failed');
      },
    ]);
    const ctx = {};
    await expect(run(ctx)).resolves.toBeUndefined();
    expect(ctx).toEqual({ status: 500, error: 'handler failed' });
  });

  test('calling next() twice rejects', async () => {
    const downstream = jest.fn();
    const run = compose([
      async (ctx, next) => {
        await next();
        await next();
      },
      downstream,
    ]);
    await expect(run({})).rejects.toThrow();
    expect(downstream).toHaveBeenCalledTimes(1);
  });

  test('separate runs are independent, even concurrently', async () => {
    const run = compose([
      async (ctx, next) => {
        await sleep(ctx.delay);
        await next();
      },
      (ctx) => {
        ctx.done = true;
      },
    ]);
    const a = { delay: 20 };
    const b = { delay: 5 };
    await Promise.all([run(a), run(b)]);
    expect(a.done).toBe(true);
    expect(b.done).toBe(true);
  });
});
