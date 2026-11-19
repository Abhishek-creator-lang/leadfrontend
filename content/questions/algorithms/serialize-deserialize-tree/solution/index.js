/**
 * @typedef {{ value: number, left: TreeNode | null, right: TreeNode | null }} TreeNode
 */

const NULL = '#';
const SEP = ',';

export default class TreeCodec {
  /**
   * Level-order encoding with '#' for missing children, e.g. "1,2,3,#,#,-4,5".
   * @param {TreeNode | null} root
   * @return {string}
   */
  serialize(root) {
    const tokens = [];
    const queue = [root];
    for (let head = 0; head < queue.length; head++) {
      const node = queue[head];
      if (node === null) {
        tokens.push(NULL);
      } else {
        tokens.push(String(node.value));
        queue.push(node.left, node.right);
      }
    }
    // Trailing nulls carry no information.
    while (tokens.length > 0 && tokens[tokens.length - 1] === NULL) tokens.pop();
    return tokens.join(SEP);
  }

  /**
   * @param {string} text
   * @return {TreeNode | null}
   */
  deserialize(text) {
    if (text === '') return null;
    const tokens = text.split(SEP);
    const makeNode = (token) =>
      token === undefined || token === NULL ? null : { value: Number(token), left: null, right: null };

    const root = makeNode(tokens[0]);
    if (root === null) return null;

    const parents = [root];
    let next = 1;
    for (let head = 0; head < parents.length && next < tokens.length; head++) {
      const parent = parents[head];
      parent.left = makeNode(tokens[next++]);
      if (parent.left) parents.push(parent.left);
      parent.right = makeNode(tokens[next++]);
      if (parent.right) parents.push(parent.right);
    }
    return root;
  }
}
