export default class MinHeap {
  /**
   * @param {(a: *, b: *) => number} [compare] Negative when `a` should come out first.
   */
  constructor(compare = (a, b) => a - b) {
    this.compare = compare;
  }

  /** @param {*} value @return {number} */
  push(value) {
    throw 'Not implemented!';
  }

  /** @return {*} */
  pop() {
    throw 'Not implemented!';
  }

  /** @return {*} */
  peek() {
    throw 'Not implemented!';
  }

  /** @return {number} */
  size() {
    throw 'Not implemented!';
  }
}
