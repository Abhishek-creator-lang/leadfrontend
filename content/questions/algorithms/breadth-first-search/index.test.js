import breadthFirstSearch from './index';

// Asserts that `path` is a real path in the graph of the expected length.
function expectPath(links, path, from, to, clicks) {
  expect(path).not.toBeNull();
  expect(path[0]).toBe(from);
  expect(path[path.length - 1]).toBe(to);
  expect(path.length - 1).toBe(clicks);
  for (let i = 0; i < path.length - 1; i++) {
    expect(links[path[i]] ?? []).toContain(path[i + 1]);
  }
}

describe('breadthFirstSearch', () => {
  const links = {
    home: ['products', 'help'],
    products: ['product-42', 'cart'],
    'product-42': ['cart'],
    cart: ['checkout'],
    help: ['contact'],
  };

  test('finds the shortest path', () => {
    expect(breadthFirstSearch(links, 'home', 'checkout')).toEqual(['home', 'products', 'cart', 'checkout']);
  });

  test('from === to returns a single-page path', () => {
    expect(breadthFirstSearch(links, 'home', 'home')).toEqual(['home']);
  });

  test('returns null when unreachable', () => {
    expect(breadthFirstSearch(links, 'help', 'checkout')).toBeNull();
    expect(breadthFirstSearch(links, 'contact', 'home')).toBeNull();
  });

  test('links are one-way', () => {
    expect(breadthFirstSearch({ a: ['b'] }, 'b', 'a')).toBeNull();
  });

  test('handles cycles', () => {
    const g = { a: ['b'], b: ['c', 'a'], c: ['a', 'd'] };
    expect(breadthFirstSearch(g, 'a', 'd')).toEqual(['a', 'b', 'c', 'd']);
  });

  test('prefers a short path over an earlier-listed long one', () => {
    const g = { s: ['x1', 't'], x1: ['x2'], x2: ['x3'], x3: ['t'] };
    expect(breadthFirstSearch(g, 's', 't')).toEqual(['s', 't']);
  });

  test('any shortest path is accepted when several exist', () => {
    const g = { s: ['a', 'b'], a: ['t'], b: ['t'] };
    expectPath(g, breadthFirstSearch(g, 's', 't'), 's', 't', 2);
  });

  test('large grid of pages (exponentially many paths)', () => {
    // 100 x 100 grid, each cell links right and down. Shortest path is 198 clicks.
    const n = 100;
    const g = {};
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const out = [];
        if (c + 1 < n) out.push(`${r},${c + 1}`);
        if (r + 1 < n) out.push(`${r + 1},${c}`);
        g[`${r},${c}`] = out;
      }
    }
    const path = breadthFirstSearch(g, '0,0', `${n - 1},${n - 1}`);
    expectPath(g, path, '0,0', `${n - 1},${n - 1}`, 2 * (n - 1));
  });

  test('large dense graph', () => {
    const n = 400;
    const g = {};
    for (let i = 0; i < n; i++) {
      // Each page links to every later page except the final target, plus a chain step.
      g[i] = [];
      for (let j = i + 1; j < n - 1; j++) g[i].push(String(j));
    }
    g[n - 2].push(String(n - 1));
    const path = breadthFirstSearch(g, '0', String(n - 1));
    expectPath(g, path, '0', String(n - 1), 2);
  });
});
