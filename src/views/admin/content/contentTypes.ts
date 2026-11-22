import type { ContentType } from '@/lib/validation/content';

/** How each content type appears in the admin CMS (URL segment, labels). */
export const CONTENT_TYPE_INFO: Record<
  ContentType,
  { segment: string; label: string; singular: string; description: string; creatable: boolean }
> = {
  question: {
    segment: 'questions',
    label: 'Questions',
    singular: 'question',
    description: 'Coding, quiz, system design and behavioral questions.',
    creatable: true,
  },
  guide: {
    segment: 'guides',
    label: 'Guides',
    singular: 'guide',
    description: 'Playbooks and their chapters.',
    creatable: true,
  },
  study_plan: {
    segment: 'study-plans',
    label: 'Study plans',
    singular: 'study plan',
    description: 'Schedules made of sections of questions.',
    creatable: true,
  },
  focus_area: {
    segment: 'focus-areas',
    label: 'Focus areas',
    singular: 'focus area',
    description: 'Topic-based question lists.',
    creatable: true,
  },
  company: {
    segment: 'companies',
    label: 'Company guides',
    singular: 'company guide',
    description: "What each company's interview loop looks like.",
    creatable: true,
  },
  taxonomy: {
    segment: 'tags',
    label: 'Topics & companies',
    singular: 'tag list',
    description: 'The tags offered when editing questions.',
    creatable: false,
  },
};

export const CONTENT_TYPE_ORDER: ContentType[] = [
  'question',
  'guide',
  'study_plan',
  'focus_area',
  'company',
  'taxonomy',
];

export const typeFromSegment = (segment: string): ContentType | undefined =>
  CONTENT_TYPE_ORDER.find((t) => CONTENT_TYPE_INFO[t].segment === segment);

export const contentListPath = (type: ContentType) => `/admin/content/${CONTENT_TYPE_INFO[type].segment}`;
export const contentEditPath = (type: ContentType, id: string) => `${contentListPath(type)}/${id}`;
export const contentNewPath = (type: ContentType) => `${contentListPath(type)}/new`;

export const STATUS_INFO = {
  draft: { label: 'Draft', color: 'default' },
  published: { label: 'Published', color: 'success' },
  changed: { label: 'Unpublished changes', color: 'warning' },
  archived: { label: 'Archived', color: 'default' },
} as const;
