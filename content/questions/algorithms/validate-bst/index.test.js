import isValidBST from './index';

const node = (value, left = null, right = null) => ({ value, left, right });

describe('isValidBST', () => {
  test('simple valid tree', () => {
    expect(isValidBST(node(8, node(3), node(10)))).toBe(true);
  });

  test('violation deeper than the direct parent', () => {
    expect(isValidBST(node(8, node(3, null, node(9)), node(10)))).toBe(false);
  });

  test('violation on the right side, deep', () => {
    // 4 is in 5's right subtree but less than 5.
    expect(isValidBST(node(5, node(2), node(8, node(4), node(9))))).toBe(false);
  });

  test('duplicates are invalid', () => {
    expect(isValidBST(node(5, node(5)))).toBe(false);
    expect(isValidBST(node(5, null, node(5)))).toBe(false);
  });

  test('empty and single node', () => {
    expect(isValidBST(null)).toBe(true);
    expect(isValidBST(node(42))).toBe(true);
  });

  test('negative and extreme values', () => {
    const tree = node(0, node(-Number.MAX_VALUE), node(Number.MAX_VALUE));
    expect(isValidBST(tree)).toBe(true);
    expect(isValidBST(node(Number.MIN_SAFE_INTEGER, node(-Number.MAX_VALUE)))).toBe(true);
  });

  test('larger valid tree', () => {
    const tree = node(50, node(30, node(20, node(10)), node(40, node(35), node(45))), node(70, node(60), node(80, null, node(90))));
    expect(isValidBST(tree)).toBe(true);
  });

  test('large balanced valid tree, then break one leaf', () => {
    const build = (lo, hi) => {
      if (lo > hi) return null;
      const mid = (lo + hi) >> 1;
      return node(mid, build(lo, mid - 1), build(mid + 1, hi));
    };
    const root = build(1, 100000);
    expect(isValidBST(root)).toBe(true);
    let leaf = root.left;
    while (leaf.right) leaf = leaf.right; // largest value in the left subtree
    leaf.value = root.value + 1;
    expect(isValidBST(root)).toBe(false);
  });

  test('degenerate chain', () => {
    let root = null;
    for (let i = 20000; i >= 1; i--) root = node(i, null, root);
    expect(isValidBST(root)).toBe(true);
  });
});
