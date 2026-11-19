const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @template T
 * @param {(attempt: number) => T | Promise<T>} fn
 * @param {{
 *   retries?: number,
 *   baseDelay?: number,
 *   factor?: number,
 *   maxDelay?: number,
 *   shouldRetry?: (error: unknown, attempt: number) => boolean,
 * }} [options]
 * @return {Promise<T>}
 */
export default async function retry(fn, options = {}) {
  const {
    retries = 3,
    baseDelay = 100,
    factor = 2,
    maxDelay = Infinity,
    shouldRetry = () => true,
  } = options;

  for (let attempt = 1; ; attempt++) {
    try {
      // `return await` so that a rejection lands in the catch block below.
      return await fn(attempt);
    } catch (error) {
      const retriesUsed = attempt - 1;
      if (retriesUsed >= retries || !shouldRetry(error, attempt)) {
        throw error;
      }
      const delay = Math.min(baseDelay * factor ** retriesUsed, maxDelay);
      await sleep(delay);
    }
  }
}
