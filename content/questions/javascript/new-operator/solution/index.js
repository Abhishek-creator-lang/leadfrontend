function isObject(value) {
  return value !== null && (typeof value === 'object' || typeof value === 'function');
}

/**
 * Does what `new constructor(...args)` does, without `new` or Reflect.construct.
 *
 * @param {Function} constructor
 * @param {...any} args
 * @return {Object}
 */
export default function myNew(constructor, ...args) {
  if (typeof constructor !== 'function') {
    throw new TypeError(`${String(constructor)} is not a constructor`);
  }

  // Fall back to Object.prototype when `prototype` is not an object, like the spec.
  const proto = isObject(constructor.prototype) ? constructor.prototype : Object.prototype;
  const instance = Object.create(proto);

  const result = constructor.apply(instance, args);

  // An object (or function) returned by the constructor replaces the instance.
  return isObject(result) ? result : instance;
}
