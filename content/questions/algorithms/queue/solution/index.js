export default class Queue {
  #head = null;
  #tail = null;
  #size = 0;

  /**
   * Adds an item to the back of the queue.
   * @param {*} item
   * @return {number} The new length.
   */
  enqueue(item) {
    const node = { value: item, next: null };
    if (this.#tail === null) {
      this.#head = node;
    } else {
      this.#tail.next = node;
    }
    this.#tail = node;
    this.#size++;
    return this.#size;
  }

  /**
   * Removes and returns the front item.
   * @return {*} The item, or undefined when empty.
   */
  dequeue() {
    if (this.#head === null) return undefined;
    const { value, next } = this.#head;
    this.#head = next;
    if (next === null) this.#tail = null;
    this.#size--;
    return value;
  }

  /** @return {*} The front item, or undefined. */
  front() {
    return this.#head === null ? undefined : this.#head.value;
  }

  /** @return {*} The back item, or undefined. */
  back() {
    return this.#tail === null ? undefined : this.#tail.value;
  }

  /** @return {boolean} */
  isEmpty() {
    return this.#size === 0;
  }

  /** @return {number} */
  length() {
    return this.#size;
  }
}
