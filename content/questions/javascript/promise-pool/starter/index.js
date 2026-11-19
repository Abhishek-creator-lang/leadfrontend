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
  throw 'Not implemented!';
}
