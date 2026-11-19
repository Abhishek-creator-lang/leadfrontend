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
export default function retry(fn, options = {}) {
  throw 'Not implemented!';
}
