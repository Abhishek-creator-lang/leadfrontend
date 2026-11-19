export default class Stack {
  #items = [];

  /**
   * Adds an item to the top of the stack.
   * @param {*} item
   * @return {number} The new length.
   */
  push(item) {
    this.#items.push(item);
    return this.#items.length;
  }

  /**
   * Removes and returns the top item.
   * @return {*} The item, or undefined when empty.
   */
  pop() {
    return this.#items.pop();
  }

  /**
   * Returns the top item without removing it.
   * @return {*}
   */
  peek() {
    return this.#items[this.#items.length - 1];
  }

  /** @return {boolean} */
  isEmpty() {
    return this.#items.length === 0;
  }

  /** @return {number} */
  length() {
    return this.#items.length;
  }
}
