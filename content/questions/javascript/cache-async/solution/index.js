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
  const { ttl = Infinity, key: toKey = (...args) => JSON.stringify(args) } = options;
  const cache = new Map();

  function cached(...args) {
    const key = toKey(...args);
    const existing = cache.get(key);
    if (existing && Date.now() < existing.expiresAt) {
      return existing.promise;
    }

    let promise;
    try {
      promise = Promise.resolve(fn.apply(this, args));
    } catch (error) {
      return Promise.reject(error);
    }

    const entry = { promise, expiresAt: Infinity };
    cache.set(key, entry);

    promise.then(
      () => {
        entry.expiresAt = Date.now() + ttl;
      },
      () => {
        // Only evict if this entry wasn't already replaced or deleted.
        if (cache.get(key) === entry) cache.delete(key);
      }
    );

    return promise;
  }

  cached.clear = () => cache.clear();
  cached.delete = (...args) => {
    cache.delete(toKey(...args));
  };

  return cached;
}
