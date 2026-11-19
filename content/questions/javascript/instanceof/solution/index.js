function isObject(value) {
  return value !== null && (typeof value === 'object' || typeof value === 'function');
}

const defaultHasInstance = Function.prototype[Symbol.hasInstance];

function ordinaryHasInstance(target, value) {
  if (!isObject(value)) return false;

  const proto = target.prototype;
  if (!isObject(proto)) {
    throw new TypeError("Function has non-object prototype in instanceof check");
  }

  let current = Object.getPrototypeOf(value);
  while (current !== null) {
    if (current === proto) return true;
    current = Object.getPrototypeOf(current);
  }
  return false;
}

/**
 * Returns the same result as `value instanceof target`, without using `instanceof`.
 *
 * @param {*} value
 * @param {*} target
 * @return {boolean}
 */
export default function myInstanceOf(value, target) {
  if (!isObject(target)) {
    throw new TypeError("Right-hand side of 'instanceof' is not an object");
  }

  const hasInstance = target[Symbol.hasInstance];
  if (hasInstance != null && hasInstance !== defaultHasInstance) {
    if (typeof hasInstance !== 'function') {
      throw new TypeError('Symbol.hasInstance is not a function');
    }
    return Boolean(hasInstance.call(target, value));
  }

  if (typeof target !== 'function') {
    throw new TypeError("Right-hand side of 'instanceof' is not callable");
  }
  return ordinaryHasInstance(target, value);
}
