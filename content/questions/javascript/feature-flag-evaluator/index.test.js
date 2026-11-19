import evaluateFlag, { bucket } from './index';

const users = (n) => Array.from({ length: n }, (_, i) => `user-${i}`);

describe('bucket', () => {
  test('returns an integer in [0, 100)', () => {
    for (const id of users(500)) {
      const b = bucket('flag', id);
      expect(Number.isInteger(b)).toBe(true);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThan(100);
    }
  });

  test('is deterministic', () => {
    expect(bucket('checkout', 'user-42')).toBe(bucket('checkout', 'user-42'));
  });

  test('matches the FNV-1a reference values', () => {
    // FNV-1a 32-bit("a:b") = 0x08bd8540 -> 146638144 % 100 = 44
    // FNV-1a 32-bit("flag:hello") = 0x9a24bdad -> 2586099117 % 100 = 17
    expect(bucket('a', 'b')).toBe(0x08bd8540 % 100);
    expect(bucket('a', 'b')).toBe(44);
    expect(bucket('flag', 'hello')).toBe(17);
  });

  test('spreads users roughly uniformly', () => {
    const counts = new Array(10).fill(0);
    for (const id of users(10000)) counts[Math.floor(bucket('dist', id) / 10)] += 1;
    for (const c of counts) {
      expect(c).toBeGreaterThan(850);
      expect(c).toBeLessThan(1150);
    }
  });

  test('different flags bucket users independently', () => {
    const ids = users(200);
    const same = ids.filter((id) => bucket('flag-a', id) === bucket('flag-b', id)).length;
    expect(same).toBeLessThan(20);
  });
});

describe('evaluateFlag', () => {
  test('disabled flags return offValue (default false), ignoring rules', () => {
    const rules = [{ conditions: [{ attribute: 'plan', operator: 'eq', value: 'pro' }], value: true }];
    expect(evaluateFlag({ key: 'f', enabled: false, rules }, { plan: 'pro' })).toBe(false);
    expect(evaluateFlag({ key: 'f', enabled: false, offValue: 'off' }, {})).toBe('off');
  });

  test('returns defaultValue (default false) when nothing matches', () => {
    expect(evaluateFlag({ key: 'f', enabled: true }, {})).toBe(false);
    expect(evaluateFlag({ key: 'f', enabled: true, defaultValue: 'control' }, {})).toBe('control');
  });

  test('the first matching rule wins; all conditions must match', () => {
    const flag = {
      key: 'theme',
      enabled: true,
      defaultValue: 'light',
      rules: [
        {
          conditions: [
            { attribute: 'country', operator: 'in', value: ['IN', 'US'] },
            { attribute: 'age', operator: 'gte', value: 18 },
          ],
          value: 'dark',
        },
        { conditions: [{ attribute: 'email', operator: 'contains', value: '@corp.com' }], value: 'beta' },
      ],
    };
    expect(evaluateFlag(flag, { country: 'IN', age: 30, email: 'a@corp.com' })).toBe('dark');
    expect(evaluateFlag(flag, { country: 'IN', age: 12, email: 'a@corp.com' })).toBe('beta');
    expect(evaluateFlag(flag, { country: 'FR', age: 30 })).toBe('light');
  });

  test('supports every operator', () => {
    const check = (operator, value, actual) =>
      evaluateFlag(
        { key: 'op', enabled: true, rules: [{ conditions: [{ attribute: 'x', operator, value }], value: true }] },
        { x: actual }
      );
    expect(check('eq', 'a', 'a')).toBe(true);
    expect(check('neq', 'a', 'b')).toBe(true);
    expect(check('in', [1, 2], 2)).toBe(true);
    expect(check('notIn', [1, 2], 3)).toBe(true);
    expect(check('gt', 5, 6)).toBe(true);
    expect(check('gte', 5, 5)).toBe(true);
    expect(check('lt', 5, 4)).toBe(true);
    expect(check('lte', 5, 5)).toBe(true);
    expect(check('contains', 'beta', 'v2-beta')).toBe(true);
    expect(check('gt', 5, 5)).toBe(false);
    expect(check('contains', 'x', 42)).toBe(false);
  });

  test('missing attributes never match, even for negative operators', () => {
    const flag = {
      key: 'f',
      enabled: true,
      rules: [{ conditions: [{ attribute: 'country', operator: 'neq', value: 'US' }], value: true }],
    };
    expect(evaluateFlag(flag, {})).toBe(false);
    expect(evaluateFlag(flag, { country: 'IN' })).toBe(true);
  });

  test('unknown operators throw', () => {
    const flag = { key: 'f', enabled: true, rules: [{ conditions: [{ attribute: 'a', operator: 'regex', value: '.' }], value: 1 }] };
    expect(() => evaluateFlag(flag, { a: 'x' })).toThrow(/regex/);
  });

  test('percentage rollout is stable per user and close to the target', () => {
    const flag = { key: 'new-checkout', enabled: true, rollout: { percentage: 30, value: true } };
    const ids = users(5000);
    const enabled = ids.filter((userId) => evaluateFlag(flag, { userId }));
    expect(enabled.length / ids.length).toBeGreaterThan(0.27);
    expect(enabled.length / ids.length).toBeLessThan(0.33);
    for (const userId of ids.slice(0, 50)) {
      expect(evaluateFlag(flag, { userId })).toBe(evaluateFlag(flag, { userId }));
    }
  });

  test('increasing the percentage only adds users', () => {
    const ids = users(2000);
    const at = (percentage) =>
      new Set(ids.filter((userId) => evaluateFlag({ key: 'ramp', enabled: true, rollout: { percentage, value: true } }, { userId })));
    const ten = at(10);
    const fifty = at(50);
    for (const id of ten) expect(fifty.has(id)).toBe(true);
    expect(at(0).size).toBe(0);
    expect(at(100).size).toBe(ids.length);
  });

  test('rules take precedence over the rollout, and bucketBy picks the id attribute', () => {
    const flag = {
      key: 'f',
      enabled: true,
      defaultValue: 'off',
      rules: [{ conditions: [{ attribute: 'role', operator: 'eq', value: 'staff' }], value: 'staff-on' }],
      rollout: { percentage: 100, value: 'rolled', bucketBy: 'orgId' },
    };
    expect(evaluateFlag(flag, { role: 'staff' })).toBe('staff-on');
    expect(evaluateFlag(flag, { orgId: 'acme' })).toBe('rolled');
    expect(evaluateFlag(flag, { userId: 'u1' })).toBe('off');
  });
});
