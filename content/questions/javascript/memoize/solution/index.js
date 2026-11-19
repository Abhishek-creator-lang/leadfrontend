/**
 * @param {Function} func
 * @param {Function} [resolver] Builds the cache key from the arguments.
 * @return {Function & { cache: Map<any, any> }}
 */
export default function memoize(func, resolver) {
  const cache = new Map();

  function memoized(...args) {
    const key = resolver ? resolver.apply(this, args) : args[0];
    if (cache.has(key)) return cache.get(key);

    const result = func.apply(this, args);
    cache.set(key, result);
    return result;
  }

  memoized.cache = cache;
  return memoized;
}
