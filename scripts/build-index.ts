/**
 * Walks /content, validates every item and writes src/content/index.generated.json.
 * Exits 1 on any schema error or dangling reference so bad content never ships.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontMatter } from './frontmatter';
import { metaSchema, studyPlanSchema, focusAreaSchema, guideSchema, sourceSchema } from './schema';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'content');
const errors: string[] = [];

const readJson = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'));
const listDirs = (p: string) =>
  fs.existsSync(p)
    ? fs
        .readdirSync(p, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
    : [];
const walkFiles = (dir: string, base = dir): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name);
    return d.isDirectory()
      ? walkFiles(full, base)
      : [path.relative(base, full).split(path.sep).join('/')];
  });

// ---- questions
const questions: { id: string }[] = [];
for (const format of listDirs(path.join(CONTENT, 'questions'))) {
  for (const slug of listDirs(path.join(CONTENT, 'questions', format))) {
    const dir = path.join(CONTENT, 'questions', format, slug);
    const id = `${format}/${slug}`;
    const metaPath = path.join(dir, 'meta.json');
    if (!fs.existsSync(metaPath)) {
      errors.push(`${id}: missing meta.json`);
      continue;
    }
    let rawMeta: unknown;
    try {
      rawMeta = readJson(metaPath);
    } catch (e) {
      errors.push(`${id}: invalid JSON in meta.json (${(e as Error).message})`);
      continue;
    }
    const parsed = metaSchema.safeParse(rawMeta);
    if (!parsed.success) {
      errors.push(
        `${id}: ${parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`
      );
      continue;
    }
    const meta = parsed.data;
    if (meta.slug !== slug || meta.format !== format)
      errors.push(`${id}: slug/format mismatch with folder`);
    const files = walkFiles(dir).filter((f) => f !== 'meta.json');
    if (!files.includes('solution.md')) errors.push(`${id}: missing solution.md`);
    if (format !== 'quiz' && !files.includes('prompt.md')) errors.push(`${id}: missing prompt.md`);
    const hasStarter = files.some((f) => f.startsWith('starter/'));
    const hasTests = files.some((f) => /\.test\.jsx?$/.test(f));
    if (format === 'javascript' || format === 'algorithms') {
      for (const req of ['starter/index.js', 'solution/index.js', 'index.test.js'])
        if (!files.includes(req)) errors.push(`${id}: missing ${req}`);
    }
    if (format === 'user-interface') {
      for (const req of ['starter/App.js', 'solution/App.js'])
        if (!files.includes(req)) errors.push(`${id}: missing ${req}`);
    }
    if (format === 'quiz' && !meta.quizCategory) errors.push(`${id}: quiz needs quizCategory`);
    if (format === 'system-design' && !meta.sdType)
      errors.push(`${id}: system design needs sdType`);
    questions.push({ ...meta, id, hasStarter, hasTests, files });
  }
}
const ids = new Set(questions.map((q) => q.id));

// ---- study plans / focus areas
const checkRefs = (owner: string, refs: string[]) => {
  for (const r of refs) if (!ids.has(r)) errors.push(`${owner}: unknown question "${r}"`);
};
const spPath = path.join(CONTENT, 'study-plans.json');
const studyPlans = fs.existsSync(spPath)
  ? (readJson(spPath) as unknown[]).map((p) => {
      const sp = studyPlanSchema.parse(p);
      sp.sections.forEach((s) => checkRefs(`study-plan ${sp.id}`, s.questions));
      return sp;
    })
  : [];
const faPath = path.join(CONTENT, 'focus-areas.json');
const focusAreas = fs.existsSync(faPath)
  ? (readJson(faPath) as unknown[]).map((f) => {
      const fa = focusAreaSchema.parse(f);
      checkRefs(`focus-area ${fa.id}`, fa.questions);
      return fa;
    })
  : [];

// ---- guides
const guidesDir = path.join(CONTENT, 'guides');
const guidesJson = path.join(guidesDir, 'guides.json');
const guides = fs.existsSync(guidesJson)
  ? (readJson(guidesJson) as unknown[]).map((g) => {
      const guide = guideSchema.parse(g);
      const dir = path.join(guidesDir, guide.id);
      const chapters = (fs.existsSync(dir) ? fs.readdirSync(dir) : [])
        .filter((f) => f.endsWith('.md'))
        .sort()
        .map((f) => {
          const { data } = parseFrontMatter(fs.readFileSync(path.join(dir, f), 'utf8'));
          const m = f.match(/^(\d+)-(.+)\.md$/);
          if (!m || !data.title)
            errors.push(`guide ${guide.id}/${f}: need NN-slug.md name and title front-matter`);
          return {
            guide: guide.id,
            slug: m ? m[2] : f,
            order: m ? Number(m[1]) : 0,
            title: String(data.title ?? f),
            description: String(data.description ?? ''),
            source: sourceSchema.parse({ type: data.source ?? 'original', url: data.sourceUrl }),
          };
        });
      return { ...guide, chapters };
    })
  : [];

// ---- companies
const compDir = path.join(CONTENT, 'companies');
const companies = fs.existsSync(compDir)
  ? fs
      .readdirSync(compDir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => {
        const { data } = parseFrontMatter(fs.readFileSync(path.join(compDir, f), 'utf8'));
        return {
          slug: f.replace(/\.md$/, ''),
          title: String(data.title ?? f),
          name: String(data.name ?? f),
          source: sourceSchema.parse({ type: data.source ?? 'original', url: data.sourceUrl }),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  : [];

// --lenient: still write an index of the valid items (used while several authors work in parallel).
const lenient = process.argv.includes('--lenient');
if (errors.length) {
  console.error(
    `\n✖ Content index has ${errors.length} error(s):\n` + errors.map((e) => '  - ' + e).join('\n')
  );
  if (!lenient) process.exit(1);
}

const out = {
  generatedAt: new Date().toISOString(),
  questions,
  studyPlans,
  focusAreas,
  guides,
  companies,
};
const target = path.join(ROOT, 'src/content/index.generated.json');
// write atomically so concurrent runs never leave a half-written file
const tmp = `${target}.${process.pid}.tmp`;
fs.writeFileSync(tmp, JSON.stringify(out));
fs.renameSync(tmp, target);
console.log(
  `✔ Indexed ${questions.length} questions, ${studyPlans.length} study plans, ${focusAreas.length} focus areas, ` +
    `${guides.length} guides, ${companies.length} company guides`
);
