/**
 * @param {Function} fn A Node-style callback function, optionally with fn[promisify.custom].
 * @return {(...args: any[]) => Promise<any>}
 */
export default function promisify(fn) {
  if (typeof fn !== 'function') {
    throw new TypeError('The "fn" argument must be a function');
  }

  const custom = fn[promisify.custom];
  if (custom !== undefined) {
    if (typeof custom !== 'function') {
      throw new TypeError('The [promisify.custom] property must be a function');
    }
    return custom;
  }

  function promisified(...args) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (error, value) => {
        if (error) {
          reject(error);
        } else {
          resolve(value);
        }
      });
    });
  }

  // Promisifying the result again returns it unchanged.
  Object.defineProperty(promisified, promisify.custom, {
    value: promisified,
    enumerable: false,
    writable: false,
    configurable: true,
  });

  return promisified;
}

// Keep this line: the custom implementation is looked up under this registered symbol.
promisify.custom = Symbol.for('nodejs.util.promisify.custom');
