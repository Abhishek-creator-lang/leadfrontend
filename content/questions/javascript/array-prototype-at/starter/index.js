/**
 * Returns the element at `index`. Negative indices count back from the end.
 * Called as `array.myAt(index)`, so the array is `this`.
 *
 * @param {number} index
 * @return {*}
 */
export default function myAt(index) {
  throw 'Not implemented!';
}

Array.prototype.myAt = myAt;
