import depthFirstSearch from './index';

describe('depthFirstSearch', () => {
  const links = {
    home: ['blog', 'about'],
    blog: ['post-1', 'post-2'],
    'post-1': ['home'],
    'post-2': [],
    about: ['team'],
    team: [],
  };

  test('visits pages depth-first in link order', () => {
    expect(depthFirstSearch(links, 'home')).toEqual(['home', 'blog', 'post-1', 'post-2', 'about', 'team']);
  });

  test('only returns pages reachable from start', () => {
    expect(depthFirstSearch(links, 'about')).toEqual(['about', 'team']);
  });

  test('start with no outgoing links', () => {
    expect(depthFirstSearch(links, 'team')).toEqual(['team']);
    expect(depthFirstSearch({}, 'lonely')).toEqual(['lonely']);
  });

  test('pages without their own key are treated as dead ends', () => {
    expect(depthFirstSearch({ a: ['b', 'c'] }, 'a')).toEqual(['a', 'b', 'c']);
  });

  test('handles self-links and cycles', () => {
    const g = { a: ['a', 'b'], b: ['c'], c: ['a'] };
    expect(depthFirstSearch(g, 'a')).toEqual(['a', 'b', 'c']);
  });

  test('goes deep before wide, even when a node is also a direct neighbour', () => {
    // d is reachable through b, so true DFS reaches it there before backtracking to a's second link.
    const g = { a: ['b', 'd'], b: ['c'], c: ['d'], d: [] };
    expect(depthFirstSearch(g, 'a')).toEqual(['a', 'b', 'c', 'd']);
  });

  test('a branching tree', () => {
    const g = { 1: ['2', '5'], 2: ['3', '4'], 5: ['6'], 6: ['7'] };
    expect(depthFirstSearch(g, '1')).toEqual(['1', '2', '3', '4', '5', '6', '7']);
  });

  test('a densely linked graph does not cause repeated work', () => {
    // Every page links to every other page: ~250,000 edges.
    const n = 500;
    const g = {};
    for (let i = 0; i < n; i++) {
      g[`p${i}`] = Array.from({ length: n }, (_, j) => `p${j}`).filter((_, j) => j !== i);
    }
    const order = depthFirstSearch(g, 'p0');
    expect(order).toHaveLength(n);
    expect(order[1]).toBe('p1');
    expect(new Set(order).size).toBe(n);
  });

  test('a long chain of links', () => {
    const n = 5000;
    const g = {};
    for (let i = 0; i < n - 1; i++) g[i] = [String(i + 1)];
    const order = depthFirstSearch(g, '0');
    expect(order).toHaveLength(n);
    expect(order[n - 1]).toBe(String(n - 1));
  });
});
