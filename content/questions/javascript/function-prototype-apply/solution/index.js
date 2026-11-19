function createListFromArrayLike(arrayLike) {
  if (arrayLike == null) return [];
  if (typeof arrayLike !== 'object' && typeof arrayLike !== 'function') {
    throw new TypeError('CreateListFromArrayLike called on non-object');
  }
  const length = Math.min(Math.max(Math.trunc(Number(arrayLike.length)) || 0, 0), Number.MAX_SAFE_INTEGER);
  const list = new Array(length);
  for (let i = 0; i < length; i++) {
    list[i] = arrayLike[i]; // holes read as undefined
  }
  return list;
}

/**
 * Calls the function (`this`) with the given `this` value and an array-like of arguments.
 * Do not use call, apply, bind or Reflect.apply.
 *
 * @param {*} thisArg
 * @param {ArrayLike<*> | null | undefined} [argsArray]
 * @return {*}
 */
export default function myApply(thisArg, argsArray) {
  const fn = this;
  if (typeof fn !== 'function') {
    throw new TypeError('Function.prototype.myApply called on a non-function');
  }
  const args = createListFromArrayLike(argsArray);

  const context = thisArg == null ? globalThis : Object(thisArg);
  const key = Symbol('myApply');
  Object.defineProperty(context, key, {
    value: fn,
    configurable: true,
    enumerable: false,
    writable: false,
  });

  try {
    return context[key](...args);
  } finally {
    delete context[key];
  }
}

Function.prototype.myApply = myApply;
