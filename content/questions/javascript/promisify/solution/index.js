/**
 * @param {(...args: any[]) => void} fn A function whose last argument is a (error, value) callback.
 * @return {(...args: any[]) => Promise<any>}
 */
export default function promisify(fn) {
  return function promisified(...args) {
    // Arrow executor: `this` is still the caller's `this`.
    // Sync throws from `fn` happen inside the executor, so they become rejections.
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (error, value) => {
        if (error) {
          reject(error);
        } else {
          resolve(value);
        }
      });
    });
  };
}
