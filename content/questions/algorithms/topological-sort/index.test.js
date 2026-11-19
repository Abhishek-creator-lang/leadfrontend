import topologicalSort from './index';

// Checks the result is a valid order rather than one specific answer.
function expectValidOrder(imports, order) {
  const all = new Set();
  for (const [mod, deps] of Object.entries(imports)) {
    all.add(mod);
    deps.forEach((d) => all.add(d));
  }
  expect(order.length).toBe(all.size);
  expect(new Set(order).size).toBe(all.size);
  const position = new Map(order.map((m, i) => [m, i]));
  for (const [mod, deps] of Object.entries(imports)) {
    for (const dep of deps) {
      expect(position.has(dep)).toBe(true);
      expect(position.get(dep)).toBeLessThan(position.get(mod));
    }
  }
}

describe('topologicalSort', () => {
  test('orders a small dependency graph', () => {
    const imports = {
      'app.js': ['router.js', 'store.js'],
      'router.js': ['utils.js'],
      'store.js': ['utils.js'],
    };
    expectValidOrder(imports, topologicalSort(imports));
  });

  test('includes modules that only appear as imports', () => {
    const imports = { 'main.js': ['lodash.js', 'react.js'] };
    const order = topologicalSort(imports);
    expect(order.slice().sort()).toEqual(['lodash.js', 'main.js', 'react.js']);
    expect(order[2]).toBe('main.js');
  });

  test('empty graph', () => {
    expect(topologicalSort({})).toEqual([]);
  });

  test('modules with no imports and disconnected components', () => {
    const imports = { 'a.js': [], 'b.js': ['c.js'], 'd.js': [] };
    expectValidOrder(imports, topologicalSort(imports));
  });

  test('a linear chain has exactly one valid order', () => {
    expect(topologicalSort({ c: ['b'], b: ['a'], a: [] })).toEqual(['a', 'b', 'c']);
  });

  test('throws on a two-module cycle', () => {
    expect(() => topologicalSort({ 'a.js': ['b.js'], 'b.js': ['a.js'] })).toThrow();
  });

  test('throws on a self-import', () => {
    expect(() => topologicalSort({ 'a.js': ['a.js'] })).toThrow();
  });

  test('throws on a cycle buried deeper in the graph', () => {
    const imports = {
      'entry.js': ['x.js'],
      'x.js': ['y.js'],
      'y.js': ['z.js'],
      'z.js': ['x.js'],
      'ok.js': [],
    };
    expect(() => topologicalSort(imports)).toThrow();
  });

  test('tolerates duplicate entries in an import list', () => {
    const imports = { 'a.js': ['b.js', 'b.js'] };
    expect(topologicalSort(imports)).toEqual(['b.js', 'a.js']);
  });

  test('stacked diamonds do not cause exponential work', () => {
    // 40 layers of 2 modules each, every module importing both modules of the next layer: 2^40 paths.
    const imports = {};
    for (let layer = 0; layer < 40; layer++) {
      for (const side of ['L', 'R']) {
        imports[`${side}${layer}`] = layer < 39 ? [`L${layer + 1}`, `R${layer + 1}`] : [];
      }
    }
    expectValidOrder(imports, topologicalSort(imports));
  });

  test('handles a large graph', () => {
    const imports = {};
    const n = 5000;
    for (let i = 0; i < n; i++) {
      const deps = [];
      if (i > 0) deps.push(`m${i - 1}`);
      if (i > 10) deps.push(`m${i - 11}`);
      imports[`m${i}`] = deps;
    }
    expectValidOrder(imports, topologicalSort(imports));
  });
});
