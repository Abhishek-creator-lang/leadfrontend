/**
 * Verifies coding content:
 *   1. Every solution/ passes its tests.
 *   2. Every starter/ FAILS its tests (proves the tests actually test something).
 *
 * Each question is copied to .verify-tmp/<variant>/<format>__<slug>/ with the test file next to the code,
 * so `import ... from './index'` / `'./App'` resolves to the variant under test.
 * Usage: npm run verify:content [-- <filter>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const filter = process.argv[2];
// Per-run folder so parallel runs (e.g. several authors verifying their own batch) don't clobber each other.
// Short folder name (hash of the filter): long filters exceeded the Windows path limit.
const TMP = path.join(
  ROOT,
  '.verify-tmp',
  `${filter ? createHash('sha1').update(filter).digest('hex').slice(0, 8) : 'all'}-${process.pid}`
);
const index = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/content/index.generated.json'), 'utf8')
);

type Q = { id: string; format: string; slug: string; files: string[]; hasTests: boolean };
// filter: comma-separated ids or id prefixes, e.g. "javascript/chunk,javascript/compact" or "algorithms/"
const filters = filter
  ? filter
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean)
  : [];
const coding: Q[] = index.questions.filter(
  (q: Q) =>
    q.hasTests &&
    (!filters.length || filters.some((f) => (f.endsWith('/') ? q.id.startsWith(f) : q.id === f)))
);
if (!coding.length) {
  console.error(
    'No questions with tests match the filter. Did you run `npx tsx scripts/build-index.ts --lenient`?'
  );
  process.exit(1);
}

fs.rmSync(TMP, { recursive: true, force: true });
for (const variant of ['solution', 'starter'] as const) {
  for (const q of coding) {
    const src = path.join(ROOT, 'content/questions', q.format, q.slug);
    const dest = path.join(TMP, variant, `${q.format}__${q.slug}`);
    fs.mkdirSync(dest, { recursive: true });
    for (const f of q.files) {
      if (f.startsWith(`${variant}/`)) {
        const out = path.join(dest, f.slice(variant.length + 1));
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.copyFileSync(path.join(src, f), out);
      } else if (/\.test\.jsx?$/.test(f)) {
        fs.copyFileSync(path.join(src, f), path.join(dest, f));
      }
    }
  }
}

fs.writeFileSync(
  path.join(TMP, 'vitest.config.mjs'),
  `export default {
  esbuild: { include: /\\.[jt]sx?$/, exclude: [], loader: 'jsx', jsx: 'automatic' },
  test: {
    globals: true,
    environment: 'jsdom',
    testTimeout: 10000,
    css: false,
    setupFiles: [${JSON.stringify(path.join(ROOT, 'scripts/verify-setup.mjs').split(path.sep).join('/'))}],
  },
};
`
);

type Result = { name: string; status: string };
function run(variant: 'solution' | 'starter'): Map<string, boolean> {
  const outFile = path.join(TMP, `${variant}.json`);
  try {
    execSync(
      `npx vitest run --root "${TMP}" --config "${path.join(TMP, 'vitest.config.mjs')}" --dir "${path.join(
        TMP,
        variant
      )}" --reporter=json --outputFile="${outFile}"`,
      { cwd: ROOT, stdio: ['ignore', 'ignore', 'pipe'] }
    );
  } catch {
    // non-zero exit is expected when tests fail; results are in the JSON file
  }
  const json = JSON.parse(fs.readFileSync(outFile, 'utf8'));
  const passed = new Map<string, boolean>();
  for (const r of json.testResults as Result[]) {
    const key = path.basename(path.dirname(r.name)).replace('__', '/');
    passed.set(key, r.status === 'passed');
  }
  return passed;
}

console.log(`Verifying ${coding.length} coding question(s)…`);
const sol = run('solution');
const start = run('starter');
const failures: string[] = [];
// Under heavy parallel load vitest occasionally drops a suite from its JSON report. Those are not
// failures of the content, so retry them in a smaller, separate run instead of misreporting them.
const noResult = coding.filter((q) => !sol.has(q.id) || !start.has(q.id)).map((q) => q.id);
for (const q of coding) {
  if (noResult.includes(q.id)) continue;
  if (sol.get(q.id) !== true) failures.push(`${q.id}: solution does NOT pass its tests`);
  if (start.get(q.id) !== false)
    failures.push(`${q.id}: starter unexpectedly passes (tests too weak)`);
}
if (noResult.length) {
  if (process.env.VERIFY_RETRY) {
    failures.push(...noResult.map((id) => `${id}: no test result reported (runner crashed?)`));
  } else {
    console.log(
      `Retrying ${noResult.length} question(s) with no reported result: ${noResult.join(', ')}`
    );
    try {
      execSync(`npx tsx scripts/verify-content.ts "${noResult.join(',')}"`, {
        cwd: ROOT,
        stdio: 'inherit',
        env: { ...process.env, VERIFY_RETRY: '1' },
      });
    } catch {
      failures.push(`retry failed for: ${noResult.join(', ')}`);
    }
  }
}
if (failures.length) {
  console.error('\n✖ ' + failures.join('\n✖ '));
  const rel = path.relative(ROOT, TMP).split(path.sep).join('/');
  console.error(
    `\nInspect with: npx vitest run --root ${rel} --config ${rel}/vitest.config.mjs --dir ${rel}/solution`
  );
  process.exit(1);
}
fs.rmSync(TMP, { recursive: true, force: true });
console.log(`✔ All ${coding.length} solutions pass and all starters fail.`);
