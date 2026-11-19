/**
 * @typedef {{ filters?: Record<string, (value: any) => any> }} RenderOptions
 */

// Triple braces first so `{{{ x }}}` is never read as `{{ {x }}` + `}`.
const TAG = /\{\{\{\s*([\s\S]+?)\s*\}\}\}|\{\{\s*([\s\S]+?)\s*\}\}/g;

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

function parseExpression(expression, raw) {
  const [pathPart, ...filters] = expression.split('|').map((s) => s.trim());
  return { path: pathPart.split('.').map((s) => s.trim()), filters, raw };
}

function resolve(data, path) {
  let value = data;
  for (const key of path) {
    if (value === null || value === undefined) return undefined;
    value = value[key];
  }
  return value;
}

/**
 * @param {string} template
 * @return {(data: any, options?: RenderOptions) => string}
 */
export function compile(template) {
  const parts = [];
  let lastIndex = 0;

  for (const match of template.matchAll(TAG)) {
    if (match.index > lastIndex) parts.push(template.slice(lastIndex, match.index));
    const raw = match[1] !== undefined;
    parts.push(parseExpression(raw ? match[1] : match[2], raw));
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < template.length) parts.push(template.slice(lastIndex));

  return function renderCompiled(data, options = {}) {
    const filters = options.filters || {};
    let out = '';
    for (const part of parts) {
      if (typeof part === 'string') {
        out += part;
        continue;
      }
      let value = resolve(data, part.path);
      for (const name of part.filters) {
        const filter = filters[name];
        if (typeof filter !== 'function') throw new Error(`Unknown filter: ${name}`);
        value = filter(value);
      }
      const text = value === null || value === undefined ? '' : String(value);
      out += part.raw ? text : escapeHtml(text);
    }
    return out;
  };
}

/**
 * @param {string} template
 * @param {any} data
 * @param {RenderOptions} [options]
 * @return {string}
 */
export default function render(template, data, options) {
  return compile(template)(data, options);
}
