import type { Format, QuizCategory } from './types';

/** Labels and descriptions per format. Colors live in the theme (`theme.palette.format`). */
export const FORMAT_INFO: Record<Format, { label: string; short: string; description: string }> = {
  javascript: {
    label: 'JavaScript Functions',
    short: 'JS Functions',
    description: 'Implement utility functions, polyfills and async helpers in JavaScript.',
  },
  'user-interface': {
    label: 'User Interface Coding',
    short: 'UI Coding',
    description: 'Build interactive, accessible components and small apps in React.',
  },
  algorithms: {
    label: 'Algorithmic Coding',
    short: 'Algorithms',
    description: 'Data structures and algorithms questions that show up in front end loops.',
  },
  quiz: {
    label: 'Quiz',
    short: 'Quiz',
    description: 'Short-answer trivia on JavaScript, React, HTML, CSS, TypeScript and the web platform.',
  },
  'system-design': {
    label: 'Front End System Design',
    short: 'System Design',
    description: 'Design applications and components end to end using the RADIO framework.',
  },
  behavioral: {
    label: 'Behavioral & Leadership',
    short: 'Behavioral',
    description: 'STAR stories and leadership scenarios for senior and lead roles.',
  },
};

export const FORMAT_ORDER: Format[] = [
  'javascript',
  'user-interface',
  'algorithms',
  'quiz',
  'system-design',
  'behavioral',
];

export const QUIZ_CATEGORY_LABEL: Record<QuizCategory, string> = {
  javascript: 'JavaScript',
  react: 'React',
  html: 'HTML',
  css: 'CSS',
  typescript: 'TypeScript',
  web: 'Web & Browser',
  performance: 'Performance',
  security: 'Security',
};

export const isCodingFormat = (f: Format) => f === 'javascript' || f === 'user-interface' || f === 'algorithms';

/** Type guard for untrusted strings such as route params. */
export const isFormat = (value: string): value is Format => (FORMAT_ORDER as string[]).includes(value);
