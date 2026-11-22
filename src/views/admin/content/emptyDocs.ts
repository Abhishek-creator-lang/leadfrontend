import type {
  CompanyDoc,
  ContentType,
  FocusAreaDoc,
  GuideDoc,
  QuestionDoc,
  StudyPlanDoc,
} from '@/lib/validation/content';

/**
 * Starting documents for "New …" editors. Plain module (no 'use client') so the server page can pass
 * these values to the client editor.
 */

/** Starter files for a new coding question of the given format. */
export function defaultFiles(format: string): Record<string, string> {
  if (format === 'user-interface') {
    return {
      'starter/App.js': 'export default function App() {\n  return <div>TODO</div>;\n}\n',
      'solution/App.js': 'export default function App() {\n  return <div>Done</div>;\n}\n',
      'App.test.js':
        "import { render, screen } from '@testing-library/react';\nimport App from './App';\n\ntest('renders', () => {\n  render(<App />);\n  expect(screen.getByText('Done')).toBeTruthy();\n});\n",
    };
  }
  return {
    'starter/index.js': 'export default function solve(input) {\n  // TODO\n}\n',
    'solution/index.js': 'export default function solve(input) {\n  return input;\n}\n',
    'index.test.js':
      "import solve from './index';\n\ntest('returns the input', () => {\n  expect(solve(1)).toBe(1);\n});\n",
  };
}

export const EMPTY_QUESTION: QuestionDoc = {
  slug: '',
  format: 'javascript',
  title: '',
  excerpt: '',
  difficulty: 'medium',
  importance: 'mid',
  duration: 20,
  topics: [],
  frameworks: [],
  languages: ['js'],
  companies: [],
  source: { type: 'original' },
  references: [],
  prompt: '',
  solution: '',
  files: defaultFiles('javascript'),
};

export const EMPTY_GUIDE: GuideDoc = { id: '', title: '', description: '', icon: 'book', chapters: [] };

export const EMPTY_STUDY_PLAN: StudyPlanDoc = {
  id: '',
  title: '',
  subtitle: '',
  description: '',
  weeks: 4,
  hoursPerWeek: '5',
  audience: '',
  sections: [{ title: 'Week 1', description: '', questions: [] }],
};

export const EMPTY_FOCUS_AREA: FocusAreaDoc = { id: '', title: '', description: '', icon: 'code', questions: [] };

export const EMPTY_COMPANY: CompanyDoc = { slug: '', name: '', title: '', source: { type: 'original' }, body: '' };

export const EMPTY_DOCS: Partial<Record<ContentType, Record<string, unknown>>> = {
  question: EMPTY_QUESTION,
  guide: EMPTY_GUIDE,
  study_plan: EMPTY_STUDY_PLAN,
  focus_area: EMPTY_FOCUS_AREA,
  company: EMPTY_COMPANY,
};
