import once from './index';

describe('once', () => {
  test('calls func on the first call and returns its result', () => {
    const fn = jest.fn((a, b) => a + b);
    const onced = once(fn);
    expect(onced(2, 3)).toBe(5);
    expect(fn).toHaveBeenCalledWith(2, 3);
  });

  test('does not call func again', () => {
    const fn = jest.fn(() => 1);
    const onced = once(fn);
    onced();
    onced();
    onced();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('later calls return the first result and ignore new arguments', () => {
    const onced = once((x) => x * 10);
    expect(onced(1)).toBe(10);
    expect(onced(5)).toBe(10);
  });

  test('caches an undefined result without calling again', () => {
    const fn = jest.fn(() => undefined);
    const onced = once(fn);
    expect(onced()).toBeUndefined();
    expect(onced()).toBeUndefined();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('caches falsy results', () => {
    const fn = jest.fn(() => 0);
    const onced = once(fn);
    onced();
    expect(onced()).toBe(0);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('forwards `this`', () => {
    const obj = {
      name: 'svc',
      start: once(function () {
        return `${this.name} started`;
      }),
    };
    expect(obj.start()).toBe('svc started');
  });

  test('a throwing call does not count, so the next call retries', () => {
    let attempts = 0;
    const onced = once(() => {
      attempts++;
      if (attempts === 1) throw new Error('boom');
      return 'ok';
    });
    expect(() => onced()).toThrow('boom');
    expect(onced()).toBe('ok');
    expect(onced()).toBe('ok');
    expect(attempts).toBe(2);
  });

  test('wrappers are independent', () => {
    const fn = jest.fn((x) => x);
    const a = once(fn);
    const b = once(fn);
    expect(a('a')).toBe('a');
    expect(b('b')).toBe('b');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
