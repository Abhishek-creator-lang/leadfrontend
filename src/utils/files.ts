/** Helpers for a question folder's file map (`{ 'starter/index.js': code, ... }`). */

export type FileMap = Record<string, string>;

const TEST_FILE = /\.test\.jsx?$/;

export const isTestFile = (name: string) => TEST_FILE.test(name);

const LANG_BY_EXT: Record<string, string> = {
  js: 'js',
  jsx: 'jsx',
  css: 'css',
  html: 'html',
  ts: 'ts',
};

const langFor = (name: string) => LANG_BY_EXT[name.split('.').pop() ?? ''] ?? '';

/** Sandpack file map from a question's `starter/` or `solution/` folder, plus its test files. */
export function buildSandpackFiles(files: FileMap, variant: 'starter' | 'solution'): FileMap {
  const prefix = `${variant}/`;
  const out: FileMap = {};
  for (const [name, code] of Object.entries(files)) {
    if (name.startsWith(prefix)) out[`/${name.slice(prefix.length)}`] = code;
    else if (isTestFile(name)) out[`/${name}`] = code;
  }
  return out;
}

/** The reference solution files rendered as fenced Markdown code blocks. */
export function solutionCodeMarkdown(files: FileMap) {
  const prefix = 'solution/';
  return Object.entries(files)
    .filter(([name]) => name.startsWith(prefix))
    .map(([name, code]) => {
      const fence = '```';
      return `**\`${name.slice(prefix.length)}\`**\n\n${fence}${langFor(name)}\n${code.trimEnd()}\n${fence}`;
    })
    .join('\n\n');
}
