function createNode(value) {
  return { value, prev: null, next: null };
}

export default class LinkedList {
  #head = null;
  #tail = null;
  #size = 0;

  /** @param {*} value @return {number} */
  push(value) {
    const node = createNode(value);
    if (this.#tail === null) {
      this.#head = this.#tail = node;
    } else {
      node.prev = this.#tail;
      this.#tail.next = node;
      this.#tail = node;
    }
    return ++this.#size;
  }

  /** @param {*} value @return {number} */
  unshift(value) {
    const node = createNode(value);
    if (this.#head === null) {
      this.#head = this.#tail = node;
    } else {
      node.next = this.#head;
      this.#head.prev = node;
      this.#head = node;
    }
    return ++this.#size;
  }

  /** @return {*} */
  pop() {
    const node = this.#tail;
    if (node === null) return undefined;
    this.#tail = node.prev;
    if (this.#tail === null) this.#head = null;
    else this.#tail.next = null;
    this.#size--;
    return node.value;
  }

  /** @return {*} */
  shift() {
    const node = this.#head;
    if (node === null) return undefined;
    this.#head = node.next;
    if (this.#head === null) this.#tail = null;
    else this.#head.prev = null;
    this.#size--;
    return node.value;
  }

  #inRange(index) {
    return Number.isInteger(index) && index >= 0 && index < this.#size;
  }

  #nodeAt(index) {
    // Walk from whichever end is closer.
    if (index < this.#size / 2) {
      let node = this.#head;
      for (let i = 0; i < index; i++) node = node.next;
      return node;
    }
    let node = this.#tail;
    for (let i = this.#size - 1; i > index; i--) node = node.prev;
    return node;
  }

  /** @param {number} index @return {*} */
  get(index) {
    return this.#inRange(index) ? this.#nodeAt(index).value : undefined;
  }

  /** @param {number} index @param {*} value @return {boolean} */
  insertAt(index, value) {
    if (!Number.isInteger(index) || index < 0 || index > this.#size) return false;
    if (index === 0) {
      this.unshift(value);
      return true;
    }
    if (index === this.#size) {
      this.push(value);
      return true;
    }
    const after = this.#nodeAt(index);
    const before = after.prev;
    const node = createNode(value);
    node.prev = before;
    node.next = after;
    before.next = node;
    after.prev = node;
    this.#size++;
    return true;
  }

  /** @param {number} index @return {*} */
  removeAt(index) {
    if (!this.#inRange(index)) return undefined;
    if (index === 0) return this.shift();
    if (index === this.#size - 1) return this.pop();
    const node = this.#nodeAt(index);
    node.prev.next = node.next;
    node.next.prev = node.prev;
    this.#size--;
    return node.value;
  }

  /** @return {number} */
  length() {
    return this.#size;
  }

  /** @return {Array} */
  toArray() {
    const out = [];
    for (let node = this.#head; node !== null; node = node.next) out.push(node.value);
    return out;
  }

  /** @return {LinkedList} */
  reverse() {
    let node = this.#head;
    while (node !== null) {
      const next = node.next;
      node.next = node.prev;
      node.prev = next;
      node = next;
    }
    [this.#head, this.#tail] = [this.#tail, this.#head];
    return this;
  }
}
