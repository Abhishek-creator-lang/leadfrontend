import createSignal, { createEffect, createMemo, batch, untrack } from './index';

describe('signals', () => {
  test('createSignal reads and writes, including updater functions', () => {
    const [count, setCount] = createSignal(1);
    expect(count()).toBe(1);
    setCount(5);
    expect(count()).toBe(5);
    setCount((n) => n * 2);
    expect(count()).toBe(10);
  });

  test('effects run immediately and again when a dependency changes', () => {
    const [name, setName] = createSignal('Ada');
    const seen = [];
    createEffect(() => seen.push(name()));
    expect(seen).toEqual(['Ada']);
    setName('Grace');
    expect(seen).toEqual(['Ada', 'Grace']);
  });

  test('writing the same value does not re-run effects', () => {
    const [value, setValue] = createSignal(1);
    const fn = jest.fn(() => value());
    createEffect(fn);
    setValue(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('tracks dependencies dynamically', () => {
    const [useA, setUseA] = createSignal(true);
    const [a, setA] = createSignal('a1');
    const [b, setB] = createSignal('b1');
    const fn = jest.fn(() => (useA() ? a() : b()));
    createEffect(fn);
    setB('b2'); // not read yet
    expect(fn).toHaveBeenCalledTimes(1);
    setUseA(false);
    expect(fn).toHaveBeenCalledTimes(2);
    setA('a2'); // no longer read
    expect(fn).toHaveBeenCalledTimes(2);
    setB('b3');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('effect cleanup runs before each re-run and on dispose; dispose stops updates', () => {
    const [n, setN] = createSignal(0);
    const log = [];
    const dispose = createEffect(() => {
      const value = n();
      log.push(`run ${value}`);
      return () => log.push(`cleanup ${value}`);
    });
    setN(1);
    dispose();
    setN(2);
    expect(log).toEqual(['run 0', 'cleanup 0', 'run 1', 'cleanup 1']);
  });

  test('memos are lazy and cached', () => {
    const [n, setN] = createSignal(2);
    const compute = jest.fn(() => n() * 10);
    const tenTimes = createMemo(compute);
    expect(compute).not.toHaveBeenCalled();
    expect(tenTimes()).toBe(20);
    expect(tenTimes()).toBe(20);
    expect(compute).toHaveBeenCalledTimes(1);
    setN(3);
    expect(tenTimes()).toBe(30);
    expect(compute).toHaveBeenCalledTimes(2);
  });

  test('diamond dependencies: effects run once with consistent values', () => {
    const [a, setA] = createSignal(1);
    const double = createMemo(() => a() * 2);
    const plusOne = createMemo(() => a() + 1);
    const seen = [];
    createEffect(() => seen.push([double(), plusOne()]));
    setA(5);
    expect(seen).toEqual([
      [2, 2],
      [10, 6],
    ]);
  });

  test('a memo whose value does not change does not re-run its dependents', () => {
    const [count, setCount] = createSignal(2);
    const isEven = createMemo(() => count() % 2 === 0);
    const fn = jest.fn(() => isEven());
    createEffect(fn);
    setCount(4);
    setCount(6);
    expect(fn).toHaveBeenCalledTimes(1);
    setCount(7);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('batch defers effects until the end and runs them once', () => {
    const [first, setFirst] = createSignal('Ada');
    const [last, setLast] = createSignal('Lovelace');
    const seen = [];
    createEffect(() => seen.push(`${first()} ${last()}`));
    const result = batch(() => {
      setFirst('Grace');
      setLast('Hopper');
      expect(first()).toBe('Grace');
      return 'done';
    });
    expect(result).toBe('done');
    expect(seen).toEqual(['Ada Lovelace', 'Grace Hopper']);
  });

  test('untrack reads without subscribing', () => {
    const [a, setA] = createSignal(1);
    const [b, setB] = createSignal(1);
    const fn = jest.fn(() => a() + untrack(() => b()));
    createEffect(fn);
    setB(2);
    expect(fn).toHaveBeenCalledTimes(1);
    setA(2);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('effects can write to other signals', () => {
    const [celsius, setCelsius] = createSignal(0);
    const [fahrenheit, setFahrenheit] = createSignal(32);
    createEffect(() => setFahrenheit((celsius() * 9) / 5 + 32));
    const seen = [];
    createEffect(() => seen.push(fahrenheit()));
    setCelsius(100);
    expect(fahrenheit()).toBe(212);
    expect(seen).toEqual([32, 212]);
  });

  test('memos can depend on memos', () => {
    const [price, setPrice] = createSignal(100);
    const withTax = createMemo(() => price() * 1.5);
    const label = createMemo(() => `$${withTax()}`);
    const seen = [];
    createEffect(() => seen.push(label()));
    setPrice(10);
    expect(seen).toEqual(['$150', '$15']);
  });
});
