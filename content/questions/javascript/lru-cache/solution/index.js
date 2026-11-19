export default class LRUCache {
  /**
   * @param {number} capacity
   * @param {{ onEvict?: (key: any, value: any) => void }} [options]
   */
  constructor(capacity, options = {}) {
    this.capacity = capacity;
    this.onEvict = options.onEvict;
    // Map iterates in insertion order: first key = least recently used.
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key);
    // Re-insert to move the key to the most-recent end.
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.capacity) {
      const oldestKey = this.map.keys().next().value;
      const oldestValue = this.map.get(oldestKey);
      this.map.delete(oldestKey);
      if (this.onEvict) this.onEvict(oldestKey, oldestValue);
    }
    this.map.set(key, value);
    return this;
  }

  has(key) {
    return this.map.has(key);
  }

  peek(key) {
    return this.map.get(key);
  }

  delete(key) {
    return this.map.delete(key);
  }

  get size() {
    return this.map.size;
  }

  /** @return {any[]} keys from least to most recently used */
  keys() {
    return Array.from(this.map.keys());
  }
}
