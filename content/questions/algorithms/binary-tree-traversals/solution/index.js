/**
 * @typedef {{ value: *, left: TreeNode | null, right: TreeNode | null }} TreeNode
 */

/**
 * @param {TreeNode | null} root
 * @return {{ preorder: Array, inorder: Array, postorder: Array }}
 */
export default function traverseTree(root) {
  const preorder = [];
  const inorder = [];
  const postorder = [];
  if (root == null) return { preorder, inorder, postorder };

  // Each frame is [node, stage]; stages mirror the three points in a recursive walk.
  const stack = [[root, 0]];
  while (stack.length > 0) {
    const frame = stack[stack.length - 1];
    const [node, stage] = frame;

    if (stage === 0) {
      preorder.push(node.value);
      frame[1] = 1;
      if (node.left) stack.push([node.left, 0]);
    } else if (stage === 1) {
      inorder.push(node.value);
      frame[1] = 2;
      if (node.right) stack.push([node.right, 0]);
    } else {
      postorder.push(node.value);
      stack.pop();
    }
  }

  return { preorder, inorder, postorder };
}
