Implement `getElementsByClassName(root, classNames)` without using the built-in `getElementsByClassName`, `querySelector` or `querySelectorAll`.

It returns an **array** of every element **below** `root` (not `root` itself) that has **all** of the classes in `classNames`, in document order (a depth-first, pre-order walk).

```js
document.body.innerHTML = `
  <div id="root">
    <p class="note warn">A</p>
    <section class="warn">
      <p class="warn note big">B</p>
    </section>
    <p class="note">C</p>
  </div>`;

const root = document.getElementById('root');
getElementsByClassName(root, 'note warn').map((el) => el.textContent); // ['A', 'B']
getElementsByClassName(root, 'warn').length;                          // 3
getElementsByClassName(root, '   ');                                  // []
```

## Requirements

- `classNames` is a string of class names separated by any whitespace (spaces, tabs, newlines). Extra whitespace is ignored and order doesn't matter.
- Matching is **case-sensitive** and by whole class name: `"warn"` must not match `class="warning"`.
- An empty or whitespace-only `classNames` matches nothing.
- Only element nodes are returned (skip text and comment nodes).

## Follow-up

- The native method returns a **live** `HTMLCollection`. What does that mean, and what bugs can it cause?
- Recursive or iterative? What are the trade-offs on a very deep DOM?
- How would you use `TreeWalker` instead?
