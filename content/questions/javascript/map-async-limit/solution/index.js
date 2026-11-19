/**
 * @template T, U
 * @param {T[]} items
 * @param {number} limit Maximum number of callbacks pending at once.
 * @param {(item: T, index: number) => U | Promise<U>} callback
 * @return {Promise<U[]>}
 */
export default function mapAsyncLimit(items, limit, callback) {
  return new Promise((resolve, reject) => {
    const total = items.length;
    const results = new Array(total);
    let nextIndex = 0;
    let completed = 0;
    let failed = false;

    if (total === 0) {
      resolve(results);
      return;
    }

    function launchNext() {
      if (failed || nextIndex >= total) return;
      const index = nextIndex++;

      let pending;
      try {
        pending = Promise.resolve(callback(items[index], index));
      } catch (error) {
        pending = Promise.reject(error);
      }

      pending.then(
        (value) => {
          results[index] = value;
          completed += 1;
          if (completed === total) {
            resolve(results);
          } else {
            launchNext();
          }
        },
        (error) => {
          failed = true;
          reject(error);
        }
      );
    }

    const workers = Math.min(limit, total);
    for (let i = 0; i < workers; i++) launchNext();
  });
}
