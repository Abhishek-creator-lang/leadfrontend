/**
 * Returns a new array with every element squared. The array is `this`.
 *
 * @return {Array<number>}
 */
export default function square() {
  const length = this.length;
  const result = new Array(length);
  for (let i = 0; i < length; i++) {
    if (i in this) {
      result[i] = this[i] * this[i];
    }
  }
  return result;
}

Array.prototype.square = square;
