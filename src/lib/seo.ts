import type { Metadata } from 'next';
import { APP_NAME, PRODUCTION_URL } from '@/constants/app';
import { QUIZ_CATEGORY_LABEL } from '@/content/formats';
import type { Difficulty, Format, QuestionMeta } from '@/content/types';

/** Question fields used by SEO helpers (works with the slim client summary too). */
type QuestionSummary = Pick<
  QuestionMeta,
  'title' | 'excerpt' | 'format' | 'difficulty' | 'duration' | 'topics' | 'companies'
>;

/**
 * SEO helpers: absolute URLs, per-page metadata (canonical, Open Graph, Twitter, robots) and
 * schema.org builders for JSON-LD. Server-only by usage (metadata functions and server pages).
 */

/**
 * Public origin of the site, from APP_URL (trimmed, no trailing slash). Without APP_URL it falls
 * back to the production domain in production and to localhost in development.
 */
export const siteUrl = () =>
  (
    process.env.APP_URL?.trim() ||
    (process.env.NODE_ENV === 'production' ? PRODUCTION_URL : 'http://localhost:3100')
  ).replace(/\/+$/, '');

export const absoluteUrl = (path: string) =>
  `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`;

/** Trims to `max` characters on a word boundary, for meta descriptions (~155 chars show in results). */
export function clip(text: string, max = 155): string {
  const clean = text
    .replace(/\s+/g, ' ')
    .replace(/[`*_#>]/g, '')
    .trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : cut.length).replace(/[,.;:\s]+$/, '')}…`;
}

/** Text without Markdown code ticks, for titles and structured data. */
export const plain = (text: string) => text.replace(/`/g, '');

/** Default share image (src/app/opengraph-image.tsx). */
const OG_IMAGE = { url: '/opengraph-image', width: 1200, height: 630 };

/** Joins sentences, adding a period only where one is missing. */
export const sentences = (...parts: (string | undefined)[]) =>
  parts
    .map((p) => p?.trim())
    .filter(Boolean)
    .map((p) => (/[.!?…]$/.test(p!) ? p : `${p}.`))
    .join(' ');

/** Pages that must not appear in search results (auth, account, admin, personal pages). */
export const NOINDEX: Metadata['robots'] = { index: false, follow: true };

export function pageMetadata({
  title,
  description,
  path,
  type = 'website',
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}): Metadata {
  const desc = clip(description);
  return {
    title,
    description: desc,
    alternates: { canonical: path },
    // A page-level openGraph replaces the root one, so the share image is set explicitly.
    openGraph: {
      type,
      url: path,
      title,
      description: desc,
      siteName: APP_NAME,
      locale: 'en_US',
      images: [OG_IMAGE],
    },
    twitter: { card: 'summary_large_image', title, description: desc, images: [OG_IMAGE.url] },
    ...(noindex ? { robots: NOINDEX } : {}),
  };
}

// ---- schema.org (JSON-LD) ----

export type Crumb = { name: string; path: string };

export const breadcrumbLd = (crumbs: Crumb[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: absoluteUrl(c.path),
  })),
});

export const itemListLd = (name: string, items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  numberOfItems: items.length,
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    url: absoluteUrl(it.path),
  })),
});

export const siteLd = () => [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: APP_NAME,
    url: siteUrl(),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl()}/questions?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: APP_NAME,
    url: siteUrl(),
    logo: absoluteUrl('/icon-192.png'),
  },
];

// ---- Content-specific wording and schema ----

/** Search-friendly nouns per format: what people actually type ("javascript interview questions"). */
export const FORMAT_SEO: Record<Format, { list: string; resourceType: string }> = {
  javascript: { list: 'JavaScript Coding Interview Questions', resourceType: 'Coding exercise' },
  'user-interface': {
    list: 'React Machine Coding Interview Questions',
    resourceType: 'Coding exercise',
  },
  algorithms: {
    list: 'Algorithm Interview Questions for Frontend Engineers',
    resourceType: 'Coding exercise',
  },
  quiz: { list: 'Frontend Interview Questions and Answers', resourceType: 'Quiz' },
  'system-design': {
    list: 'Frontend System Design Interview Questions',
    resourceType: 'Case study',
  },
  behavioral: {
    list: 'Behavioral & Leadership Interview Questions',
    resourceType: 'Interview question',
  },
};

type TitleQuestion = Pick<QuestionMeta, 'title' | 'format' | 'quizCategory'>;

/**
 * Page title for a question, phrased the way people search for it
 * ("implement debounce in javascript", "progress bar react machine coding"). Kept short: Google
 * shows about 60 characters, so the search terms come first.
 */
export function questionTitle(q: TitleQuestion): string {
  const t = plain(q.title);
  switch (q.format) {
    case 'javascript':
      return `Implement ${t} in JavaScript – Interview Question`;
    case 'user-interface':
      return `${t} – React Machine Coding Question`;
    case 'algorithms':
      return `${t} in JavaScript – Interview Question`;
    case 'quiz':
      return `${t} – ${QUIZ_CATEGORY_LABEL[q.quizCategory ?? 'javascript']} Interview`;
    case 'system-design':
      return `Design ${t} – Frontend System Design`;
    case 'behavioral':
      return `${t} – Lead Behavioral Interview`;
  }
}

/** What the page gives the reader, appended to the question's own excerpt. */
const QUESTION_PROMISE: Record<Format, string> = {
  javascript: 'Step-by-step solution with tests you can run in the browser.',
  'user-interface': 'Code it in a live React editor and compare with a worked solution.',
  algorithms: 'Worked JavaScript solution with tests you can run in the browser.',
  quiz: 'Clear, interview-ready answer.',
  'system-design': 'Requirements, architecture, data model, API and optimizations.',
  behavioral: 'How to structure a STAR answer for senior and lead roles.',
};

export const questionDescription = (q: QuestionSummary): string =>
  sentences(plain(q.excerpt), QUESTION_PROMISE[q.format]);

const LEVEL: Record<Difficulty, string> = {
  easy: 'Beginner',
  medium: 'Intermediate',
  hard: 'Advanced',
};

const publisher = () => ({ '@type': 'Organization', name: APP_NAME, url: siteUrl() });

export const questionLd = (q: QuestionSummary, path: string) => ({
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: plain(q.title),
  description: plain(q.excerpt),
  url: absoluteUrl(path),
  learningResourceType: FORMAT_SEO[q.format].resourceType,
  educationalLevel: LEVEL[q.difficulty],
  timeRequired: `PT${q.duration}M`,
  keywords: [...q.topics, ...q.companies].join(', '),
  inLanguage: 'en',
  isAccessibleForFree: true,
  provider: publisher(),
});

export const articleLd = ({
  type = 'TechArticle',
  headline,
  description,
  path,
  partOf,
  dateModified,
}: {
  type?: 'TechArticle' | 'Article';
  headline: string;
  description: string;
  path: string;
  partOf?: { name: string; path: string };
  dateModified?: Date;
}) => ({
  '@context': 'https://schema.org',
  '@type': type,
  headline,
  description,
  url: absoluteUrl(path),
  mainEntityOfPage: absoluteUrl(path),
  inLanguage: 'en',
  isAccessibleForFree: true,
  author: publisher(),
  publisher: { ...publisher(), logo: { '@type': 'ImageObject', url: absoluteUrl('/apple-icon') } },
  ...(dateModified ? { dateModified: dateModified.toISOString() } : {}),
  ...(partOf
    ? { isPartOf: { '@type': 'CreativeWork', name: partOf.name, url: absoluteUrl(partOf.path) } }
    : {}),
});

export const faqLd = (items: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
});

/** First prose paragraph of a Markdown document (for meta descriptions). */
export function firstParagraph(md: string): string {
  return (
    md
      .split(/\n\s*\n/)
      .map((b) => b.trim())
      .find((b) => b && !/^(#|```|\||!\[|<|[-*] |\d+\. |>)/.test(b))
      ?.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') ?? ''
  );
}
