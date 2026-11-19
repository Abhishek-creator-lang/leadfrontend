export default class Queue {
  /**
   * Adds an item to the back of the queue.
   * @param {*} item
   * @return {number} The new length.
   */
  enqueue(item) {
    throw 'Not implemented!';
  }

  /**
   * Removes and returns the front item.
   * @return {*} The item, or undefined when empty.
   */
  dequeue() {
    throw 'Not implemented!';
  }

  /** @return {*} The front item, or undefined. */
  front() {
    throw 'Not implemented!';
  }

  /** @return {*} The back item, or undefined. */
  back() {
    throw 'Not implemented!';
  }

  /** @return {boolean} */
  isEmpty() {
    throw 'Not implemented!';
  }

  /** @return {number} */
  length() {
    throw 'Not implemented!';
  }
}
