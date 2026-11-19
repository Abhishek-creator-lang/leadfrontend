/**
 * @param {Function} func
 * @return {Function}
 */
export default function curry(func) {
  const arity = func.length;
  const hole = curry.placeholder;

  function make(collected) {
    return function curried(...incoming) {
      const merged = [];
      let next = 0;

      for (const value of collected) {
        if (value === hole && next < incoming.length) {
          merged.push(incoming[next++]);
        } else {
          merged.push(value);
        }
      }
      while (next < incoming.length) merged.push(incoming[next++]);

      const ready =
        merged.length >= arity && merged.slice(0, arity).every((value) => value !== hole);

      return ready ? func.apply(this, merged) : make(merged);
    };
  }

  return make([]);
}

curry.placeholder = Symbol('curry.placeholder');
