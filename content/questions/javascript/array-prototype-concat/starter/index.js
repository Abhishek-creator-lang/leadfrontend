/**
 * Returns a new array: `this` followed by each item. Concat-spreadable items
 * (arrays, or objects with a truthy Symbol.isConcatSpreadable) are spread one level.
 *
 * @param {...*} items
 * @return {Array}
 */
export default function myConcat(...items) {
  throw 'Not implemented!';
}

Array.prototype.myConcat = myConcat;
