/**
 * Formats a list of strings as an English sentence.
 *
 * @param {Array<string>} items
 * @param {{ sorted?: boolean, length?: number, unique?: boolean }} [options]
 * @return {string}
 */
export default function listFormat(items, options = {}) {
  const { sorted = false, length, unique = false } = options;

  // 1. Prepare the data.
  let list = items.filter((item) => item !== '');
  if (unique) list = [...new Set(list)];
  if (sorted) list = [...list].sort();

  // 2. Decide what is visible.
  const truncate = typeof length === 'number' && length > 0 && length < list.length;
  const parts = truncate ? list.slice(0, length) : list.slice();
  const hidden = list.length - parts.length;
  if (hidden > 0) {
    parts.push(`${hidden} ${hidden === 1 ? 'other' : 'others'}`);
  }

  // 3. Render.
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}
