/**
 * Calls the function (`this`) with the given `this` value and an array-like of arguments.
 * Do not use call, apply, bind or Reflect.apply.
 *
 * @param {*} thisArg
 * @param {ArrayLike<*> | null | undefined} [argsArray]
 * @return {*}
 */
export default function myApply(thisArg, argsArray) {
  throw 'Not implemented!';
}

Function.prototype.myApply = myApply;
