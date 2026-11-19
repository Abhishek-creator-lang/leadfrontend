/**
 * @param {Function} func
 * @return {Function}
 */
export default function once(func) {
  let done = false;
  let result;

  return function onced(...args) {
    if (done) return result;
    done = true;
    try {
      result = func.apply(this, args);
    } catch (err) {
      done = false;
      throw err;
    }
    return result;
  };
}
