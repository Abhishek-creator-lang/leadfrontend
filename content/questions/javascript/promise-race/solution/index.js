/**
 * @param {Iterable<any>} iterable
 * @return {Promise<any>}
 */
export default function promiseRace(iterable) {
  return new Promise((resolve, reject) => {
    // A promise settles only once, so the first input to call resolve/reject wins.
    for (const item of iterable) {
      Promise.resolve(item).then(resolve, reject);
    }
  });
}
