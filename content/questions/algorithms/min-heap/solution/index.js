export default class MinHeap {
  #heap = [];

  /**
   * @param {(a: *, b: *) => number} [compare] Negative when `a` should come out first.
   */
  constructor(compare = (a, b) => a - b) {
    this.compare = compare;
  }

  /** @param {*} value @return {number} */
  push(value) {
    this.#heap.push(value);
    this.#siftUp(this.#heap.length - 1);
    return this.#heap.length;
  }

  /** @return {*} */
  pop() {
    const heap = this.#heap;
    if (heap.length === 0) return undefined;
    const top = heap[0];
    const last = heap.pop();
    if (heap.length > 0) {
      heap[0] = last;
      this.#siftDown(0);
    }
    return top;
  }

  /** @return {*} */
  peek() {
    return this.#heap[0];
  }

  /** @return {number} */
  size() {
    return this.#heap.length;
  }

  #siftUp(i) {
    const heap = this.#heap;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.compare(heap[i], heap[parent]) >= 0) break;
      [heap[i], heap[parent]] = [heap[parent], heap[i]];
      i = parent;
    }
  }

  #siftDown(i) {
    const heap = this.#heap;
    const n = heap.length;
    while (true) {
      const left = 2 * i + 1;
      const right = left + 1;
      let smallest = i;
      if (left < n && this.compare(heap[left], heap[smallest]) < 0) smallest = left;
      if (right < n && this.compare(heap[right], heap[smallest]) < 0) smallest = right;
      if (smallest === i) return;
      [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
      i = smallest;
    }
  }
}
