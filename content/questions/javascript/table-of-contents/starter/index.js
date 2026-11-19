/**
 * @typedef {{ id: string, text: string, level: number, children: TocEntry[] }} TocEntry
 */

/**
 * Builds a nested table of contents from the h1–h6 headings inside `root`,
 * assigning unique ids to headings that don't have one.
 *
 * @param {Element} root
 * @return {TocEntry[]}
 */
export default function tableOfContents(root) {
  throw 'Not implemented!';
}

/**
 * @param {TocEntry[]} tree
 * @return {string}
 */
export function renderToc(tree) {
  throw 'Not implemented!';
}
