/**
 * @param {...Function} fns
 * @return {Function}
 */
export default function compose(...fns) {
  return function composed(...args) {
    if (fns.length === 0) return args[0];

    let result = fns[fns.length - 1].apply(this, args);
    for (let i = fns.length - 2; i >= 0; i--) {
      result = fns[i].call(this, result);
    }
    return result;
  };
}
