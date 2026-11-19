/**
 * @typedef {(context: any, next: () => Promise<void>) => any} Middleware
 */

/**
 * @param {Middleware[]} middlewares
 * @return {(context: any, next?: () => any) => Promise<void>}
 */
export default function compose(middlewares) {
  return function run(context, finalNext) {
    // Per-run state, so concurrent runs don't interfere.
    let lastCalled = -1;

    function dispatch(i) {
      if (i <= lastCalled) {
        return Promise.reject(new Error('next() called multiple times'));
      }
      lastCalled = i;

      const fn = i === middlewares.length ? finalNext : middlewares[i];
      if (!fn) return Promise.resolve();

      try {
        return Promise.resolve(fn(context, () => dispatch(i + 1))).then(() => undefined);
      } catch (error) {
        return Promise.reject(error);
      }
    }

    return dispatch(0);
  };
}
