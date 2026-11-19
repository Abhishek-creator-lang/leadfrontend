/**
 * Returns the computed form of `value` for `property`, e.g. 'red' -> 'rgb(255, 0, 0)'.
 */
function normalize(doc, property, value) {
  const probe = doc.createElement('div');
  probe.style.setProperty(property, value);
  doc.body.appendChild(probe);
  const normalized = doc.defaultView.getComputedStyle(probe).getPropertyValue(property);
  probe.remove();
  return normalized;
}

/**
 * @param {Element} root
 * @param {string} property CSS property in kebab-case, e.g. 'font-size'.
 * @param {string} value
 * @return {Element[]}
 */
export default function getElementsByStyle(root, property, value) {
  const doc = root.ownerDocument;
  const view = doc.defaultView;
  const target = normalize(doc, property, value);
  const result = [];

  const stack = Array.from(root.children).reverse();
  while (stack.length > 0) {
    const el = stack.pop();
    if (view.getComputedStyle(el).getPropertyValue(property) === target) {
      result.push(el);
    }
    for (let i = el.children.length - 1; i >= 0; i--) {
      stack.push(el.children[i]);
    }
  }

  return result;
}
