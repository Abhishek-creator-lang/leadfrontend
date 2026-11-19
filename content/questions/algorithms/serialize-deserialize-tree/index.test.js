import TreeCodec from './index';

const node = (value, left = null, right = null) => ({ value, left, right });

// Iterative structural equality so very deep trees don't overflow the test itself.
function sameTree(a, b) {
  const stack = [[a, b]];
  while (stack.length > 0) {
    const [x, y] = stack.pop();
    if (x === null || y === null) {
      if (x !== y) return false;
      continue;
    }
    if (x.value !== y.value) return false;
    stack.push([x.left, y.left], [x.right, y.right]);
  }
  return true;
}

const roundTrip = (tree) => {
  const codec = new TreeCodec();
  const text = codec.serialize(tree);
  expect(typeof text).toBe('string');
  return new TreeCodec().deserialize(text);
};

describe('TreeCodec', () => {
  test('round-trips the example tree', () => {
    const tree = node(1, node(2), node(3, node(-4), node(5)));
    const copy = roundTrip(tree);
    expect(copy).toEqual(tree);
    expect(copy).not.toBe(tree);
  });

  test('empty tree', () => {
    expect(roundTrip(null)).toBeNull();
  });

  test('single node, including zero and negatives', () => {
    expect(roundTrip(node(0))).toEqual(node(0));
    expect(roundTrip(node(-17))).toEqual(node(-17));
  });

  test('left-only and right-only children are distinguished', () => {
    const leftOnly = node(1, node(2));
    const rightOnly = node(1, null, node(2));
    const codec = new TreeCodec();
    expect(codec.serialize(leftOnly)).not.toBe(codec.serialize(rightOnly));
    expect(roundTrip(leftOnly)).toEqual(leftOnly);
    expect(roundTrip(rightOnly)).toEqual(rightOnly);
  });

  test('duplicate values', () => {
    const tree = node(2, node(2, null, node(2)), node(2, node(2)));
    expect(roundTrip(tree)).toEqual(tree);
  });

  test('irregular shape with gaps', () => {
    const tree = node(10, node(5, null, node(7, node(6))), node(15, null, node(20, null, node(25))));
    expect(roundTrip(tree)).toEqual(tree);
  });

  test('large random tree', () => {
    let seed = 42;
    const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    const nodes = [node(0)];
    for (let i = 1; i < 100000; i++) {
      // Attach to a random existing node with a free slot.
      while (true) {
        const parent = nodes[Math.floor(rand() * nodes.length)];
        const side = rand() < 0.5 ? 'left' : 'right';
        if (parent[side] === null) {
          parent[side] = node(Math.floor(rand() * 2000) - 1000);
          nodes.push(parent[side]);
          break;
        }
      }
    }
    expect(sameTree(roundTrip(nodes[0]), nodes[0])).toBe(true);
  });

  test('very deep chain', () => {
    let root = null;
    for (let i = 0; i < 50000; i++) root = i % 2 ? node(i, root, null) : node(i, null, root);
    expect(sameTree(roundTrip(root), root)).toBe(true);
  });
});
