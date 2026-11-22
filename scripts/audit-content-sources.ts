/**
 * Read-only audit of content provenance, to guide rewording in the CMS.
 *
 *   npm run audit:content
 *
 * Reports:
 *  (a) questions whose title matches a line from content-plan/quiz-*-titles.txt word for word
 *      (those lists came from GreatFrontEnd's unlicensed public repos; reword these titles);
 *  (b) slugs that reuse GreatFrontEnd-style catalog names (consider renaming);
 *  (c) imported (non-original) items without a source URL (attribution gap);
 *  (d) "GreatFrontEnd" mentions in prose rather than links (check for implied affiliation).
 * Changes nothing.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'content');
const PLAN = path.join(ROOT, 'content-plan');

/** Names coined by GreatFrontEnd's catalog (plus any "-ii" style sequel). */
const GFE_STYLE = new Set([
  'javascript/array-prototype-square',
  'javascript/data-merging',
  'javascript/data-selection',
  'javascript/backbone-model',
  'javascript/type-utilities',
]);

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[`'"’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });

// Checklist titles: "1|Title|Level".
const checklist = new Set(
  fs
    .readdirSync(PLAN)
    .filter((f) => /^quiz-.*-titles\.txt$/.test(f))
    .flatMap((f) => fs.readFileSync(path.join(PLAN, f), 'utf8').split(/\r?\n/))
    .map((l) => l.split('|')[1])
    .filter(Boolean)
    .map(norm)
);

type Meta = { title: string; source?: { type: string; url?: string } };
const questions = walk(path.join(CONTENT, 'questions'))
  .filter((f) => f.endsWith('meta.json'))
  .map((f) => {
    const id = path
      .relative(path.join(CONTENT, 'questions'), path.dirname(f))
      .split(path.sep)
      .join('/');
    return { id, meta: JSON.parse(fs.readFileSync(f, 'utf8')) as Meta };
  });

const verbatim = questions.filter((q) => checklist.has(norm(q.meta.title)));
const gfeStyle = questions.filter((q) => GFE_STYLE.has(q.id) || /-(ii|iii|iv)$/.test(q.id));
const noSourceUrl = questions.filter(
  (q) => q.meta.source && q.meta.source.type !== 'original' && !q.meta.source.url
);

// Markdown files (guides, companies, prompts, solutions) with source frontmatter or prose mentions.
const mdFiles = walk(CONTENT).filter((f) => f.endsWith('.md'));
const mdNoSourceUrl = mdFiles.filter((f) => {
  const fm = fs.readFileSync(f, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  return /source:\s*(mit-[\w-]+)/.test(fm) && !/sourceUrl:\s*\S+/.test(fm);
});
const proseMentions = mdFiles.flatMap((f) =>
  fs
    .readFileSync(f, 'utf8')
    .split(/\r?\n/)
    .map((line, i) => ({ line, i }))
    .filter(({ line }) =>
      /greatfrontend/i.test(line.replace(/\[[^\]]*\]\([^)]*\)/g, '').replace(/https?:\/\/\S+/g, ''))
    )
    .map(({ line, i }) => `${path.relative(ROOT, f)}:${i + 1}  ${line.trim().slice(0, 100)}`)
);

const section = (title: string, items: string[]) => {
  console.log(`\n## ${title} (${items.length})`);
  for (const it of items) console.log(`- ${it}`);
};

console.log(
  `# Content source audit\n\nQuestions: ${questions.length}. Checklist titles: ${checklist.size}.`
);
section(
  '(a) Titles copied word for word from the GreatFrontEnd checklist: reword',
  verbatim.map((q) => `${q.id}  "${q.meta.title}"`)
);
section(
  '(b) GreatFrontEnd-style question names: consider renaming',
  gfeStyle.map((q) => `${q.id}  "${q.meta.title}"`)
);
section('(c) Imported content without a source URL: add attribution', [
  ...noSourceUrl.map((q) => q.id),
  ...mdNoSourceUrl.map((f) => path.relative(ROOT, f)),
]);
section('(d) "GreatFrontEnd" in prose (not links): check wording', proseMentions);
