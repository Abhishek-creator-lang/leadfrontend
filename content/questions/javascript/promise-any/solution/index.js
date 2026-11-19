/**
 * @param {Iterable<any>} iterable
 * @return {Promise<any>}
 */
export default function promiseAny(iterable) {
  return new Promise((resolve, reject) => {
    const items = [...iterable]; // a TypeError here rejects the returned promise
    const errors = new Array(items.length);
    let remaining = items.length;

    if (remaining === 0) {
      reject(new AggregateError(errors, 'All promises were rejected'));
      return;
    }

    items.forEach((item, index) => {
      Promise.resolve(item).then(resolve, (reason) => {
        errors[index] = reason;
        remaining -= 1;
        if (remaining === 0) {
          reject(new AggregateError(errors, 'All promises were rejected'));
        }
      });
    });
  });
}
