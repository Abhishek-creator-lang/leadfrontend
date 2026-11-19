/**
 * Parses every ```mermaid block under content/ and reports syntax errors.
 * Usage: npx tsx scripts/check-mermaid.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// mermaid expects a browser-like global environment
const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
const g = globalThis as unknown as Record<string, unknown>;
g.window = dom.window;
g.document = dom.window.document;
g.DOMParser = dom.window.DOMParser;
g.Element = dom.window.Element;
g.HTMLElement = dom.window.HTMLElement;
g.SVGElement = dom.window.SVGElement;
try {
  g.navigator = dom.window.navigator;
} catch {
  // navigator is read-only on newer Node versions; the Node global is good enough
}

const { default: mermaid } = await import('mermaid');
mermaid.initialize({ startOnLoad: false });

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : [];
  });

let total = 0;
const failures: string[] = [];
for (const file of walk(path.join(ROOT, 'content'))) {
  const src = fs.readFileSync(file, 'utf8');
  for (const m of src.matchAll(/```mermaid\r?\n([\s\S]*?)```/g)) {
    total++;
    try {
      await mermaid.parse(m[1]);
    } catch (e) {
      const line = src.slice(0, m.index).split('\n').length;
      failures.push(
        `${path.relative(ROOT, file)}:${line}  ${String((e as Error).message ?? e)
          .split('\n')
          .slice(0, 3)
          .join(' | ')}`
      );
    }
  }
}

if (failures.length) {
  console.error(
    `✖ ${failures.length} of ${total} mermaid diagrams failed to parse:\n` + failures.join('\n')
  );
  process.exit(1);
}
console.log(`✔ All ${total} mermaid diagrams parse.`);
