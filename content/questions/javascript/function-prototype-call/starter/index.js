/**
 * Calls the function (`this`) with the given `this` value and arguments.
 * Do not use call, apply, bind or Reflect.apply.
 *
 * @param {*} thisArg
 * @param {...*} args
 * @return {*}
 */
export default function myCall(thisArg, ...args) {
  throw 'Not implemented!';
}

Function.prototype.myCall = myCall;
