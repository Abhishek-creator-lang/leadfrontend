const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

export default class Model {
  /**
   * @param {Record<string, any>} [attributes]
   */
  constructor(attributes = {}) {
    const defaults = typeof this.defaults === 'function' ? this.defaults() : {};
    this._attributes = Object.assign({}, defaults, attributes);
    this._previous = { ...this._attributes };
    this._events = new Map();
    this.changed = {};
  }

  /** @param {string} key */
  get(key) {
    return this._attributes[key];
  }

  /** @param {string} key */
  has(key) {
    const value = this._attributes[key];
    return value !== null && value !== undefined;
  }

  /**
   * set(key, value, options?) or set(attrs, options?)
   * @return {Model}
   */
  set(key, value, options) {
    let attrs;
    let opts;
    if (key !== null && typeof key === 'object') {
      attrs = key;
      opts = value || {};
    } else {
      attrs = { [key]: value };
      opts = options || {};
    }

    const changes = Object.keys(attrs).filter((k) => !Object.is(this._attributes[k], attrs[k]));
    if (changes.length === 0) return this;

    // Snapshot before mutating, then apply every change before notifying anyone.
    this._previous = { ...this._attributes };
    this.changed = {};
    for (const k of changes) {
      this._attributes[k] = attrs[k];
      this.changed[k] = attrs[k];
    }

    if (!opts.silent) {
      for (const k of changes) this._trigger(`change:${k}`, this, this._attributes[k]);
      this._trigger('change', this);
    }
    return this;
  }

  /**
   * @param {string} key
   * @param {{ silent?: boolean }} [options]
   * @return {Model}
   */
  unset(key, options = {}) {
    if (!hasOwn(this._attributes, key)) return this;

    this._previous = { ...this._attributes };
    delete this._attributes[key];
    this.changed = { [key]: undefined };

    if (!options.silent) {
      this._trigger(`change:${key}`, this, undefined);
      this._trigger('change', this);
    }
    return this;
  }

  /** @param {string} key */
  previous(key) {
    return this._previous[key];
  }

  /** @return {Record<string, any>} */
  toJSON() {
    return { ...this._attributes };
  }

  /**
   * @param {string} event
   * @param {Function} callback
   */
  on(event, callback) {
    if (!this._events.has(event)) this._events.set(event, []);
    this._events.get(event).push(callback);
    return this;
  }

  /**
   * @param {string} event
   * @param {Function} [callback]
   */
  off(event, callback) {
    if (callback === undefined) {
      this._events.delete(event);
      return this;
    }
    const list = this._events.get(event);
    if (list) {
      const index = list.lastIndexOf(callback);
      if (index !== -1) list.splice(index, 1);
    }
    return this;
  }

  _trigger(event, ...args) {
    const list = this._events.get(event);
    if (!list) return;
    for (const callback of [...list]) callback(...args);
  }
}
