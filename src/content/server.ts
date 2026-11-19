import 'server-only';
import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { stripFrontMatter } from './index';
import type { QuestionMeta } from './types';

const CONTENT_DIR = path.join(process.cwd(), 'content');

async function readOrNull(file: string) {
  try {
    return await readFile(file, 'utf8');
  } catch {
    return null;
  }
}

/** Raw files for a question folder, keyed by their path relative to the folder. */
export async function loadQuestionFiles(q: QuestionMeta): Promise<Record<string, string>> {
  const base = path.join(CONTENT_DIR, 'questions', q.format, q.slug);
  const entries = await Promise.all(q.files.map(async (f) => [f, (await readOrNull(path.join(base, f))) ?? ''] as const));
  return Object.fromEntries(entries);
}

export async function loadGuideChapter(guide: string, slug: string) {
  const dir = path.join(CONTENT_DIR, 'guides', guide);
  let files: string[];
  try {
    files = await readdir(dir);
  } catch {
    return null;
  }
  const file = files.find((f) => f.endsWith(`${slug}.md`));
  if (!file) return null;
  const src = await readOrNull(path.join(dir, file));
  return src === null ? null : stripFrontMatter(src);
}

export async function loadCompany(slug: string) {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  const src = await readOrNull(path.join(CONTENT_DIR, 'companies', `${slug}.md`));
  return src === null ? null : stripFrontMatter(src);
}
