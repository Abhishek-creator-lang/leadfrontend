import levelOrder from './index';

const node = (value, left = null, right = null) => ({ value, left, right });

describe('levelOrder', () => {
  test('org chart example', () => {
    const root = node('Ada', node('Grace', node('Alan')), node('Linus', null, node('Barbara')));
    expect(levelOrder(root)).toEqual([['Ada'], ['Grace', 'Linus'], ['Alan', 'Barbara']]);
  });

  test('null root', () => {
    expect(levelOrder(null)).toEqual([]);
  });

  test('single node', () => {
    expect(levelOrder(node(1))).toEqual([[1]]);
  });

  test('complete tree', () => {
    const root = node(1, node(2, node(4), node(5)), node(3, node(6), node(7)));
    expect(levelOrder(root)).toEqual([[1], [2, 3], [4, 5, 6, 7]]);
  });

  test('left-to-right order across different parents', () => {
    //      1
    //     / \
    //    2   3
    //     \   \
    //      4   5
    //     /
    //    6
    const root = node(1, node(2, null, node(4, node(6))), node(3, null, node(5)));
    expect(levelOrder(root)).toEqual([[1], [2, 3], [4, 5], [6]]);
  });

  test('falsy values', () => {
    expect(levelOrder(node(0, node(''), node(false)))).toEqual([[0], ['', false]]);
  });

  test('deep skewed tree', () => {
    let root = null;
    for (let i = 5000; i >= 1; i--) root = node(i, null, root);
    const rows = levelOrder(root);
    expect(rows).toHaveLength(5000);
    expect(rows[0]).toEqual([1]);
    expect(rows[4999]).toEqual([5000]);
  });

  test('large balanced tree', () => {
    // Heap-numbered complete tree with 2^17 - 1 nodes.
    const n = 2 ** 17 - 1;
    const build = (i) => (i > n ? null : node(i, build(2 * i), build(2 * i + 1)));
    const rows = levelOrder(build(1));
    expect(rows).toHaveLength(17);
    rows.forEach((row, d) => {
      expect(row).toHaveLength(2 ** d);
      expect(row[0]).toBe(2 ** d);
    });
  });
});
