/**
 * @param {number} concurrency Maximum number of tasks running at once.
 * @return {{
 *   add: <T>(task: () => T | Promise<T>) => Promise<T>,
 *   onIdle: () => Promise<void>,
 *   readonly running: number,
 *   readonly pending: number,
 * }}
 */
export default function createPool(concurrency) {
  const queue = [];
  let running = 0;
  let idleWaiters = [];

  function notifyIfIdle() {
    if (running === 0 && queue.length === 0 && idleWaiters.length > 0) {
      const waiters = idleWaiters;
      idleWaiters = [];
      waiters.forEach((resolve) => resolve());
    }
  }

  function runEntry({ task, resolve, reject }) {
    running += 1;
    let result;
    try {
      result = Promise.resolve(task());
    } catch (error) {
      result = Promise.reject(error);
    }
    // Release the slot *before* settling the caller's promise, so that by the
    // time a caller observes the result, `running` is already up to date.
    const release = () => {
      running -= 1;
      drain();
      notifyIfIdle();
    };
    result.then(
      (value) => {
        release();
        resolve(value);
      },
      (error) => {
        release();
        reject(error);
      }
    );
  }

  function drain() {
    while (running < concurrency && queue.length > 0) {
      runEntry(queue.shift());
    }
  }

  return {
    add(task) {
      return new Promise((resolve, reject) => {
        queue.push({ task, resolve, reject });
        drain();
      });
    },
    onIdle() {
      if (running === 0 && queue.length === 0) return Promise.resolve();
      return new Promise((resolve) => idleWaiters.push(resolve));
    },
    get running() {
      return running;
    },
    get pending() {
      return queue.length;
    },
  };
}
