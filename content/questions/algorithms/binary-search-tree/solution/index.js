export default class BinarySearchTree {
  #root = null;
  #size = 0;

  /** @param {number} value @return {boolean} */
  insert(value) {
    const node = { value, left: null, right: null };
    if (this.#root === null) {
      this.#root = node;
      this.#size++;
      return true;
    }
    let current = this.#root;
    while (true) {
      if (value === current.value) return false;
      const side = value < current.value ? 'left' : 'right';
      if (current[side] === null) {
        current[side] = node;
        this.#size++;
        return true;
      }
      current = current[side];
    }
  }

  /** @param {number} value @return {boolean} */
  has(value) {
    let current = this.#root;
    while (current !== null) {
      if (value === current.value) return true;
      current = value < current.value ? current.left : current.right;
    }
    return false;
  }

  /** @param {number} value @return {boolean} */
  remove(value) {
    let parent = null;
    let node = this.#root;
    while (node !== null && node.value !== value) {
      parent = node;
      node = value < node.value ? node.left : node.right;
    }
    if (node === null) return false;

    if (node.left !== null && node.right !== null) {
      // Two children: copy the in-order successor's value here, then delete the successor.
      let succParent = node;
      let succ = node.right;
      while (succ.left !== null) {
        succParent = succ;
        succ = succ.left;
      }
      node.value = succ.value;
      parent = succParent;
      node = succ;
    }

    // Now `node` has at most one child.
    const child = node.left !== null ? node.left : node.right;
    if (parent === null) this.#root = child;
    else if (parent.left === node) parent.left = child;
    else parent.right = child;

    this.#size--;
    return true;
  }

  /** @return {number | undefined} */
  min() {
    if (this.#root === null) return undefined;
    let node = this.#root;
    while (node.left !== null) node = node.left;
    return node.value;
  }

  /** @return {number | undefined} */
  max() {
    if (this.#root === null) return undefined;
    let node = this.#root;
    while (node.right !== null) node = node.right;
    return node.value;
  }

  /** @return {number[]} */
  inOrder() {
    const out = [];
    const stack = [];
    let node = this.#root;
    while (node !== null || stack.length > 0) {
      while (node !== null) {
        stack.push(node);
        node = node.left;
      }
      node = stack.pop();
      out.push(node.value);
      node = node.right;
    }
    return out;
  }

  /** @return {number} */
  size() {
    return this.#size;
  }
}
