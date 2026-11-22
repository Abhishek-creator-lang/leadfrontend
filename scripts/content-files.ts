/**
 * Reads the file-based content archive (`content/`) into CMS documents, and writes documents back
 * (used by content:import and content:export).
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseFrontMatter } from './frontmatter';
import {
  companyDocSchema,
  focusAreaSchema,
  guideDocSchema,
  guideSchema,
  metaSchema,
  questionDocSchema,
  sourceSchema,
  studyPlanSchema,
  taxonomyDocSchema,
  type CompanyDoc,
  type FocusAreaDoc,
  type GuideDoc,
  type QuestionDoc,
  type StudyPlanDoc,
  type TaxonomyDoc,
} from '../src/lib/validation/content';

export interface ContentArchive {
  questions: QuestionDoc[];
  guides: GuideDoc[];
  studyPlans: StudyPlanDoc[];
  focusAreas: FocusAreaDoc[];
  companies: CompanyDoc[];
  taxonomy: TaxonomyDoc;
}

const readJson = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'));
const listDirs = (p: string) =>
  fs.existsSync(p)
    ? fs
        .readdirSync(p, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort()
    : [];
const walkFiles = (dir: string, base = dir): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name);
    return d.isDirectory()
      ? walkFiles(full, base)
      : [path.relative(base, full).split(path.sep).join('/')];
  });

const issues = (e: { issues: { path: (string | number)[]; message: string }[] }) =>
  e.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ');

/** Loads every content item from `contentDir`. Throws with a list of problems if any item is invalid. */
export function readArchive(contentDir: string): ContentArchive {
  const errors: string[] = [];

  const questions: QuestionDoc[] = [];
  for (const format of listDirs(path.join(contentDir, 'questions'))) {
    for (const slug of listDirs(path.join(contentDir, 'questions', format))) {
      const dir = path.join(contentDir, 'questions', format, slug);
      const id = `${format}/${slug}`;
      const meta = metaSchema.safeParse(readJson(path.join(dir, 'meta.json')));
      if (!meta.success) {
        errors.push(`${id}: ${issues(meta.error)}`);
        continue;
      }
      const files: Record<string, string> = {};
      let prompt = '';
      let solution = '';
      for (const f of walkFiles(dir)) {
        const code = fs.readFileSync(path.join(dir, f), 'utf8');
        if (f === 'meta.json') continue;
        else if (f === 'prompt.md') prompt = code;
        else if (f === 'solution.md') solution = code;
        else files[f] = code;
      }
      const doc = questionDocSchema.safeParse({ ...meta.data, prompt, solution, files });
      if (doc.success) questions.push(doc.data);
      else errors.push(`${id}: ${issues(doc.error)}`);
    }
  }

  const studyPlans = fs.existsSync(path.join(contentDir, 'study-plans.json'))
    ? (readJson(path.join(contentDir, 'study-plans.json')) as unknown[]).map((p) =>
        studyPlanSchema.parse(p)
      )
    : [];
  const focusAreas = fs.existsSync(path.join(contentDir, 'focus-areas.json'))
    ? (readJson(path.join(contentDir, 'focus-areas.json')) as unknown[]).map((f) =>
        focusAreaSchema.parse(f)
      )
    : [];

  const guidesDir = path.join(contentDir, 'guides');
  const guides: GuideDoc[] = fs.existsSync(path.join(guidesDir, 'guides.json'))
    ? (readJson(path.join(guidesDir, 'guides.json')) as unknown[]).map((g) => {
        const guide = guideSchema.parse(g);
        const dir = path.join(guidesDir, guide.id);
        const chapters = (fs.existsSync(dir) ? fs.readdirSync(dir) : [])
          .filter((f) => f.endsWith('.md'))
          .sort()
          .map((f) => {
            const { data, body } = parseFrontMatter(fs.readFileSync(path.join(dir, f), 'utf8'));
            return {
              slug: f.match(/^\d+-(.+)\.md$/)?.[1] ?? f.replace(/\.md$/, ''),
              title: String(data.title ?? f),
              description: String(data.description ?? ''),
              source: sourceSchema.parse({ type: data.source ?? 'original', url: data.sourceUrl }),
              body,
            };
          });
        return guideDocSchema.parse({ ...guide, chapters });
      })
    : [];

  const compDir = path.join(contentDir, 'companies');
  const companies: CompanyDoc[] = (fs.existsSync(compDir) ? fs.readdirSync(compDir) : [])
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const { data, body } = parseFrontMatter(fs.readFileSync(path.join(compDir, f), 'utf8'));
      return companyDocSchema.parse({
        slug: f.replace(/\.md$/, ''),
        title: String(data.title ?? f),
        name: String(data.name ?? f),
        source: sourceSchema.parse({ type: data.source ?? 'original', url: data.sourceUrl }),
        body,
      });
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // Every referenced question must exist.
  const ids = new Set(questions.map((q) => `${q.format}/${q.slug}`));
  const checkRefs = (owner: string, refs: string[]) => {
    for (const r of refs) if (!ids.has(r)) errors.push(`${owner}: unknown question "${r}"`);
  };
  studyPlans.forEach((p) =>
    p.sections.forEach((s) => checkRefs(`study plan ${p.id}`, s.questions))
  );
  focusAreas.forEach((f) => checkRefs(`focus area ${f.id}`, f.questions));

  if (errors.length) {
    throw new Error(
      `Content archive has ${errors.length} problem(s):\n  - ${errors.join('\n  - ')}`
    );
  }

  // Tag lists offered by the editor start as every tag in use today.
  const sorted = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b));
  const taxonomy = taxonomyDocSchema.parse({
    topics: sorted(questions.flatMap((q) => q.topics)),
    companies: sorted(questions.flatMap((q) => q.companies)),
  });

  return { questions, guides, studyPlans, focusAreas, companies, taxonomy };
}

const write = (file: string, content: string) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};

const frontMatter = (data: Record<string, string | undefined>) =>
  `---\n${Object.entries(data)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join('\n')}\n---\n`;

/** Writes documents to `contentDir` in the archive layout (inverse of readArchive). */
export function writeArchive(contentDir: string, archive: Omit<ContentArchive, 'taxonomy'>) {
  for (const q of archive.questions) {
    const dir = path.join(contentDir, 'questions', q.format, q.slug);
    fs.rmSync(dir, { recursive: true, force: true });
    const { prompt, solution, files, ...meta } = q;
    write(path.join(dir, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`);
    if (prompt) write(path.join(dir, 'prompt.md'), prompt);
    write(path.join(dir, 'solution.md'), solution);
    for (const [f, code] of Object.entries(files)) write(path.join(dir, f), code);
  }
  write(
    path.join(contentDir, 'study-plans.json'),
    `${JSON.stringify(archive.studyPlans, null, 2)}\n`
  );
  write(
    path.join(contentDir, 'focus-areas.json'),
    `${JSON.stringify(archive.focusAreas, null, 2)}\n`
  );
  write(
    path.join(contentDir, 'guides', 'guides.json'),
    `${JSON.stringify(
      archive.guides.map(({ chapters: _chapters, ...g }) => g),
      null,
      2
    )}\n`
  );
  for (const g of archive.guides) {
    const dir = path.join(contentDir, 'guides', g.id);
    fs.rmSync(dir, { recursive: true, force: true });
    g.chapters.forEach((c, i) => {
      const fm = frontMatter({
        title: c.title,
        description: c.description,
        source: c.source.type === 'original' ? undefined : c.source.type,
        sourceUrl: c.source.url,
      });
      write(path.join(dir, `${String(i + 1).padStart(2, '0')}-${c.slug}.md`), fm + c.body);
    });
  }
  for (const c of archive.companies) {
    const fm = frontMatter({
      title: c.title,
      name: c.name,
      source: c.source.type === 'original' ? undefined : c.source.type,
      sourceUrl: c.source.url,
    });
    write(path.join(contentDir, 'companies', `${c.slug}.md`), fm + c.body);
  }
}
