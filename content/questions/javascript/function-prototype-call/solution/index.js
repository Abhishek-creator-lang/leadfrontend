/**
 * Calls the function (`this`) with the given `this` value and arguments.
 * Do not use call, apply, bind or Reflect.apply.
 *
 * @param {*} thisArg
 * @param {...*} args
 * @return {*}
 */
export default function myCall(thisArg, ...args) {
  const fn = this;
  if (typeof fn !== 'function') {
    throw new TypeError('Function.prototype.myCall called on a non-function');
  }

  const context = thisArg == null ? globalThis : Object(thisArg);
  const key = Symbol('myCall');

  Object.defineProperty(context, key, {
    value: fn,
    configurable: true,
    enumerable: false,
    writable: false,
  });

  try {
    // A method call makes the engine set `this` to `context`.
    return context[key](...args);
  } finally {
    delete context[key];
  }
}

Function.prototype.myCall = myCall;
