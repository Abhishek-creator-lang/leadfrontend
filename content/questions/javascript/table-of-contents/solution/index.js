/**
 * @typedef {{ id: string, text: string, level: number, children: TocEntry[] }} TocEntry
 */

function slugify(text) {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'section';
}

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Builds a nested table of contents from the h1–h6 headings inside `root`,
 * assigning unique ids to headings that don't have one.
 *
 * @param {Element} root
 * @return {TocEntry[]}
 */
export default function tableOfContents(root) {
  const used = new Set();
  for (const el of root.querySelectorAll('[id]')) {
    if (el.id) used.add(el.id);
  }

  const roots = [];
  const stack = [];

  for (const heading of root.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
    const text = heading.textContent.replace(/\s+/g, ' ').trim();

    let id = heading.id;
    if (!id) {
      const base = slugify(text);
      id = base;
      let n = 1;
      while (used.has(id)) id = `${base}-${n++}`;
      used.add(id);
      heading.id = id;
    }

    const entry = { id, text, level: Number(heading.tagName[1]), children: [] };

    // Close sections at the same or a deeper level; the top of the stack is then the parent.
    while (stack.length > 0 && stack[stack.length - 1].level >= entry.level) {
      stack.pop();
    }
    const parent = stack[stack.length - 1];
    (parent ? parent.children : roots).push(entry);
    stack.push(entry);
  }

  return roots;
}

/**
 * @param {TocEntry[]} tree
 * @return {string}
 */
export function renderToc(tree) {
  if (tree.length === 0) return '';
  const items = tree
    .map(
      (entry) =>
        `<li><a href="#${escapeHtml(entry.id)}">${escapeHtml(entry.text)}</a>${renderToc(entry.children)}</li>`
    )
    .join('');
  return `<ul>${items}</ul>`;
}
