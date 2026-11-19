/**
 * @typedef {{ value: number, left: TreeNode | null, right: TreeNode | null }} TreeNode
 */

/**
 * @param {TreeNode | null} root
 * @return {boolean}
 */
export default function isValidBST(root) {
  if (root === null) return true;

  // Each entry: a node plus the open interval (low, high) its value must lie in.
  const stack = [[root, -Infinity, Infinity]];
  while (stack.length > 0) {
    const [node, low, high] = stack.pop();
    if (!(node.value > low && node.value < high)) return false;
    if (node.left) stack.push([node.left, low, node.value]);
    if (node.right) stack.push([node.right, node.value, high]);
  }
  return true;
}
