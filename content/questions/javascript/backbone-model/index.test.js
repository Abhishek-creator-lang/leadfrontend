import Model from './index';

class Todo extends Model {
  defaults() {
    return { title: '', done: false, tags: [] };
  }
}

describe('Model', () => {
  test('constructor applies attributes and get/has read them', () => {
    const m = new Model({ a: 1, b: null });
    expect(m.get('a')).toBe(1);
    expect(m.has('a')).toBe(true);
    expect(m.has('b')).toBe(false);
    expect(m.has('missing')).toBe(false);
  });

  test('defaults are merged under the given attributes, per instance', () => {
    const a = new Todo({ title: 'x' });
    const b = new Todo();
    expect(a.toJSON()).toEqual({ title: 'x', done: false, tags: [] });
    a.get('tags').push('shared?');
    expect(b.get('tags')).toEqual([]);
  });

  test('set(key, value) updates and returns this', () => {
    const m = new Todo();
    expect(m.set('done', true)).toBe(m);
    expect(m.get('done')).toBe(true);
  });

  test('fires change:attr then change, with the right arguments', () => {
    const m = new Todo();
    const log = [];
    m.on('change:done', (model, value) => log.push(['change:done', model === m, value]));
    m.on('change', (model) => log.push(['change', model === m]));
    m.set('done', true);
    expect(log).toEqual([
      ['change:done', true, true],
      ['change', true],
    ]);
  });

  test('set(object) fires one change:attr per changed key and a single change', () => {
    const m = new Todo();
    const log = [];
    m.on('change:title', () => log.push('title'));
    m.on('change:done', () => log.push('done'));
    m.on('change', () => log.push('change'));
    m.set({ title: 'a', done: false, extra: 1 });
    expect(log).toEqual(['title', 'change']);
    expect(m.changed).toEqual({ title: 'a', extra: 1 });
  });

  test('listeners see the fully applied state', () => {
    const m = new Model({ first: 'Ada', last: 'Lovelace' });
    let seen;
    m.on('change:first', (model) => {
      seen = `${model.get('first')} ${model.get('last')}`;
    });
    m.set({ first: 'Grace', last: 'Hopper' });
    expect(seen).toBe('Grace Hopper');
  });

  test('setting the same value fires nothing (Object.is, so NaN is stable)', () => {
    const m = new Model({ n: NaN, s: 'x' });
    const spy = jest.fn();
    m.on('change', spy);
    m.set({ n: NaN, s: 'x' });
    expect(spy).not.toHaveBeenCalled();
  });

  test('previous and changed reflect the last real change only', () => {
    const m = new Model({ count: 1 });
    expect(m.changed).toEqual({});
    m.set('count', 2);
    m.set('count', 2); // no-op must not reset previous
    expect(m.previous('count')).toBe(1);
    expect(m.changed).toEqual({ count: 2 });
    m.set('count', 5);
    expect(m.previous('count')).toBe(2);
  });

  test('silent sets update state without events', () => {
    const m = new Model({ a: 1 });
    const spy = jest.fn();
    m.on('change', spy);
    m.on('change:a', spy);
    m.set('a', 2, { silent: true });
    m.set({ a: 3 }, { silent: true });
    expect(spy).not.toHaveBeenCalled();
    expect(m.get('a')).toBe(3);
    expect(m.previous('a')).toBe(2);
  });

  test('unset removes the attribute and fires events', () => {
    const m = new Model({ a: 1, b: 2 });
    const log = [];
    m.on('change:a', (model, value) => log.push(['a', value]));
    m.on('change', () => log.push(['change']));
    m.unset('a');
    expect(log).toEqual([['a', undefined], ['change']]);
    expect(m.toJSON()).toEqual({ b: 2 });
    expect(m.previous('a')).toBe(1);
    m.unset('missing');
    expect(log).toHaveLength(2);
  });

  test('toJSON returns a copy', () => {
    const m = new Model({ a: 1 });
    const json = m.toJSON();
    json.a = 99;
    expect(m.get('a')).toBe(1);
  });

  test('off removes a callback, or all callbacks for an event', () => {
    const m = new Model();
    const a = jest.fn();
    const b = jest.fn();
    m.on('change', a).on('change', b);
    m.off('change', a);
    m.set('x', 1);
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
    m.off('change');
    m.set('x', 2);
    expect(b).toHaveBeenCalledTimes(1);
  });
});
