/**
 * @typedef {{ next?: (value: any) => void, error?: (err: any) => void, complete?: () => void }} Observer
 * @typedef {{ unsubscribe: () => void, readonly closed: boolean }} Subscription
 */

class Subscriber {
  constructor(observer) {
    this._observer = observer;
    this._teardown = null;
    this.closed = false;
  }

  next(value) {
    if (this.closed) return;
    if (this._observer.next) this._observer.next(value);
  }

  error(err) {
    if (this.closed) return;
    this.closed = true;
    try {
      if (this._observer.error) this._observer.error(err);
    } finally {
      this._runTeardown();
    }
  }

  complete() {
    if (this.closed) return;
    this.closed = true;
    try {
      if (this._observer.complete) this._observer.complete();
    } finally {
      this._runTeardown();
    }
  }

  unsubscribe() {
    if (this.closed) return;
    this.closed = true;
    this._runTeardown();
  }

  setTeardown(teardown) {
    if (typeof teardown !== 'function') return;
    if (this.closed) {
      // Completed synchronously before the producer returned its teardown.
      teardown();
    } else {
      this._teardown = teardown;
    }
  }

  _runTeardown() {
    const teardown = this._teardown;
    this._teardown = null;
    if (teardown) teardown();
  }
}

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
    const observer =
      typeof observerOrNext === 'function' ? { next: observerOrNext } : observerOrNext || {};
    const subscriber = new Subscriber(observer);

    // Expose only the three observer methods to the producer.
    const safeObserver = {
      next: (value) => subscriber.next(value),
      error: (err) => subscriber.error(err),
      complete: () => subscriber.complete(),
    };

    try {
      subscriber.setTeardown(this._subscribeFn(safeObserver));
    } catch (err) {
      subscriber.error(err);
    }

    return {
      unsubscribe: () => subscriber.unsubscribe(),
      get closed() {
        return subscriber.closed;
      },
    };
  }

  /**
   * @param {...(source: Observable) => Observable} operators
   * @return {Observable}
   */
  pipe(...operators) {
    return operators.reduce((source, operator) => operator(source), this);
  }

  /** @return {Observable} */
  static of(...values) {
    return Observable.from(values);
  }

  /** @return {Observable} */
  static from(iterable) {
    return new Observable((observer) => {
      for (const value of iterable) observer.next(value);
      observer.complete();
    });
  }
}

/**
 * @param {(value: any, index: number) => any} fn
 * @return {(source: Observable) => Observable}
 */
export function map(fn) {
  return (source) =>
    new Observable((observer) => {
      let index = 0;
      const inner = source.subscribe({
        next(value) {
          let result;
          try {
            result = fn(value, index++);
          } catch (err) {
            observer.error(err);
            return;
          }
          observer.next(result);
        },
        error: (err) => observer.error(err),
        complete: () => observer.complete(),
      });
      return () => inner.unsubscribe();
    });
}

/**
 * @param {(value: any, index: number) => boolean} predicate
 * @return {(source: Observable) => Observable}
 */
export function filter(predicate) {
  return (source) =>
    new Observable((observer) => {
      let index = 0;
      const inner = source.subscribe({
        next(value) {
          let keep;
          try {
            keep = predicate(value, index++);
          } catch (err) {
            observer.error(err);
            return;
          }
          if (keep) observer.next(value);
        },
        error: (err) => observer.error(err),
        complete: () => observer.complete(),
      });
      return () => inner.unsubscribe();
    });
}
