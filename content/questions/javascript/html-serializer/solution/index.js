/**
 * @typedef {string | {
 *   tag: string,
 *   attributes?: Record<string, string | number | boolean | null | undefined>,
 *   children?: Node[],
 * }} Node
 */

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr',
]);

const INDENT = '  ';

function escapeText(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttribute(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function openingTag(tag, attributes = {}) {
  let html = `<${tag}`;
  for (const [name, value] of Object.entries(attributes)) {
    if (value === false || value === null || value === undefined) continue;
    html += value === true ? ` ${name}` : ` ${name}="${escapeAttribute(String(value))}"`;
  }
  return `${html}>`;
}

/**
 * @param {Node} node
 * @return {string}
 */
export default function serialize(node) {
  const lines = [];

  function write(current, depth) {
    const indent = INDENT.repeat(depth);

    if (typeof current === 'string') {
      lines.push(indent + escapeText(current));
      return;
    }

    const { tag, attributes, children = [] } = current;
    const open = openingTag(tag, attributes);

    if (VOID_ELEMENTS.has(tag.toLowerCase())) {
      lines.push(indent + open);
    } else if (children.length === 0) {
      lines.push(`${indent}${open}</${tag}>`);
    } else {
      lines.push(indent + open);
      for (const child of children) write(child, depth + 1);
      lines.push(`${indent}</${tag}>`);
    }
  }

  write(node, 0);
  return lines.join('\n');
}
