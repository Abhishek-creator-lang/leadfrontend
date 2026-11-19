export default class EventEmitter {
  /**
   * @param {string} eventName
   * @param {Function} listener
   * @return {{ unsubscribe: () => void }}
   */
  on(eventName, listener) {
    throw 'Not implemented!';
  }

  /**
   * @param {string} eventName
   * @param {Function} listener
   * @return {{ unsubscribe: () => void }}
   */
  once(eventName, listener) {
    throw 'Not implemented!';
  }

  /**
   * @param {string} eventName
   * @param {Function} [listener]
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

  /**
   * @param {string} eventName
   * @return {number}
   */
  listenerCount(eventName) {
    throw 'Not implemented!';
  }
}
