/**
 * Generates content/study-plans.json and content/focus-areas.json from the content index.
 * Curated lists (Lead 75, 1 week, …) are explicit; long plans and focus areas are derived from
 * formats/topics so new content is picked up automatically. Unknown ids are dropped with a warning.
 *
 * Usage: npx tsx scripts/build-index.ts --lenient && npx tsx scripts/generate-plans.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Q = {
  id: string;
  format: string;
  slug: string;
  difficulty: 'easy' | 'medium' | 'hard';
  importance: 'low' | 'mid' | 'high';
  topics: string[];
  quizCategory?: string;
  sdType?: string;
  source: { type: string };
};

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const index = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/content/index.generated.json'), 'utf8')
);
const all: Q[] = index.questions;
const byId = new Map(all.map((q) => [q.id, q]));
const missing = new Set<string>();

const ids = (format: string, slugs: string[]) =>
  slugs
    .map((s) => `${format}/${s}`)
    .filter((id) => {
      if (byId.has(id)) return true;
      missing.add(id);
      return false;
    });

const DIFF = { easy: 0, medium: 1, hard: 2 };
const IMP = { high: 0, mid: 1, low: 2 };
const rank = (a: Q, b: Q) =>
  IMP[a.importance] - IMP[b.importance] || DIFF[a.difficulty] - DIFF[b.difficulty];
const where = (pred: (q: Q) => boolean) =>
  all
    .filter(pred)
    .sort(rank)
    .map((q) => q.id);
const has = (q: Q, ...topics: string[]) => q.topics.some((t) => topics.includes(t.toLowerCase()));
const uniq = (list: string[]) => [...new Set(list)];

// ---------------------------------------------------------------- curated sets
const JS_CORE = ids('javascript', [
  'debounce',
  'throttle',
  'promise-all',
  'promise-any',
  'promisify',
  'map-async-limit',
  'promise-pool',
  'retry-with-backoff',
  'deep-clone',
  'deep-equal',
  'flatten',
  'memoize',
  'curry',
  'event-emitter',
  'classnames',
  'get-elements-by-class-name',
  'json-stringify',
  'lru-cache',
]);
const UI_CORE = ids('user-interface', [
  'todo-list',
  'tabs-ii-accessible',
  'accordion',
  'star-rating',
  'modal-dialog-ii-accessible-focus-trap',
  'data-table-ii-sort-filter',
  'autocomplete-typeahead',
  'image-carousel',
  'file-explorer',
  'nested-checkboxes',
  'progress-bars-ii-concurrent-limit',
  'tic-tac-toe',
  'transfer-list',
  'infinite-scroll-feed',
  'virtualized-list',
]);
const ALGO_CORE = ids('algorithms', [
  'two-sum',
  'valid-parentheses',
  'merge-intervals',
  'meeting-rooms-ii',
  'binary-search',
  'top-k-frequent',
  'number-of-islands',
  'topological-sort',
]);
const QUIZ_CORE = ids('quiz', [
  'explain-event-loop',
  'what-is-a-closure-and-how-why-would-you-use-one',
  'explain-how-this-works-in-javascript',
  'explain-how-prototypal-inheritance-works',
  'explain-event-delegation',
  'react-reconciliation',
  'useeffect-vs-uselayouteffect',
  'react-server-components',
  'optimize-react-context-rerenders',
  'react-usetransition-usedeferredvalue',
  'core-web-vitals-lcp-inp-cls',
  'critical-rendering-path',
  'xss-types-and-react-escaping',
  'http-caching-headers-strategy',
  'typescript-generics-and-constraints',
]);
const SD_CORE = ids('system-design', [
  'news-feed',
  'autocomplete',
  'chat-application',
  'e-commerce-marketplace',
  'photo-sharing',
  'collaborative-editor',
  'data-table-component',
  'modal-dialog-component',
  'design-system-at-scale',
  'micro-frontend-platform',
  'frontend-observability-platform',
  'web-performance-program',
]);
const BEH_CORE = ids('behavioral', [
  'tell-me-about-yourself-lead-edition',
  'project-you-led-end-to-end',
  'influencing-without-authority',
  'disagreement-with-a-product-manager',
  'production-incident-you-owned',
  'prioritizing-tech-debt-vs-features',
  'mentoring-an-underperformer',
  'setting-a-technical-vision',
  'technical-decision-you-would-make-differently',
  'questions-to-ask-the-interviewer',
]);

const format = (f: string) => where((q) => q.format === f);
const quizCat = (...cats: string[]) =>
  where((q) => q.format === 'quiz' && cats.includes(q.quizCategory ?? ''));
const minus = (list: string[], ...exclude: string[][]) => {
  const ex = new Set(exclude.flat());
  return list.filter((id) => !ex.has(id));
};
const chunk = <T>(arr: T[], n: number) =>
  Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

// ---------------------------------------------------------------- study plans
const lead75 = {
  id: 'lead-75',
  title: 'Lead 75',
  subtitle: 'The 75 highest-value questions for senior and lead front end interviews.',
  description:
    'A curated core list that covers every round of a senior or lead loop: JavaScript utilities and async control, accessible React components, the algorithms that show up in front end loops, the quiz topics interviewers probe hardest, system design (application, component and platform level), and the leadership stories every lead candidate needs. Start here if you only do one plan.',
  weeks: 6,
  hoursPerWeek: '8-10',
  audience: 'Senior / Lead / Staff',
  sections: [
    {
      title: 'JavaScript functions',
      description: 'Utilities and async primitives asked most often.',
      questions: JS_CORE.slice(0, 15),
    },
    {
      title: 'User interface coding',
      description: 'Accessible React components with real-world requirements.',
      questions: UI_CORE,
    },
    {
      title: 'Algorithmic coding',
      description: 'The DSA patterns front end loops actually use.',
      questions: ALGO_CORE,
    },
    {
      title: 'Quiz',
      description: 'Concepts you must explain crisply, with trade-offs.',
      questions: QUIZ_CORE,
    },
    {
      title: 'System design',
      description: 'Application, component and platform-level design.',
      questions: SD_CORE,
    },
    {
      title: 'Behavioral & leadership',
      description: 'Stories every lead candidate needs ready.',
      questions: BEH_CORE,
    },
  ],
};

const oneWeek = {
  id: 'one-week',
  title: '1 Week Plan',
  subtitle: 'Interview in a week? The essentials, day by day.',
  description:
    'A compressed plan for when the interview is close. Each day mixes one theme of coding with the concepts behind it, and the last two days go to system design and stories. Skim the playbooks first, then do these in order.',
  weeks: 1,
  hoursPerWeek: '15-20',
  audience: 'Anyone with an interview in ~7 days',
  sections: [
    {
      title: 'Day 1: JavaScript fundamentals',
      questions: [
        ...ids('quiz', [
          'explain-event-loop',
          'what-is-a-closure-and-how-why-would-you-use-one',
          'explain-how-this-works-in-javascript',
        ]),
        ...ids('javascript', ['debounce', 'throttle', 'function-prototype-bind']),
      ],
    },
    {
      title: 'Day 2: Async JavaScript',
      questions: [
        ...ids('quiz', ['what-are-promises-and-how-do-they-work', 'async-await-explained']),
        ...ids('javascript', ['promise-all', 'promise-any', 'promisify', 'map-async-limit']),
      ],
    },
    {
      title: 'Day 3: Utilities & DOM',
      questions: [
        ...ids('javascript', [
          'deep-clone',
          'flatten',
          'classnames',
          'get-elements-by-class-name',
          'event-emitter',
        ]),
        ...ids('quiz', ['explain-event-delegation']),
      ],
    },
    {
      title: 'Day 4: React fundamentals',
      questions: [
        ...ids('quiz', [
          'react-reconciliation',
          'useeffect-vs-uselayouteffect',
          'purpose-of-key-prop-in-react',
          'controlled-vs-uncontrolled-components',
        ]),
        ...ids('user-interface', ['todo-list', 'tabs-ii-accessible']),
      ],
    },
    {
      title: 'Day 5: React components',
      questions: ids('user-interface', [
        'accordion',
        'star-rating',
        'modal-dialog-ii-accessible-focus-trap',
        'data-table-ii-sort-filter',
        'autocomplete-typeahead',
      ]),
    },
    {
      title: 'Day 6: System design',
      questions: ids('system-design', [
        'news-feed',
        'autocomplete',
        'chat-application',
        'data-table-component',
      ]),
    },
    {
      title: 'Day 7: Leadership stories',
      questions: ids('behavioral', [
        'tell-me-about-yourself-lead-edition',
        'project-you-led-end-to-end',
        'influencing-without-authority',
        'production-incident-you-owned',
        'questions-to-ask-the-interviewer',
      ]),
    },
  ],
};

const oneMonthPool = {
  js: uniq([
    ...JS_CORE,
    ...format('javascript').filter((id) => byId.get(id)!.importance === 'high'),
  ]).slice(0, 32),
  ui: uniq([
    ...UI_CORE,
    ...format('user-interface').filter((id) => byId.get(id)!.importance === 'high'),
  ]).slice(0, 24),
  algo: uniq([
    ...ALGO_CORE,
    ...format('algorithms').filter((id) => byId.get(id)!.importance === 'high'),
  ]).slice(0, 16),
  quiz: uniq([...QUIZ_CORE, ...where((q) => q.format === 'quiz' && q.importance === 'high')]).slice(
    0,
    40
  ),
  sd: uniq([...SD_CORE, ...format('system-design')]).slice(0, 16),
  beh: uniq([
    ...BEH_CORE,
    ...format('behavioral').filter((id) => byId.get(id)!.importance === 'high'),
  ]).slice(0, 16),
};
const oneMonth = {
  id: 'one-month',
  title: '1 Month Plan',
  subtitle: 'A balanced four-week plan covering every round.',
  description:
    'Four themed weeks: JavaScript and async, React and UI coding, algorithms and the web platform, then system design and leadership. Each week mixes practice with the quiz concepts behind it so you can explain your code as well as write it.',
  weeks: 4,
  hoursPerWeek: '10-12',
  audience: 'Mid → Senior, Senior → Lead',
  sections: [
    {
      title: 'Week 1: JavaScript & async',
      questions: [...oneMonthPool.js.slice(0, 20), ...oneMonthPool.quiz.slice(0, 10)],
    },
    {
      title: 'Week 2: React & UI coding',
      questions: [...oneMonthPool.ui, ...oneMonthPool.quiz.slice(10, 22)],
    },
    {
      title: 'Week 3: Algorithms & web platform',
      questions: [
        ...oneMonthPool.algo,
        ...oneMonthPool.js.slice(20),
        ...oneMonthPool.quiz.slice(22),
      ],
    },
    {
      title: 'Week 4: System design & leadership',
      questions: [...oneMonthPool.sd, ...oneMonthPool.beh],
    },
  ],
};

const coding = [...format('javascript'), ...format('user-interface'), ...format('algorithms')];
const threeMonthsSections = [
  ...chunk(format('javascript'), Math.ceil(format('javascript').length / 3)).map((qs, i) => ({
    title: `Weeks ${i + 1}: JavaScript functions (part ${i + 1})`,
    questions: qs,
  })),
  ...chunk(format('user-interface'), Math.ceil(format('user-interface').length / 3)).map(
    (qs, i) => ({ title: `Weeks ${i + 4}: React UI coding (part ${i + 1})`, questions: qs })
  ),
  { title: 'Week 7: Algorithms', questions: format('algorithms') },
  { title: 'Week 8: JavaScript & TypeScript quiz', questions: quizCat('javascript', 'typescript') },
  { title: 'Week 9: React quiz', questions: quizCat('react') },
  {
    title: 'Week 10: Web platform, CSS, HTML, performance & security',
    questions: quizCat('web', 'css', 'html', 'performance', 'security'),
  },
  { title: 'Week 11: System design', questions: format('system-design') },
  { title: 'Week 12: Behavioral & leadership', questions: format('behavioral') },
].map((s, i) => ({ ...s, title: s.title.replace(/^Weeks? \d+/, `Week ${i + 1}`) }));
const threeMonths = {
  id: 'three-months',
  title: '3 Months Plan',
  subtitle: 'Everything in the question bank, in a sensible order.',
  description: `The complete bank (${all.length} questions) in twelve weekly blocks. Coding first, since it takes the longest to build fluency, then concepts, then system design and leadership. Mark what you already know as complete to keep it moving.`,
  weeks: 12,
  hoursPerWeek: '10-15',
  audience: 'Thorough preparation / career switch into senior roles',
  sections: threeMonthsSections,
};

const leadTrack = {
  id: 'senior-lead-track',
  title: 'Senior & Lead Track (8 weeks)',
  subtitle: 'For the parts of a lead loop that coding practice does not cover.',
  description:
    'Lead and staff loops weigh architecture, system design depth, and leadership as heavily as coding. This track goes through every system design question (application, component and platform), the performance/security/architecture concepts leads are expected to own, and the full behavioral bank. Pair it with the Senior & Lead Track guide.',
  weeks: 8,
  hoursPerWeek: '6-8',
  audience: 'Senior → Lead / Staff',
  sections: [
    {
      title: 'Weeks 1–2: Application system design',
      questions: where((q) => q.format === 'system-design' && q.sdType === 'application'),
    },
    {
      title: 'Week 3: Component system design',
      questions: where((q) => q.format === 'system-design' && q.sdType === 'component'),
    },
    {
      title: 'Weeks 4–5: Platform & org-scale design',
      questions: where((q) => q.format === 'system-design' && q.sdType === 'lead'),
    },
    {
      title: 'Week 6: Performance, security & architecture concepts',
      questions: quizCat('performance', 'security').concat(
        ids('quiz', [
          'csr-ssr-ssg-isr-streaming',
          'islands-architecture-partial-hydration',
          'react-server-components',
          'react-streaming-ssr',
          'service-worker-lifecycle-and-updates',
          'source-maps-in-production',
        ])
      ),
    },
    { title: 'Weeks 7–8: Leadership & behavioral', questions: format('behavioral') },
  ],
};

const studyPlans = [lead75, oneWeek, oneMonth, threeMonths, leadTrack].map((p) => ({
  ...p,
  sections: p.sections
    .map((s) => ({ ...s, questions: uniq(s.questions) }))
    .filter((s) => s.questions.length),
}));

// ---------------------------------------------------------------- focus areas
const UI_DESIGN_SYSTEM = new Set([
  'accordion',
  'accordion-ii-single-open',
  'tabs',
  'tabs-ii-accessible',
  'modal-dialog',
  'modal-dialog-ii-accessible-focus-trap',
  'dropdown-menu',
  'tooltip-and-popover',
  'toast-notifications',
  'star-rating',
  'date-picker',
  'autocomplete-typeahead',
  'data-table',
  'data-table-ii-sort-filter',
  'data-table-iii-generic-columns',
  'image-carousel',
  'progress-bar',
  'auth-code-input',
]);
const focusAreas = [
  {
    id: 'accessibility',
    title: 'Accessibility',
    description:
      'ARIA patterns, keyboard support, focus management, semantic HTML and screen-reader behaviour.',
    icon: 'accessibility',
    questions: where((q) =>
      has(
        q,
        'accessibility',
        'aria',
        'focus-management',
        'focus management',
        'keyboard',
        'live-regions',
        'landmarks',
        'inert'
      )
    ),
  },
  {
    id: 'async-operations',
    title: 'Async Operations',
    description:
      'Promises, the event loop, timers, cancellation, concurrency limits and race conditions.',
    icon: 'async',
    questions: where((q) =>
      has(
        q,
        'async',
        'promises',
        'event-loop',
        'timers',
        'concurrency',
        'cancellation',
        'race-conditions',
        'race conditions'
      )
    ),
  },
  {
    id: 'data-structures-algorithms',
    title: 'Data Structures & Algorithms',
    description:
      'Arrays, hash maps, trees, graphs, heaps, intervals and dynamic programming in JavaScript.',
    icon: 'dsa',
    questions: [
      ...format('algorithms'),
      ...ids('javascript', ['lru-cache', 'undo-redo-stack', 'async-queue-with-priority']),
    ],
  },
  {
    id: 'design-system-components',
    title: 'Design System Components',
    description: 'Reusable, accessible components and the API design behind a component library.',
    icon: 'design-system',
    questions: [
      ...where((q) => q.format === 'user-interface' && UI_DESIGN_SYSTEM.has(q.slug)),
      ...where(
        (q) =>
          q.format === 'system-design' &&
          (q.sdType === 'component' || q.slug === 'design-system-at-scale')
      ),
    ],
  },
  {
    id: 'dom-manipulation',
    title: 'DOM Manipulation',
    description: 'Traversal, events, serialization and building a tiny virtual DOM.',
    icon: 'dom',
    questions: where((q) => has(q, 'dom', 'events', 'virtual-dom') && q.format !== 'behavioral'),
  },
  {
    id: 'forms',
    title: 'Forms',
    description:
      'Controlled inputs, validation, multi-step flows, accessibility and React 19 form actions.',
    icon: 'forms',
    questions: where((q) => has(q, 'forms', 'validation', 'controlled-components', 'actions')),
  },
  {
    id: 'javascript-polyfills',
    title: 'JavaScript Polyfills',
    description:
      'Re-implement built-ins (Array, Function, Promise, Object) to show you understand the spec.',
    icon: 'polyfills',
    questions: where(
      (q) =>
        q.format === 'javascript' &&
        (has(q, 'polyfills') ||
          /^(array-prototype|function-prototype|promise-|object-create|new-operator|instanceof)/.test(
            q.slug
          ))
    ),
  },
  {
    id: 'lodash-functions',
    title: 'Lodash Functions',
    description:
      'Classic utility functions: collections, objects, functional helpers and their edge cases.',
    icon: 'lodash',
    questions: where((q) => q.format === 'javascript' && has(q, 'lodash')),
  },
  {
    id: 'react-hooks',
    title: 'React Hooks',
    description: 'State, effects, refs, memoization, transitions and building your own hooks.',
    icon: 'hooks',
    questions: where(
      (q) =>
        (q.format === 'quiz' &&
          q.quizCategory === 'react' &&
          (has(q, 'hooks', 'effects', 'refs', 'memoization', 'use-reducer') ||
            /use[a-z]|hook/.test(q.slug))) ||
        (q.format === 'user-interface' && has(q, 'hooks', 'effects'))
    ),
  },
  {
    id: 'state-management',
    title: 'State Management',
    description:
      'Local vs global state, reducers, stores, context performance and server-state caching.',
    icon: 'state',
    questions: where(
      (q) =>
        has(
          q,
          'state-management',
          'reducers',
          'context',
          'derived-state',
          'immutability',
          'state-machines'
        ) || /store|flux|redux|state-vs/.test(q.slug)
    ),
  },
  {
    id: 'performance',
    title: 'Performance',
    description:
      'Core Web Vitals, rendering performance, virtualization, bundles, caching and measurement.',
    icon: 'performance',
    questions: where(
      (q) =>
        q.quizCategory === 'performance' ||
        has(q, 'performance', 'virtualization', 'core-web-vitals', 'core web vitals')
    ),
  },
  {
    id: 'security',
    title: 'Security',
    description: 'XSS, CSP, CSRF, auth token storage, supply chain and third-party script risks.',
    icon: 'security',
    questions: where(
      (q) => q.quizCategory === 'security' || has(q, 'security', 'xss', 'csp', 'csrf', 'auth')
    ),
  },
  {
    id: 'typescript',
    title: 'TypeScript',
    description:
      'The type system from narrowing to conditional and mapped types, plus typing React.',
    icon: 'code',
    questions: quizCat('typescript'),
  },
].map((f) => ({ ...f, questions: uniq(f.questions) }));

fs.writeFileSync(
  path.join(ROOT, 'content/study-plans.json'),
  JSON.stringify(studyPlans, null, 2) + '\n'
);
fs.writeFileSync(
  path.join(ROOT, 'content/focus-areas.json'),
  JSON.stringify(focusAreas, null, 2) + '\n'
);
for (const p of studyPlans)
  console.log(`plan ${p.id}: ${p.sections.reduce((n, s) => n + s.questions.length, 0)} questions`);
for (const f of focusAreas) console.log(`focus ${f.id}: ${f.questions.length}`);
if (missing.size)
  console.warn(`⚠ Dropped ${missing.size} unknown curated ids: ${[...missing].join(', ')}`);
void coding;
