/**
 * Returns a curried version of `func`.
 *
 * @param {Function} func
 * @return {Function}
 */
export default function curry(func) {
  return function curried(...args) {
    if (args.length >= func.length) {
      return func.apply(this, args);
    }
    return function (...more) {
      return curried.apply(this, [...args, ...more]);
    };
  };
}
