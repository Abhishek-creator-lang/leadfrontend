/**
 * One-off importer for the MIT-licensed Front End Interview Handbook
 * (https://github.com/yangshun/front-end-interview-handbook, © Yangshun Tay, MIT).
 *
 * Usage: npx tsx scripts/import-handbook.ts <path-to-extracted-repo>
 *
 * - website/contents/{html,css,javascript}-questions.md → one quiz question per `###` heading
 * - website/contents/*.md (guides)                       → content/guides/<guide>/NN-slug.md
 * - website/contents/companies/*.md                      → content/companies/<slug>.md
 * Re-running overwrites only files it generated (quiz folders prefixed with the handbook slug list).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontMatter } from './frontmatter';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = process.argv[2];
if (!SRC) throw new Error('Pass the path to the extracted handbook repo');
const CONTENTS = path.join(SRC, 'website/contents');
const SITE = 'https://www.frontendinterviewhandbook.com';
const REPO = 'https://github.com/yangshun/front-end-interview-handbook/blob/main/website/contents';

/** Remove Docusaurus-only syntax and referral parameters. */
function clean(md: string): string {
  return (
    md
      // drop "Latest version on GreatFrontEnd" style admonitions entirely
      .replace(
        /:::(info|tip|note|caution|warning)[^\n]*\n[\s\S]*?(GreatFrontEnd|greatfrontend)[\s\S]*?\n:::\n?/g,
        ''
      )
      // convert remaining admonitions to blockquotes
      .replace(
        /:::(info|tip|note|caution|warning)\s*([^\n]*)\n([\s\S]*?)\n:::/g,
        (_m, kind: string, title: string, body: string) => {
          const head = `**${title.trim() || kind[0].toUpperCase() + kind.slice(1)}**`;
          return [head, ...body.trim().split('\n')].map((l) => `> ${l}`.trimEnd()).join('\n');
        }
      )
      .replace(/^import .*$/gm, '')
      .replace(/<TOCInline[^>]*\/>/g, '')
      .replace(/<[A-Z][A-Za-z]*[^>]*\/>/g, '')
      // strip tracking params
      .replace(/\?utm_source=[^)\s"]*/g, '')
      .replace(/&?gnrs=frontendinterviewhandbook/g, '')
      // site-relative links → absolute handbook links
      .replace(/\]\((\/[^)]+)\)/g, `](${SITE}$1)`)
      .replace(/\n{3,}/g, '\n\n')
      .trim() + '\n'
  );
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    // keep at most ~60 chars, cutting on a word boundary
    .replace(/^(.{0,60})(-.*)?$/, '$1');

// ---------- quiz
type QuizSrc = {
  file: string;
  category: 'html' | 'css' | 'javascript';
  page: string;
  languages: string[];
};
const QUIZ: QuizSrc[] = [
  { file: 'html-questions.md', category: 'html', page: 'html-questions', languages: ['html'] },
  { file: 'css-questions.md', category: 'css', page: 'css-questions', languages: ['css'] },
  {
    file: 'javascript-questions.md',
    category: 'javascript',
    page: 'javascript-questions',
    languages: ['js'],
  },
];

/** Handbook questions superseded by an original, more complete question in this app. */
const SKIP = new Set(['what-is-event-loop-what-is-the-difference-between-call-stack']);

let quizCount = 0;
const manifest: string[] = [];
for (const q of QUIZ) {
  const { body } = parseFrontMatter(fs.readFileSync(path.join(CONTENTS, q.file), 'utf8'));
  const parts = body.split(/^### /m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf('\n');
    const title = part.slice(0, nl).trim().replace(/\\/g, '');
    let answer = part.slice(nl + 1);
    // stop at the next h2 (section footer such as "Other answers")
    answer = answer.split(/^## /m)[0];
    const refs = [...answer.matchAll(/^#### References\s*\n([\s\S]*?)(?=\n#### |\n*$)/gm)]
      .flatMap((m) => [...m[1].matchAll(/https?:\/\/[^\s)>\]]+/g)].map((x) => x[0]))
      .filter((u) => !/greatfrontend/.test(u));
    answer = answer.replace(/^#### References\s*\n[\s\S]*?(?=\n#### |\n*$)/gm, '');
    const md = clean(answer.replace(/^####/gm, '###'));
    if (md.trim().length < 40) continue;
    const slug = slugify(title.replace(/[?.]+$/, ''));
    if (SKIP.has(slug)) continue;
    const dir = path.join(ROOT, 'content/questions/quiz', slug);
    if (fs.existsSync(path.join(dir, 'meta.json'))) {
      const existing = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
      if (existing.source?.type !== 'mit-handbook') continue; // never overwrite original content
    }
    fs.mkdirSync(dir, { recursive: true });
    const words = md.split(/\s+/).length;
    const meta = {
      slug,
      format: 'quiz',
      title: title.replace(/`/g, ''),
      excerpt: (
        md
          .replace(/```[\s\S]*?```/g, '')
          .replace(/[#>*_`|[\]]/g, '')
          .replace(/\(https?:[^)]*\)/g, '')
          .split('\n')
          .map((l) => l.trim())
          .find((l) => l.length > 30) ?? title
      ).slice(0, 160),
      difficulty: 'medium',
      importance: 'mid',
      duration: Math.max(3, Math.min(15, Math.round(words / 120))),
      topics: [q.category],
      frameworks: [],
      languages: q.languages,
      companies: [],
      quizCategory: q.category,
      source: { type: 'mit-handbook', url: `${SITE}/${q.page}` },
      references: [...new Set(refs)].slice(0, 6),
    };
    fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');
    fs.writeFileSync(path.join(dir, 'solution.md'), md);
    manifest.push(`quiz/${slug}`);
    quizCount++;
  }
}

// ---------- guides
const GUIDE_MAP: [string, string, string][] = [
  // [source file, guide id, target NN-slug]
  ['introduction.md', 'front-end-interview-playbook', '01-introduction'],
  ['javascript-utility-function.md', 'front-end-interview-playbook', '03-javascript-coding'],
  [
    'build-front-end-user-interfaces.md',
    'front-end-interview-playbook',
    '04-user-interface-coding',
  ],
  ['algorithms.md', 'front-end-interview-playbook', '05-algorithmic-coding'],
  ['trivia.md', 'front-end-interview-playbook', '06-quiz-questions'],
  ['front-end-system-design.md', 'front-end-system-design-playbook', '01-introduction'],
  [
    'front-end-system-design-applications.md',
    'front-end-system-design-playbook',
    '05-application-questions',
  ],
  [
    'front-end-system-design-ui-components.md',
    'front-end-system-design-playbook',
    '06-ui-component-questions',
  ],
  ['behavioral.md', 'behavioral-playbook', '01-introduction'],
  ['resume.md', 'resume-and-process', '01-resume'],
];
for (const [file, guide, target] of GUIDE_MAP) {
  const { data, body } = parseFrontMatter(fs.readFileSync(path.join(CONTENTS, file), 'utf8'));
  const title = String(data.sidebar_label ?? data.title ?? target).replace(/^"|"$/g, '');
  const fm = [
    '---',
    `title: ${title}`,
    `description: ${String(data.description ?? '').replace(/\n/g, ' ')}`,
    'source: mit-handbook',
    `sourceUrl: ${REPO}/${file}`,
    '---',
    '',
  ].join('\n');
  const out = path.join(ROOT, 'content/guides', guide, `${target}.md`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, fm + clean(body));
}

// ---------- companies
const compSrc = path.join(CONTENTS, 'companies');
let compCount = 0;
for (const file of fs.readdirSync(compSrc).filter((f) => f.endsWith('.md'))) {
  const { data, body } = parseFrontMatter(fs.readFileSync(path.join(compSrc, file), 'utf8'));
  const title = String(data.title ?? file);
  const name = title.replace(/ Front End Interview.*$/i, '').trim();
  const slug = file.replace(/-front-end-interview-questions\.md$/, '');
  const fm = [
    '---',
    `title: ${title}`,
    `name: ${name}`,
    'source: mit-handbook',
    `sourceUrl: ${REPO}/companies/${file}`,
    '---',
    '',
  ].join('\n');
  fs.mkdirSync(path.join(ROOT, 'content/companies'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'content/companies', `${slug}.md`), fm + clean(body));
  compCount++;
}

fs.writeFileSync(
  path.join(ROOT, 'scripts/.handbook-manifest.json'),
  JSON.stringify(manifest, null, 2)
);
console.log(
  `Imported ${quizCount} quiz questions, ${GUIDE_MAP.length} guide chapters, ${compCount} company guides.`
);
