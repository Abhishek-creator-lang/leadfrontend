// intervalId -> id of the currently scheduled setTimeout
const activeTimers = new Map();
let nextId = 1;

/**
 * Clears an interval created by mySetInterval.
 * @param {number} id
 */
export function myClearInterval(id) {
  if (!activeTimers.has(id)) return;
  clearTimeout(activeTimers.get(id));
  activeTimers.delete(id);
}

/**
 * Calls `callback(...args)` every `delay` ms using only setTimeout.
 * @param {Function} callback
 * @param {number} [delay=0]
 * @param {...any} args
 * @return {number} An id to pass to myClearInterval.
 */
export default function mySetInterval(callback, delay = 0, ...args) {
  const id = nextId++;

  function schedule() {
    activeTimers.set(id, setTimeout(tick, delay));
  }

  function tick() {
    try {
      callback(...args);
    } finally {
      // The callback may have cleared this interval; only continue if it is still active.
      if (activeTimers.has(id)) schedule();
    }
  }

  schedule();
  return id;
}
