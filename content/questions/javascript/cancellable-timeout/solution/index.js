/**
 * @param {Function} callback
 * @param {number} [delay=0]
 * @param {...any} args Arguments passed to the callback.
 * @return {() => void} A function that cancels the pending call.
 */
export default function setCancellableTimeout(callback, delay = 0, ...args) {
  const timerId = setTimeout(() => callback(...args), delay);
  return () => {
    // clearTimeout ignores ids that already fired or were cleared.
    clearTimeout(timerId);
  };
}
