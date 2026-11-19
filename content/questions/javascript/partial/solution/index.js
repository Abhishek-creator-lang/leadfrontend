/**
 * @param {Function} func
 * @param {...any} boundArgs Use `partial.placeholder` to leave a position open.
 * @return {Function}
 */
export default function partial(func, ...boundArgs) {
  return function partiallyApplied(...callArgs) {
    let next = 0;
    const finalArgs = boundArgs.map((arg) =>
      arg === partial.placeholder ? callArgs[next++] : arg
    );
    for (; next < callArgs.length; next++) finalArgs.push(callArgs[next]);
    return func.apply(this, finalArgs);
  };
}

partial.placeholder = Symbol('partial.placeholder');
