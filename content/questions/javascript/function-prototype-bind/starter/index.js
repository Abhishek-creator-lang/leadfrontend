/**
 * Returns a new function with `this` fixed to `thisArg` and `boundArgs` prepended.
 * The function being bound is `this`. Do not use the native bind.
 *
 * @param {*} thisArg
 * @param {...*} boundArgs
 * @return {Function}
 */
export default function myBind(thisArg, ...boundArgs) {
  throw 'Not implemented!';
}

Function.prototype.myBind = myBind;
