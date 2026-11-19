/**
 * @param {Element} root
 * @param {string} classNames Whitespace-separated class names.
 * @return {Element[]}
 */
export default function getElementsByClassName(root, classNames) {
  const trimmed = classNames.trim();
  if (trimmed === '') return [];
  const targets = trimmed.split(/\s+/);

  const result = [];
  // Iterative pre-order DFS. Children are pushed in reverse so the first child is visited first.
  const stack = Array.from(root.children).reverse();

  while (stack.length > 0) {
    const el = stack.pop();
    if (targets.every((name) => el.classList.contains(name))) {
      result.push(el);
    }
    for (let i = el.children.length - 1; i >= 0; i--) {
      stack.push(el.children[i]);
    }
  }

  return result;
}
