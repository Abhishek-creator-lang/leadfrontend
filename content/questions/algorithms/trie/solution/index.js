function createNode() {
  return { children: new Map(), isWord: false };
}

export default class Trie {
  #root = createNode();
  #size = 0;

  #find(text) {
    let node = this.#root;
    for (const ch of text) {
      node = node.children.get(ch);
      if (node === undefined) return null;
    }
    return node;
  }

  /** @param {string} word @return {boolean} */
  insert(word) {
    let node = this.#root;
    for (const ch of word) {
      let next = node.children.get(ch);
      if (next === undefined) {
        next = createNode();
        node.children.set(ch, next);
      }
      node = next;
    }
    if (node.isWord) return false;
    node.isWord = true;
    this.#size++;
    return true;
  }

  /** @param {string} word @return {boolean} */
  has(word) {
    const node = this.#find(word);
    return node !== null && node.isWord;
  }

  /** @param {string} prefix @return {boolean} */
  hasPrefix(prefix) {
    const node = this.#find(prefix);
    return node !== null && (node.isWord || node.children.size > 0);
  }

  /** @param {string} prefix @return {string[]} */
  complete(prefix) {
    const start = this.#find(prefix);
    const results = [];
    if (start === null) return results;

    // Iterative DFS; children visited in sorted order so results come out sorted.
    const stack = [[start, prefix]];
    while (stack.length > 0) {
      const [node, text] = stack.pop();
      if (node.isWord) results.push(text);
      const keys = [...node.children.keys()].sort();
      for (let i = keys.length - 1; i >= 0; i--) {
        stack.push([node.children.get(keys[i]), text + keys[i]]);
      }
    }
    return results;
  }

  /** @param {string} word @return {boolean} */
  remove(word) {
    const path = [this.#root];
    const chars = [];
    for (const ch of word) {
      const next = path[path.length - 1].children.get(ch);
      if (next === undefined) return false;
      path.push(next);
      chars.push(ch);
    }
    const last = path[path.length - 1];
    if (!last.isWord) return false;
    last.isWord = false;
    this.#size--;

    // Prune nodes that no longer lead to any word.
    for (let i = path.length - 1; i > 0; i--) {
      const node = path[i];
      if (node.isWord || node.children.size > 0) break;
      path[i - 1].children.delete(chars[i - 1]);
    }
    return true;
  }

  /** @return {number} */
  size() {
    return this.#size;
  }
}
