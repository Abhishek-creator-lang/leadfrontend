/**
 * @typedef {{ value: *, left: TreeNode | null, right: TreeNode | null }} TreeNode
 */

/**
 * @param {TreeNode | null} root
 * @return {Array<Array<*>>} Values grouped by depth, left to right.
 */
export default function levelOrder(root) {
  const rows = [];
  let current = root ? [root] : [];

  while (current.length > 0) {
    const row = [];
    const next = [];
    for (const node of current) {
      row.push(node.value);
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    rows.push(row);
    current = next;
  }

  return rows;
}
