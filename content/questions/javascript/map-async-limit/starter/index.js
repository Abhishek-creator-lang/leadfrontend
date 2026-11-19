/**
 * @template T, U
 * @param {T[]} items
 * @param {number} limit Maximum number of callbacks pending at once.
 * @param {(item: T, index: number) => U | Promise<U>} callback
 * @return {Promise<U[]>}
 */
export default function mapAsyncLimit(items, limit, callback) {
  throw 'Not implemented!';
}
