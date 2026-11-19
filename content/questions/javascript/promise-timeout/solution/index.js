function createTimeoutError(duration) {
  const error = new Error(`Promise timed out after ${duration}ms`);
  error.name = 'TimeoutError';
  return error;
}

/**
 * @param {Promise<any> | any} promise
 * @param {number} duration Milliseconds before rejecting with a TimeoutError.
 * @return {Promise<any>}
 */
export default function promiseTimeout(promise, duration) {
  return new Promise((resolve, reject) => {
    const timerId = setTimeout(() => reject(createTimeoutError(duration)), duration);

    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timerId);
        resolve(value);
      },
      (reason) => {
        clearTimeout(timerId);
        reject(reason);
      }
    );
  });
}
