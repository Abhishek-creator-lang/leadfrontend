export default class Model {
  /**
   * @param {Record<string, any>} [attributes]
   */
  constructor(attributes = {}) {
    this.changed = {};
    // TODO: apply defaults() (if a subclass defines it) and `attributes`
  }

  /** @param {string} key */
  get(key) {
    throw 'Not implemented!';
  }

  /** @param {string} key */
  has(key) {
    throw 'Not implemented!';
  }

  /**
   * set(key, value, options?) or set(attrs, options?)
   * @return {Model}
   */
  set(key, value, options) {
    throw 'Not implemented!';
  }

  /**
   * @param {string} key
   * @param {{ silent?: boolean }} [options]
   * @return {Model}
   */
  unset(key, options) {
    throw 'Not implemented!';
  }

  /** @param {string} key */
  previous(key) {
    throw 'Not implemented!';
  }

  /** @return {Record<string, any>} */
  toJSON() {
    throw 'Not implemented!';
  }

  /**
   * @param {string} event
   * @param {Function} callback
   */
  on(event, callback) {
    throw 'Not implemented!';
  }

  /**
   * @param {string} event
   * @param {Function} [callback]
   */
  off(event, callback) {
    throw 'Not implemented!';
  }
}
