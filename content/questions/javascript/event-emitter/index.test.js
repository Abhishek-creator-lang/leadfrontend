import EventEmitter from './index';

describe('EventEmitter', () => {
  test('calls a listener with the emitted arguments', () => {
    const emitter = new EventEmitter();
    const fn = jest.fn();
    emitter.on('data', fn);
    emitter.emit('data', 1, 'two', { three: 3 });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(1, 'two', { three: 3 });
  });

  test('emit returns whether there were listeners', () => {
    const emitter = new EventEmitter();
    expect(emitter.emit('nothing')).toBe(false);
    emitter.on('something', () => {});
    expect(emitter.emit('something')).toBe(true);
  });

  test('calls listeners in registration order', () => {
    const emitter = new EventEmitter();
    const order = [];
    emitter.on('e', () => order.push(1));
    emitter.on('e', () => order.push(2));
    emitter.on('e', () => order.push(3));
    emitter.emit('e');
    expect(order).toEqual([1, 2, 3]);
  });

  test('on and off are chainable', () => {
    const emitter = new EventEmitter();
    const fn = jest.fn();
    expect(emitter.on('a', fn)).toBe(emitter);
    expect(emitter.off('a', fn)).toBe(emitter);
  });

  test('off removes the listener', () => {
    const emitter = new EventEmitter();
    const fn = jest.fn();
    emitter.on('a', fn).off('a', fn);
    expect(emitter.emit('a')).toBe(false);
    expect(fn).not.toHaveBeenCalled();
  });

  test('events are independent', () => {
    const emitter = new EventEmitter();
    const a = jest.fn();
    const b = jest.fn();
    emitter.on('a', a).on('b', b);
    emitter.emit('a');
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).not.toHaveBeenCalled();
  });

  test('a listener registered twice runs twice, and off removes one registration', () => {
    const emitter = new EventEmitter();
    const fn = jest.fn();
    emitter.on('x', fn).on('x', fn);
    emitter.emit('x');
    expect(fn).toHaveBeenCalledTimes(2);
    emitter.off('x', fn);
    emitter.emit('x');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('off for unknown events or listeners is a no-op', () => {
    const emitter = new EventEmitter();
    const fn = jest.fn();
    emitter.on('x', fn);
    expect(() => emitter.off('missing', fn)).not.toThrow();
    emitter.off('x', () => {});
    emitter.emit('x');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('listeners are called with the emitter as `this`', () => {
    const emitter = new EventEmitter();
    let seen;
    emitter.on('e', function () {
      seen = this;
    });
    emitter.emit('e');
    expect(seen).toBe(emitter);
  });

  test('a listener removing itself during emit does not skip the next one', () => {
    const emitter = new EventEmitter();
    const second = jest.fn();
    function first() {
      emitter.off('e', first);
    }
    emitter.on('e', first).on('e', second);
    emitter.emit('e');
    expect(second).toHaveBeenCalledTimes(1);
  });

  test('a listener added during emit is not called by that emit', () => {
    const emitter = new EventEmitter();
    const late = jest.fn();
    emitter.on('e', () => emitter.on('e', late));
    emitter.emit('e');
    expect(late).not.toHaveBeenCalled();
    emitter.emit('e');
    expect(late).toHaveBeenCalledTimes(1);
  });

  test('event names that exist on Object.prototype work', () => {
    const emitter = new EventEmitter();
    expect(emitter.emit('toString')).toBe(false);
    const fn = jest.fn();
    emitter.on('constructor', fn);
    emitter.emit('constructor', 'ok');
    expect(fn).toHaveBeenCalledWith('ok');
  });

  test('emitters do not share listeners', () => {
    const a = new EventEmitter();
    const b = new EventEmitter();
    const fn = jest.fn();
    a.on('e', fn);
    expect(b.emit('e')).toBe(false);
    expect(fn).not.toHaveBeenCalled();
  });
});
