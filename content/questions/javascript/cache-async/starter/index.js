/**
 * @template {(...args: any[]) => any} F
 * @param {F} fn
 * @param {{ ttl?: number, key?: (...args: Parameters<F>) => string }} [options]
 * @return {((...args: Parameters<F>) => Promise<Awaited<ReturnType<F>>>) & {
 *   clear: () => void,
 *   delete: (...args: Parameters<F>) => void,
 * }}
 */
export default function cacheAsync(fn, options = {}) {
  throw 'Not implemented!';
}
