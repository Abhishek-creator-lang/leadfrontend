/**
 * @param {Function} func
 * @param {...any} boundArgs Use `partial.placeholder` to leave a position open.
 * @return {Function}
 */
export default function partial(func, ...boundArgs) {
  throw 'Not implemented!';
}

partial.placeholder = Symbol('partial.placeholder');
