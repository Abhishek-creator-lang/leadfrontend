/**
 * @typedef {{ next?: (value: any) => void, error?: (err: any) => void, complete?: () => void }} Observer
 * @typedef {{ unsubscribe: () => void, readonly closed: boolean }} Subscription
 */

export default class Observable {
  /**
   * @param {(observer: Required<Observer>) => (void | (() => void))} subscribeFn
   */
  constructor(subscribeFn) {
    this._subscribeFn = subscribeFn;
  }

  /**
   * @param {Observer | ((value: any) => void)} [observerOrNext]
   * @return {Subscription}
   */
  subscribe(observerOrNext) {
    throw 'Not implemented!';
  }

  /**
   * @param {...(source: Observable) => Observable} operators
   * @return {Observable}
   */
  pipe(...operators) {
    throw 'Not implemented!';
  }

  /** @return {Observable} */
  static of(...values) {
    throw 'Not implemented!';
  }

  /** @return {Observable} */
  static from(iterable) {
    throw 'Not implemented!';
  }
}

/**
 * @param {(value: any, index: number) => any} fn
 * @return {(source: Observable) => Observable}
 */
export function map(fn) {
  throw 'Not implemented!';
}

/**
 * @param {(value: any, index: number) => boolean} predicate
 * @return {(source: Observable) => Observable}
 */
export function filter(predicate) {
  throw 'Not implemented!';
}
