export default class EventEmitter {
  constructor() {
    /** @type {Map<string, Function[]>} */
    this._events = new Map();
  }

  /**
   * @param {string} eventName
   * @param {Function} listener
   * @return {EventEmitter}
   */
  on(eventName, listener) {
    let listeners = this._events.get(eventName);
    if (!listeners) {
      listeners = [];
      this._events.set(eventName, listeners);
    }
    listeners.push(listener);
    return this;
  }

  /**
   * @param {string} eventName
   * @param {Function} listener
   * @return {EventEmitter}
   */
  off(eventName, listener) {
    const listeners = this._events.get(eventName);
    if (!listeners) return this;

    const index = listeners.lastIndexOf(listener);
    if (index !== -1) listeners.splice(index, 1);
    if (listeners.length === 0) this._events.delete(eventName);
    return this;
  }

  /**
   * @param {string} eventName
   * @param {...any} args
   * @return {boolean}
   */
  emit(eventName, ...args) {
    const listeners = this._events.get(eventName);
    if (!listeners || listeners.length === 0) return false;

    // Snapshot so listeners added or removed during this emit don't affect it.
    for (const listener of [...listeners]) {
      listener.apply(this, args);
    }
    return true;
  }
}
