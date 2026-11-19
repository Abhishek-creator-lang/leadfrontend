/**
 * A Promises/A+-style promise. Do not use the native Promise.
 */
export default class MyPromise {
  /**
   * @param {(resolve: (value?: any) => void, reject: (reason?: any) => void) => void} executor
   */
  constructor(executor) {
    throw 'Not implemented!';
  }

  /**
   * @param {(value: any) => any} [onFulfilled]
   * @param {(reason: any) => any} [onRejected]
   * @return {MyPromise}
   */
  then(onFulfilled, onRejected) {
    throw 'Not implemented!';
  }

  /**
   * @param {(reason: any) => any} [onRejected]
   * @return {MyPromise}
   */
  catch(onRejected) {
    throw 'Not implemented!';
  }

  /**
   * @param {() => any} [onFinally]
   * @return {MyPromise}
   */
  finally(onFinally) {
    throw 'Not implemented!';
  }

  static resolve(value) {
    throw 'Not implemented!';
  }

  static reject(reason) {
    throw 'Not implemented!';
  }
}
