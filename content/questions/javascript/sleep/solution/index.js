/**
 * @param {number} [duration=0] Milliseconds to wait.
 * @return {Promise<void>}
 */
export default function sleep(duration = 0) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), duration);
  });
}
