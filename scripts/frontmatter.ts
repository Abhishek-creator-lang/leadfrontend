/** Minimal front-matter parser: supports `key: value`, quoted strings, numbers and `[a, b]` arrays. */
export function parseFrontMatter(src: string): { data: Record<string, unknown>; body: string } {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: src };
  const data: Record<string, unknown> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    data[kv[1]] = parseValue(kv[2].trim());
  }
  return { data, body: src.slice(m[0].length) };
}

function parseValue(v: string): unknown {
  if (v.startsWith('[') && v.endsWith(']')) {
    const inner = v.slice(1, -1).trim();
    return inner ? inner.split(',').map((s) => unquote(s.trim())) : [];
  }
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return unquote(v);
}

const unquote = (s: string) => s.replace(/^(['"])(.*)\1$/, '$2');
