export default class EventEmitter {
  constructor() {
    // TODO: set up listener storage
  }

  /**
   * @param {string} eventName
   * @param {Function} listener
   * @return {EventEmitter}
   */
  on(eventName, listener) {
    throw 'Not implemented!';
  }

  /**
   * @param {string} eventName
   * @param {Function} listener
   * @return {EventEmitter}
   */
  off(eventName, listener) {
    throw 'Not implemented!';
  }

  /**
   * @param {string} eventName
   * @param {...any} args
   * @return {boolean}
   */
  emit(eventName, ...args) {
    throw 'Not implemented!';
  }
}
