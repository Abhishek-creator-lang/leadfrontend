## The recursive version (start here)

All three traversals are the same recursion; only the position of the "record this node" line changes:

```js
function walk(node) {
  if (!node) return;
  preorder.push(node.value);   // before children
  walk(node.left);
  inorder.push(node.value);    // between children
  walk(node.right);
  postorder.push(node.value);  // after children
}
```

One walk fills all three arrays, so the whole thing is a single O(n) pass. A less efficient but still correct first draft is three separate recursive functions, which is three passes but the same big-O.

## The iterative version (reference)

Recursion depth equals tree height, so a lopsided tree with tens of thousands of levels can overflow the call stack. The reference uses one explicit stack of `[node, stage]` frames, which simulates the recursion exactly:

- **stage 0:** record pre-order, then push the frame back as stage 1 and push the left child;
- **stage 1:** record in-order, push stage 2, push the right child;
- **stage 2:** record post-order and drop the frame.

This makes the call-stack mechanics explicit, which is a good thing to narrate. The classic separate iterative versions are also worth knowing:

- **pre-order:** pop a node, record it, push right then left;
- **in-order:** walk left pushing nodes; pop, record, go right;
- **post-order:** run a modified pre-order (node, right, left) and reverse it.

## Complexity

- **Time:** O(n). Each node is pushed and popped a constant number of times.
- **Space:** O(h) for the stack, where h is the height: O(log n) when balanced, O(n) when skewed.

## Edge cases

- `null` root → three empty arrays.
- Nodes with only one child: guard against pushing `null`.
- Falsy values such as `0` or `''` are legitimate values. Check `node === null`, not `!node.value`.

## Talking through it in an interview

Draw the tree and trace the three orders by hand: "pre = me first, in = me in the middle, post = me last". Then show that one recursive walk produces all three. Bring up the stack-depth concern and convert to an iterative version if asked.

## Follow-ups

- **Where each order shows up:** pre-order for serialising or cloning a tree (and the DOM's document order); in-order for producing sorted output from a BST; post-order for deleting subtrees, computing sizes, evaluating expressions, and React's commit phase (children's effects run before their parent's).
- **Rebuild from pre-order + in-order:** the first pre-order value is the root; find it in the in-order list to split the left and right subtrees, then recurse. O(n) with a value → index map.
- **Morris traversal:** O(1) extra space by temporarily threading right pointers.
