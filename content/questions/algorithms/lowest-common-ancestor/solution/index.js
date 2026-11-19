/**
 * @typedef {{ tag: string, children: TreeNode[] }} TreeNode
 */

/**
 * @param {TreeNode} root
 * @param {TreeNode} a
 * @param {TreeNode} b
 * @return {TreeNode} The deepest node that contains both a and b.
 */
export default function lowestCommonAncestor(root, a, b) {
  // 1. Iteratively record each node's parent until both targets are found.
  const parent = new Map([[root, null]]);
  const stack = [root];
  while (stack.length > 0 && !(parent.has(a) && parent.has(b))) {
    const node = stack.pop();
    for (const child of node.children) {
      parent.set(child, node);
      stack.push(child);
    }
  }

  // 2. Collect a and all of its ancestors.
  const ancestorsOfA = new Set();
  for (let n = a; n !== null && n !== undefined; n = parent.get(n)) ancestorsOfA.add(n);

  // 3. Climb from b until we hit one of them.
  for (let n = b; n !== null && n !== undefined; n = parent.get(n)) {
    if (ancestorsOfA.has(n)) return n;
  }
  return null;
}
