/**
 * Returns a new array with the elements for which `callbackFn` returns truthy.
 *
 * @param {(value: *, index: number, array: Array) => *} callbackFn
 * @param {*} [thisArg]
 * @return {Array}
 */
export default function myFilter(callbackFn, thisArg) {
  throw 'Not implemented!';
}

Array.prototype.myFilter = myFilter;
