import camelCaseKeys from './index';

describe('camelCaseKeys', () => {
  test('converts top-level keys', () => {
    expect(camelCaseKeys({ first_name: 'Ada', last_name: 'L' })).toEqual({
      firstName: 'Ada',
      lastName: 'L',
    });
  });

  test('handles several underscores in one key', () => {
    expect(camelCaseKeys({ a_b_c: 1, one_two_three_four: 2 })).toEqual({ aBC: 1, oneTwoThreeFour: 2 });
  });

  test('collapses runs of underscores', () => {
    expect(camelCaseKeys({ double__under: 1 })).toEqual({ doubleUnder: 1 });
  });

  test('keeps leading and trailing underscores', () => {
    expect(camelCaseKeys({ _private: 1, id_: 2, __meta__: 3 })).toEqual({ _private: 1, id_: 2, __meta__: 3 });
  });

  test('does not change other characters', () => {
    expect(camelCaseKeys({ HTTP_code: 1, already_Camel: 2, plain: 3 })).toEqual({
      HTTPCode: 1,
      alreadyCamel: 2,
      plain: 3,
    });
  });

  test('converts nested objects and arrays', () => {
    const input = {
      user_id: 7,
      recent_orders: [{ order_id: 1, line_items: [{ sku_code: 'X' }] }],
      shipping_address: { postal_code: '123' },
    };
    expect(camelCaseKeys(input)).toEqual({
      userId: 7,
      recentOrders: [{ orderId: 1, lineItems: [{ skuCode: 'X' }] }],
      shippingAddress: { postalCode: '123' },
    });
  });

  test('handles a top-level array', () => {
    expect(camelCaseKeys([{ a_b: 1 }, 2, 'c_d'])).toEqual([{ aB: 1 }, 2, 'c_d']);
  });

  test('returns primitives and null unchanged', () => {
    expect(camelCaseKeys('snake_case')).toBe('snake_case');
    expect(camelCaseKeys(42)).toBe(42);
    expect(camelCaseKeys(null)).toBeNull();
    expect(camelCaseKeys({ some_key: null })).toEqual({ someKey: null });
  });

  test('keeps non-plain objects by reference', () => {
    const date = new Date(0);
    const map = new Map([['a_b', 1]]);
    const result = camelCaseKeys({ created_at: date, lookup_map: map });
    expect(result.createdAt).toBe(date);
    expect(result.lookupMap).toBe(map);
  });

  test('handles objects with a null prototype', () => {
    const obj = Object.create(null);
    obj.some_key = { inner_key: 1 };
    expect(camelCaseKeys(obj)).toEqual({ someKey: { innerKey: 1 } });
  });

  test('does not mutate the input', () => {
    const input = { outer_key: { inner_key: [1, { deep_key: 2 }] } };
    const snapshot = JSON.parse(JSON.stringify(input));
    const result = camelCaseKeys(input);
    expect(input).toEqual(snapshot);
    expect(result).not.toBe(input);
  });
});
