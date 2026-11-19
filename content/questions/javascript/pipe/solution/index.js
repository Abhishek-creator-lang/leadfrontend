/**
 * @param {...Function} fns
 * @return {Function}
 */
export default function pipe(...fns) {
  fns.forEach((fn, i) => {
    if (typeof fn !== 'function') {
      throw new TypeError(`pipe: argument at index ${i} is not a function`);
    }
  });

  return function piped(...args) {
    if (fns.length === 0) return args[0];

    let result = fns[0].apply(this, args);
    for (let i = 1; i < fns.length; i++) {
      result = fns[i].call(this, result);
    }
    return result;
  };
}
