/**
 * @template T, U
 * @param {T[]} items
 * @param {(item: T, index: number) => U | Promise<U>} callback
 * @return {Promise<U[]>}
 */
export default function mapAsync(items, callback) {
  return new Promise((resolve, reject) => {
    const results = new Array(items.length);
    let remaining = items.length;

    if (remaining === 0) {
      resolve(results);
      return;
    }

    items.forEach((item, index) => {
      let pending;
      try {
        pending = Promise.resolve(callback(item, index));
      } catch (error) {
        pending = Promise.reject(error);
      }

      pending.then((value) => {
        results[index] = value;
        remaining -= 1;
        if (remaining === 0) resolve(results);
      }, reject);
    });
  });
}
