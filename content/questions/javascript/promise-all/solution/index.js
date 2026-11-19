/**
 * @param {Iterable<any>} iterable
 * @return {Promise<Array<any>>}
 */
export default function promiseAll(iterable) {
  return new Promise((resolve, reject) => {
    // Throws a TypeError for non-iterables, which the executor turns into a rejection.
    const items = [...iterable];
    const results = new Array(items.length);
    let remaining = items.length;

    if (remaining === 0) {
      resolve(results);
      return;
    }

    items.forEach((item, index) => {
      Promise.resolve(item).then((value) => {
        results[index] = value;
        remaining -= 1;
        if (remaining === 0) resolve(results);
      }, reject);
    });
  });
}
