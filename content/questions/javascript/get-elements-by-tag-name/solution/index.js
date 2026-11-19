/**
 * @param {Element} root
 * @param {string} tagName Tag name to match, case-insensitively, or '*' for all elements.
 * @return {Element[]}
 */
export default function getElementsByTagName(root, tagName) {
  const target = tagName.toLowerCase();
  const matchAll = target === '*';
  const result = [];

  function visit(el) {
    if (matchAll || el.tagName.toLowerCase() === target) {
      result.push(el);
    }
    for (const child of el.children) {
      visit(child);
    }
  }

  for (const child of root.children) {
    visit(child);
  }

  return result;
}
