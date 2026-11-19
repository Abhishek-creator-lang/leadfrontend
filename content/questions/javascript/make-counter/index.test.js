import makeCounter from './index';

describe('makeCounter', () => {
  test('starts at 0 and counts up by 1 by default', () => {
    const counter = makeCounter();
    expect(counter()).toBe(0);
    expect(counter()).toBe(1);
    expect(counter()).toBe(2);
  });

  test('starts at the given initial value', () => {
    const counter = makeCounter(5);
    expect(counter()).toBe(5);
    expect(counter()).toBe(6);
  });

  test('uses a custom step', () => {
    const counter = makeCounter(0, 10);
    expect(counter()).toBe(0);
    expect(counter()).toBe(10);
    expect(counter()).toBe(20);
  });

  test('supports negative steps', () => {
    const countdown = makeCounter(10, -5);
    expect([countdown(), countdown(), countdown()]).toEqual([10, 5, 0]);
  });

  test('counters are independent', () => {
    const a = makeCounter();
    const b = makeCounter(100);
    a();
    a();
    expect(b()).toBe(100);
    expect(a()).toBe(2);
    expect(b()).toBe(101);
  });

  test('reset() returns the counter to its initial value', () => {
    const counter = makeCounter(3);
    counter();
    counter();
    counter.reset();
    expect(counter()).toBe(3);
    expect(counter()).toBe(4);
  });

  test('reset() only affects its own counter', () => {
    const a = makeCounter();
    const b = makeCounter();
    a();
    b();
    a.reset();
    expect(a()).toBe(0);
    expect(b()).toBe(1);
  });

  test('state is private', () => {
    const counter = makeCounter();
    counter();
    const keys = Object.keys(counter).filter((k) => k !== 'reset');
    expect(keys).toEqual([]);
  });
});
