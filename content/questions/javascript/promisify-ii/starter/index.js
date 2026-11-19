/**
 * @param {Function} fn A Node-style callback function, optionally with fn[promisify.custom].
 * @return {(...args: any[]) => Promise<any>}
 */
export default function promisify(fn) {
  throw 'Not implemented!';
}

// Keep this line: the custom implementation is looked up under this registered symbol.
promisify.custom = Symbol.for('nodejs.util.promisify.custom');
