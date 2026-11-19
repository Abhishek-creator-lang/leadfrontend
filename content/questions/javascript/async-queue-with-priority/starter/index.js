/**
 * @param {number} concurrency Maximum number of tasks running at once.
 * @return {{
 *   add: <T>(task: () => T | Promise<T>, priority?: number) => Promise<T>,
 *   readonly size: number,
 *   readonly running: number,
 * }}
 */
export default function createPriorityQueue(concurrency) {
  throw 'Not implemented!';
}
