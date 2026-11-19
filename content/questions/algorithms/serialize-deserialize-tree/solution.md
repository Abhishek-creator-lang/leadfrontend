## What makes this hard

A single traversal (pre-order, in-order or level-order) of just the **values** doesn't determine a tree's shape. `[1, 2]` could be 2 as the left child or the right child of 1. You must also encode where the **missing children** are, or store two traversals.

## Brute force

Store both the pre-order and in-order value lists and rebuild from them. That's the classic reconstruction. But it **breaks with duplicate values** (you can't tell which `2` is the root of a subtree), and the naive rebuild is O(n²) because of the repeated `indexOf` calls into the in-order list.

## Optimal: one traversal with null markers

Write each node's value and an explicit marker (`#`) for each missing child. Any single traversal order then fully determines the tree.

**Level-order (reference):**

- *Serialize:* BFS from the root. For each dequeued slot, emit `#` if it's `null`; otherwise emit the value and enqueue both children (even `null` ones). Trim trailing `#`s, which carry no information, and join with `,`.
- *Deserialize:* split on `,`. The first token is the root. Then keep a queue of nodes waiting for children: for each parent, read the next two tokens as its left and right child (`#` → `null`), and enqueue the real children.

Both directions are iterative, so a 50,000-deep chain is fine. A recursive **pre-order** version (`value, left subtree, right subtree`, with `#` for null) is shorter to write and equally correct, but it overflows the call stack on very deep trees. Mention it, and explain why you went iterative.

## Complexity

- **Time:** O(n) both ways. Use an index pointer into the token array rather than `shift()`, which is O(n) per call.
- **Space:** O(n) for the string, the tokens and the queue.

## Edge cases

- `null` tree → a recognisable empty encoding (`''` here) that deserializes back to `null`.
- Negative numbers and zero. Parse with `Number(token)`, and don't use truthiness checks (`0` is falsy).
- Single node, left-only and right-only chains.
- Trailing-null trimming must not break deserialization. Treat a missing token as `#`.

## Talking through it in an interview

Begin with the ambiguity example to show why null markers are needed. Pick an encoding, write both directions, then round-trip a small asymmetric tree by hand. Interviewers grade the *format design* as much as the code: separators, null markers, escaping.

## Follow-ups

- **BSTs:** pre-order values alone suffice, with no null markers, because the BST ordering determines the shape. Rebuild with value bounds in O(n).
- **Arbitrary strings:** escape the separator, or length-prefix each token (`3:abc`), or encode values with `encodeURIComponent`. Length-prefixing is the most robust.
- **Compactness for URLs:** binary encodings or varints plus base64url. For real apps, `JSON.stringify` of a nested object with gzip/`CompressionStream` is usually fine.
