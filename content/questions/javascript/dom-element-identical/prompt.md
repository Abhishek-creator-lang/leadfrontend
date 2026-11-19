Implement `isSameTree(nodeA, nodeB)`. It returns `true` if the two DOM nodes are **structurally identical** and `false` otherwise. Do not use `isEqualNode`, `outerHTML` or `innerHTML`.

Two nodes are identical when:

1. They have the same `nodeType`.
2. **Elements:** they have the same tag name, the same set of attributes with the same values (attribute **order doesn't matter**), and identical child node lists.
3. **Text and comment nodes:** they have the same `nodeValue`.
4. Their child nodes are identical **pairwise, in order**. This includes text and comment nodes, so whitespace matters.

```js
const a = document.createElement('div');
a.innerHTML = '<p class="x" id="1">Hi <b>there</b></p>';

const b = document.createElement('div');
b.innerHTML = '<p id="1" class="x">Hi <b>there</b></p>';

isSameTree(a, b); // true: attribute order doesn't matter

b.querySelector('b').textContent = 'you';
isSameTree(a, b); // false
```

## Requirements

- Two references to the same node are identical.
- Compare attribute **values** exactly (`class="a b"` is not the same as `class="b a"`).
- Must handle deep trees.

## Follow-up

- Why is comparing `outerHTML` strings a weaker check than it looks?
- How does this relate to virtual DOM diffing?
- How would you return the *path* to the first difference instead of a boolean?
