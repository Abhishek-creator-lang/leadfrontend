/**
 * @param {Iterable<any>} iterable
 * @return {Promise<Array<{status: 'fulfilled', value: any} | {status: 'rejected', reason: any}>>}
 */
export default function promiseAllSettled(iterable) {
  return new Promise((resolve) => {
    const items = [...iterable]; // a TypeError here rejects the returned promise
    const results = new Array(items.length);
    let remaining = items.length;

    if (remaining === 0) {
      resolve(results);
      return;
    }

    function settle(index, outcome) {
      results[index] = outcome;
      remaining -= 1;
      if (remaining === 0) resolve(results);
    }

    items.forEach((item, index) => {
      Promise.resolve(item).then(
        (value) => settle(index, { status: 'fulfilled', value }),
        (reason) => settle(index, { status: 'rejected', reason })
      );
    });
  });
}
