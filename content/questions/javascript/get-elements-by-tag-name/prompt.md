Implement `getElementsByTagName(root, tagName)` without using the built-in `getElementsByTagName`, `querySelector`, `querySelectorAll` or `TreeWalker`.

It returns an **array** of the elements **below** `root` (not `root` itself) whose tag name matches, in document order.

```js
document.body.innerHTML = `
  <nav id="root">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/docs">Docs</a></li>
    </ul>
    <a href="/login">Log in</a>
  </nav>`;

const root = document.getElementById('root');
getElementsByTagName(root, 'a').map((a) => a.getAttribute('href')); // ['/', '/docs', '/login']
getElementsByTagName(root, 'LI').length; // 2  (case-insensitive)
getElementsByTagName(root, '*').length;  // 6  (every descendant element)
```

## Requirements

- Matching is **case-insensitive** for HTML elements (`'DIV'`, `'div'` and `'Div'` are the same).
- `'*'` matches every descendant element.
- Results are in document order: a depth-first, pre-order traversal.
- Only element nodes are returned.
- You may assume the tree contains only HTML elements.

## Follow-up

- Why does `element.tagName` return `'DIV'` for HTML but `'foreignObject'` for an SVG element?
- How would you return a *live* collection, and why might you not want one?
- Write it recursively and iteratively. Which would you ship?
