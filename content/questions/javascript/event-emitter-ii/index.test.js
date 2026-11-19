import EventEmitter from './index';

describe('EventEmitter II', () => {
  test('on returns a handle whose unsubscribe removes the listener', () => {
    const emitter = new EventEmitter();
    const fn = jest.fn();
    const sub = emitter.on('e', fn);
    emitter.emit('e', 1);
    sub.unsubscribe();
    emitter.emit('e', 2);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(1);
  });

  test('emit returns whether a listener was called', () => {
    const emitter = new EventEmitter();
    expect(emitter.emit('e')).toBe(false);
    emitter.on('e', () => {});
    expect(emitter.emit('e')).toBe(true);
  });

  test('unsubscribe removes only its own registration of a shared function', () => {
    const emitter = new EventEmitter();
    const fn = jest.fn();
    const first = emitter.on('e', fn);
    emitter.on('e', fn);
    first.unsubscribe();
    emitter.emit('e');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(emitter.listenerCount('e')).toBe(1);
  });

  test('unsubscribe is idempotent', () => {
    const emitter = new EventEmitter();
    const fn = jest.fn();
    const a = emitter.on('e', fn);
    emitter.on('e', fn);
    a.unsubscribe();
    a.unsubscribe();
    expect(emitter.listenerCount('e')).toBe(1);
  });

  test('once listeners run a single time', () => {
    const emitter = new EventEmitter();
    const fn = jest.fn();
    emitter.once('e', fn);
    emitter.emit('e', 'a');
    emitter.emit('e', 'b');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a');
    expect(emitter.listenerCount('e')).toBe(0);
  });

  test('a once listener can be unsubscribed before it fires', () => {
    const emitter = new EventEmitter();
    const fn = jest.fn();
    emitter.once('e', fn).unsubscribe();
    expect(emitter.emit('e')).toBe(false);
    expect(fn).not.toHaveBeenCalled();
  });

  test('a once listener that re-emits the same event runs only once', () => {
    const emitter = new EventEmitter();
    const fn = jest.fn(() => emitter.emit('e'));
    emitter.once('e', fn);
    emitter.emit('e');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('off(event, fn) removes every registration of fn, including once', () => {
    const emitter = new EventEmitter();
    const fn = jest.fn();
    const other = jest.fn();
    emitter.on('e', fn);
    emitter.once('e', fn);
    emitter.on('e', other);
    expect(emitter.off('e', fn)).toBe(emitter);
    emitter.emit('e');
    expect(fn).not.toHaveBeenCalled();
    expect(other).toHaveBeenCalledTimes(1);
  });

  test('off(event) removes all listeners of that event only', () => {
    const emitter = new EventEmitter();
    const a = jest.fn();
    const b = jest.fn();
    emitter.on('x', a);
    emitter.on('x', a);
    emitter.on('y', b);
    emitter.off('x');
    expect(emitter.listenerCount('x')).toBe(0);
    emitter.emit('y');
    expect(b).toHaveBeenCalledTimes(1);
  });

  test('listenerCount tracks registrations', () => {
    const emitter = new EventEmitter();
    expect(emitter.listenerCount('e')).toBe(0);
    const s1 = emitter.on('e', () => {});
    emitter.once('e', () => {});
    expect(emitter.listenerCount('e')).toBe(2);
    s1.unsubscribe();
    expect(emitter.listenerCount('e')).toBe(1);
  });

  test('a listener removed during emit is not called later in that emit', () => {
    const emitter = new EventEmitter();
    const second = jest.fn();
    let secondSub;
    emitter.on('e', () => secondSub.unsubscribe());
    secondSub = emitter.on('e', second);
    emitter.emit('e');
    expect(second).not.toHaveBeenCalled();
  });

  test('a listener added during emit waits for the next emit', () => {
    const emitter = new EventEmitter();
    const late = jest.fn();
    emitter.once('e', () => emitter.on('e', late));
    emitter.emit('e');
    expect(late).not.toHaveBeenCalled();
    emitter.emit('e');
    expect(late).toHaveBeenCalledTimes(1);
  });

  test('listeners receive arguments and the emitter as `this`', () => {
    const emitter = new EventEmitter();
    let ctx;
    const fn = jest.fn(function () {
      ctx = this;
    });
    emitter.on('e', fn);
    emitter.emit('e', 1, 2);
    expect(fn).toHaveBeenCalledWith(1, 2);
    expect(ctx).toBe(emitter);
  });

  test('works with event names from Object.prototype', () => {
    const emitter = new EventEmitter();
    expect(emitter.listenerCount('hasOwnProperty')).toBe(0);
    expect(emitter.emit('toString')).toBe(false);
  });
});
