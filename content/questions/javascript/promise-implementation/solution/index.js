const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function isObjectLike(value) {
  return value !== null && (typeof value === 'object' || typeof value === 'function');
}

/**
 * A Promises/A+-style promise. Do not use the native Promise.
 */
export default class MyPromise {
  #state = PENDING;
  #value = undefined;
  #handlers = [];

  /**
   * @param {(resolve: (value?: any) => void, reject: (reason?: any) => void) => void} executor
   */
  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('MyPromise resolver is not a function');
    }
    const { resolve, reject } = this.#createResolvingFunctions();
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error); // ignored if resolve/reject was already called
    }
  }

  // A resolve/reject pair where only the first call to either has an effect.
  #createResolvingFunctions() {
    let alreadyResolved = false;
    const resolve = (value) => {
      if (alreadyResolved) return;
      alreadyResolved = true;
      this.#resolveWith(value);
    };
    const reject = (reason) => {
      if (alreadyResolved) return;
      alreadyResolved = true;
      this.#settle(REJECTED, reason);
    };
    return { resolve, reject };
  }

  // The promise resolution procedure: cycle check, thenable adoption, or fulfillment.
  #resolveWith(x) {
    if (x === this) {
      this.#settle(REJECTED, new TypeError('Chaining cycle detected for promise'));
      return;
    }
    if (isObjectLike(x)) {
      let then;
      try {
        then = x.then; // read exactly once
      } catch (error) {
        this.#settle(REJECTED, error);
        return;
      }
      if (typeof then === 'function') {
        queueMicrotask(() => {
          const { resolve, reject } = this.#createResolvingFunctions();
          try {
            then.call(x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
        return;
      }
    }
    this.#settle(FULFILLED, x);
  }

  #settle(state, value) {
    if (this.#state !== PENDING) return;
    this.#state = state;
    this.#value = value;
    const handlers = this.#handlers;
    this.#handlers = [];
    handlers.forEach((handler) => this.#schedule(handler));
  }

  #schedule(handler) {
    queueMicrotask(() => {
      const fulfilled = this.#state === FULFILLED;
      const callback = fulfilled ? handler.onFulfilled : handler.onRejected;

      if (typeof callback !== 'function') {
        // Pass-through: forward the outcome unchanged.
        if (fulfilled) handler.resolve(this.#value);
        else handler.reject(this.#value);
        return;
      }

      try {
        handler.resolve(callback(this.#value));
      } catch (error) {
        handler.reject(error);
      }
    });
  }

  /**
   * @param {(value: any) => any} [onFulfilled]
   * @param {(reason: any) => any} [onRejected]
   * @return {MyPromise}
   */
  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const handler = { onFulfilled, onRejected, resolve, reject };
      if (this.#state === PENDING) {
        this.#handlers.push(handler);
      } else {
        this.#schedule(handler);
      }
    });
  }

  /**
   * @param {(reason: any) => any} [onRejected]
   * @return {MyPromise}
   */
  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  /**
   * @param {() => any} [onFinally]
   * @return {MyPromise}
   */
  finally(onFinally) {
    if (typeof onFinally !== 'function') {
      return this.then(onFinally, onFinally);
    }
    return this.then(
      (value) => MyPromise.resolve(onFinally()).then(() => value),
      (reason) =>
        MyPromise.resolve(onFinally()).then(() => {
          throw reason;
        })
    );
  }

  static resolve(value) {
    if (value instanceof MyPromise) return value;
    return new MyPromise((resolve) => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }
}
