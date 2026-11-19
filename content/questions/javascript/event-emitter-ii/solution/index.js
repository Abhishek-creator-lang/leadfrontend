export default class EventEmitter {
  constructor() {
    /** @type {Map<string, Array<{ listener: Function, once: boolean, active: boolean }>>} */
    this._events = new Map();
  }

  _add(eventName, listener, once) {
    const registration = { listener, once, active: true };
    let list = this._events.get(eventName);
    if (!list) {
      list = [];
      this._events.set(eventName, list);
    }
    list.push(registration);
    return {
      unsubscribe: () => this._remove(eventName, registration),
    };
  }

  _remove(eventName, registration) {
    if (!registration.active) return;
    registration.active = false;
    const list = this._events.get(eventName);
    if (!list) return;
    const index = list.indexOf(registration);
    if (index !== -1) list.splice(index, 1);
    if (list.length === 0) this._events.delete(eventName);
  }

  /**
   * @param {string} eventName
   * @param {Function} listener
   * @return {{ unsubscribe: () => void }}
   */
  on(eventName, listener) {
    return this._add(eventName, listener, false);
  }

  /**
   * @param {string} eventName
   * @param {Function} listener
   * @return {{ unsubscribe: () => void }}
   */
  once(eventName, listener) {
    return this._add(eventName, listener, true);
  }

  /**
   * @param {string} eventName
   * @param {Function} [listener]
   * @return {EventEmitter}
   */
  off(eventName, listener) {
    const list = this._events.get(eventName);
    if (!list) return this;
    for (const registration of [...list]) {
      if (listener === undefined || registration.listener === listener) {
        this._remove(eventName, registration);
      }
    }
    return this;
  }

  /**
   * @param {string} eventName
   * @param {...any} args
   * @return {boolean}
   */
  emit(eventName, ...args) {
    const list = this._events.get(eventName);
    if (!list) return false;

    let called = false;
    for (const registration of [...list]) {
      // Skip registrations removed earlier in this same emit.
      if (!registration.active) continue;
      // Remove `once` registrations before calling, so re-entrant emits can't call them again.
      if (registration.once) this._remove(eventName, registration);
      called = true;
      registration.listener.apply(this, args);
    }
    return called;
  }

  /**
   * @param {string} eventName
   * @return {number}
   */
  listenerCount(eventName) {
    const list = this._events.get(eventName);
    return list ? list.length : 0;
  }
}
