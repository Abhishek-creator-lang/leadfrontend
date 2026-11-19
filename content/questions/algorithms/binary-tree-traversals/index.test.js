import traverseTree from './index';

const node = (value, left = null, right = null) => ({ value, left, right });

describe('traverseTree', () => {
  test('expression tree', () => {
    const tree = node('*', node('+', node('a'), node('b')), node('c'));
    expect(traverseTree(tree)).toEqual({
      preorder: ['*', '+', 'a', 'b', 'c'],
      inorder: ['a', '+', 'b', '*', 'c'],
      postorder: ['a', 'b', '+', 'c', '*'],
    });
  });

  test('null root', () => {
    expect(traverseTree(null)).toEqual({ preorder: [], inorder: [], postorder: [] });
  });

  test('single node', () => {
    expect(traverseTree(node(1))).toEqual({ preorder: [1], inorder: [1], postorder: [1] });
  });

  test('nodes with only one child', () => {
    //   1
    //    \
    //     2
    //    /
    //   3
    const tree = node(1, null, node(2, node(3), null));
    expect(traverseTree(tree)).toEqual({
      preorder: [1, 2, 3],
      inorder: [1, 3, 2],
      postorder: [3, 2, 1],
    });
  });

  test('falsy values are kept', () => {
    const tree = node(0, node(''), node(false));
    expect(traverseTree(tree)).toEqual({
      preorder: [0, '', false],
      inorder: ['', 0, false],
      postorder: ['', false, 0],
    });
  });

  test('complete tree of height 3', () => {
    const tree = node(4, node(2, node(1), node(3)), node(6, node(5), node(7)));
    const result = traverseTree(tree);
    expect(result.preorder).toEqual([4, 2, 1, 3, 6, 5, 7]);
    expect(result.inorder).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(result.postorder).toEqual([1, 3, 2, 5, 7, 6, 4]);
  });

  test('handles a deep, left-skewed tree', () => {
    const n = 5000;
    let root = null;
    for (let i = n; i >= 1; i--) root = node(i, root, null);
    // root is 1 with left child 2, and so on.
    const result = traverseTree(root);
    expect(result.preorder[0]).toBe(1);
    expect(result.inorder[0]).toBe(n);
    expect(result.postorder[n - 1]).toBe(1);
    expect(result.inorder).toHaveLength(n);
  });

  test('large balanced tree in-order is sorted', () => {
    const build = (lo, hi) => {
      if (lo > hi) return null;
      const mid = (lo + hi) >> 1;
      return node(mid, build(lo, mid - 1), build(mid + 1, hi));
    };
    const n = 100000;
    const result = traverseTree(build(1, n));
    expect(result.inorder).toEqual(Array.from({ length: n }, (_, i) => i + 1));
    expect(result.preorder[0]).toBe((1 + n) >> 1);
    expect(result.postorder[n - 1]).toBe((1 + n) >> 1);
  });
});
