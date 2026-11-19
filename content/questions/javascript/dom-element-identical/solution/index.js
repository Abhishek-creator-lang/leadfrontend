const ELEMENT_NODE = 1;

function sameAttributes(a, b) {
  if (a.attributes.length !== b.attributes.length) return false;
  for (const attr of a.attributes) {
    if (b.getAttribute(attr.name) !== attr.value) return false;
  }
  return true;
}

/**
 * @param {Node} nodeA
 * @param {Node} nodeB
 * @return {boolean}
 */
export default function isSameTree(nodeA, nodeB) {
  const stack = [[nodeA, nodeB]];

  while (stack.length > 0) {
    const [a, b] = stack.pop();
    if (a === b) continue;
    if (a.nodeType !== b.nodeType) return false;

    if (a.nodeType === ELEMENT_NODE) {
      if (a.tagName !== b.tagName) return false;
      if (!sameAttributes(a, b)) return false;
    } else if (a.nodeValue !== b.nodeValue) {
      // Text, comment and other character data nodes.
      return false;
    }

    const childrenA = a.childNodes;
    const childrenB = b.childNodes;
    if (childrenA.length !== childrenB.length) return false;
    for (let i = 0; i < childrenA.length; i++) {
      stack.push([childrenA[i], childrenB[i]]);
    }
  }

  return true;
}
