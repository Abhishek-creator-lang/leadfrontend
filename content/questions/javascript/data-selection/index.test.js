import selectData from './index';

const orders = [
  { id: 1, customer: 'ada', status: 'paid', total: 40 },
  { id: 2, customer: 'bob', status: 'refunded', total: 15 },
  { id: 3, customer: 'ada', status: 'paid', total: 90 },
  { id: 4, customer: 'cy', status: 'pending', total: 40 },
  { id: 5, customer: 'bob', status: 'paid', total: null },
];

const ids = (rows) => rows.map((r) => r.id);

describe('selectData', () => {
  test('with no options returns a shallow copy', () => {
    const result = selectData(orders);
    expect(result).toEqual(orders);
    expect(result).not.toBe(orders);
    expect(result[0]).toBe(orders[0]);
  });

  test('where: equality', () => {
    expect(ids(selectData(orders, { where: { customer: 'ada' } }))).toEqual([1, 3]);
  });

  test('where: array means "one of"', () => {
    expect(ids(selectData(orders, { where: { status: ['pending', 'refunded'] } }))).toEqual([2, 4]);
  });

  test('where: function predicate receives the field value', () => {
    expect(ids(selectData(orders, { where: { total: (t) => t > 30 } }))).toEqual([1, 3, 4]);
  });

  test('where: all conditions must match', () => {
    expect(ids(selectData(orders, { where: { customer: 'bob', status: 'paid' } }))).toEqual([5]);
  });

  test('orderBy ascending and descending', () => {
    expect(ids(selectData(orders, { orderBy: 'customer' }))).toEqual([1, 3, 2, 5, 4]);
    expect(ids(selectData(orders, { orderBy: '-id' }))).toEqual([5, 4, 3, 2, 1]);
  });

  test('orderBy multiple keys breaks ties in order', () => {
    expect(ids(selectData(orders, { orderBy: ['-total', '-id'] }))).toEqual([3, 4, 1, 2, 5]);
  });

  test('null and undefined sort last in both directions', () => {
    const rows = [{ id: 'a', v: 2 }, { id: 'b' }, { id: 'c', v: null }, { id: 'd', v: 1 }];
    expect(ids(selectData(rows, { orderBy: 'v' }))).toEqual(['d', 'a', 'b', 'c']);
    expect(ids(selectData(rows, { orderBy: '-v' }))).toEqual(['a', 'd', 'b', 'c']);
  });

  test('sorting is stable', () => {
    const rows = Array.from({ length: 20 }, (_, i) => ({ id: i, group: i % 3 }));
    const result = selectData(rows, { orderBy: 'group' });
    const group0 = result.filter((r) => r.group === 0).map((r) => r.id);
    expect(group0).toEqual([0, 3, 6, 9, 12, 15, 18]);
  });

  test('offset and limit apply after sorting', () => {
    expect(ids(selectData(orders, { orderBy: 'id', offset: 1, limit: 2 }))).toEqual([2, 3]);
    expect(ids(selectData(orders, { orderBy: '-id', limit: 2 }))).toEqual([5, 4]);
  });

  test('limit 0 and large offsets return []', () => {
    expect(selectData(orders, { limit: 0 })).toEqual([]);
    expect(selectData(orders, { offset: 99 })).toEqual([]);
  });

  test('select projects fields into new objects and omits missing fields', () => {
    const result = selectData([{ id: 1, a: 'x', b: 'y' }, { id: 2 }], { select: ['id', 'a'] });
    expect(result).toEqual([{ id: 1, a: 'x' }, { id: 2 }]);
    expect(Object.keys(result[1])).toEqual(['id']);
  });

  test('runs the full pipeline from the example', () => {
    expect(
      selectData(orders, {
        where: { status: ['paid', 'pending'], total: (t) => t >= 40 },
        orderBy: ['-total', 'id'],
        limit: 2,
        select: ['id', 'total'],
      })
    ).toEqual([
      { id: 3, total: 90 },
      { id: 1, total: 40 },
    ]);
  });

  test('does not mutate the input', () => {
    const rows = [{ id: 2 }, { id: 1 }];
    const snapshot = JSON.stringify(rows);
    selectData(rows, { orderBy: 'id', select: ['id'] });
    expect(JSON.stringify(rows)).toBe(snapshot);
  });
});
