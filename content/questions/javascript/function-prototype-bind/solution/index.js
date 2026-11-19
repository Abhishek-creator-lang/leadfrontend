/**
 * Returns a new function with `this` fixed to `thisArg` and `boundArgs` prepended.
 * The function being bound is `this`. Do not use the native bind.
 *
 * @param {*} thisArg
 * @param {...*} boundArgs
 * @return {Function}
 */
export default function myBind(thisArg, ...boundArgs) {
  const target = this;
  if (typeof target !== 'function') {
    throw new TypeError('Function.prototype.myBind called on a non-function');
  }

  function bound(...args) {
    const finalArgs = [...boundArgs, ...args];
    if (new.target !== undefined) {
      // Called with `new`: ignore thisArg and construct the target.
      const newTarget = new.target === bound ? target : new.target;
      return Reflect.construct(target, finalArgs, newTarget);
    }
    return Reflect.apply(target, thisArg, finalArgs);
  }

  // Native bound functions delegate `instanceof` to their target.
  Object.defineProperty(bound, Symbol.hasInstance, {
    value: (instance) => instance instanceof target,
    configurable: true,
  });

  const targetLength = typeof target.length === 'number' ? target.length : 0;
  Object.defineProperty(bound, 'length', {
    value: Math.max(0, targetLength - boundArgs.length),
    configurable: true,
  });
  Object.defineProperty(bound, 'name', {
    value: `bound ${typeof target.name === 'string' ? target.name : ''}`,
    configurable: true,
  });

  return bound;
}

Function.prototype.myBind = myBind;
