import { FORMAT_ORDER } from './formats';
import type { Importance, QuestionSummary } from './types';

/**
 * Landing pages for the highest-volume searches ("react interview questions", "css interview
 * questions", "senior frontend interview questions"…). Each one is a curated view of existing
 * questions with its own intro, so it can rank for that search without duplicating a format page
 * (`/questions/javascript` already targets "javascript coding interview questions", etc.).
 */
export interface Landing {
  slug: string;
  /** Short label for links ("React"). */
  name: string;
  /** Page heading (H1). */
  heading: string;
  /** Meta title, without the brand suffix. The question count is appended. */
  title: string;
  description: string;
  intro: string;
  /** "How to prepare" checklist. */
  prepare: string[];
  match: (q: QuestionSummary) => boolean;
}

export const LANDINGS: Landing[] = [
  {
    slug: 'react',
    name: 'React',
    heading: 'React Interview Questions',
    title: 'React Interview Questions & Answers for Senior Developers',
    description:
      'React interview questions with answers: hooks, rendering, state, effects and performance, plus React machine coding questions you can build in the browser.',
    intro:
      'Senior React interviews test two things: how well you understand what React does under the hood (rendering, reconciliation, hooks, effects and state) and whether you can build a real, accessible component under time pressure. This list mixes both: concept questions with interview-ready answers and machine coding questions you solve in a live React editor.',
    prepare: [
      'Explain the render cycle: what triggers a re-render, and how keys, memoization and context affect it.',
      'Know the rules and pitfalls of useEffect, useMemo, useCallback and useRef, and when not to use them.',
      'Practise building components end to end: state, keyboard support, ARIA roles and edge cases.',
      'Be ready to discuss state management trade-offs: local state, context, reducers and external stores.',
    ],
    match: (q) => q.quizCategory === 'react' || q.format === 'user-interface',
  },
  {
    slug: 'javascript',
    name: 'JavaScript',
    heading: 'JavaScript Interview Questions',
    title: 'JavaScript Interview Questions & Answers for Frontend Developers',
    description:
      'JavaScript interview questions with answers and code: closures, this, prototypes, the event loop and promises, plus polyfills and utilities to implement.',
    intro:
      'JavaScript rounds are where most frontend interviews start. Expect concept questions (closures, scope, this, prototypes, the event loop, promises) and coding questions where you implement a utility or polyfill such as debounce, Promise.all or deep clone. Every coding question here comes with tests you can run in the browser.',
    prepare: [
      'Be able to explain closures, scope, hoisting and this with a short code example.',
      'Trace the event loop: microtasks vs macrotasks, promises, async/await and timers.',
      'Implement the classics from memory: debounce, throttle, Promise.all, deep clone, curry, memoize.',
      'Talk through edge cases and complexity before you start coding.',
    ],
    match: (q) => q.quizCategory === 'javascript' || q.format === 'javascript',
  },
  {
    slug: 'typescript',
    name: 'TypeScript',
    heading: 'TypeScript Interview Questions',
    title: 'TypeScript Interview Questions & Answers',
    description:
      'TypeScript interview questions with answers: generics, utility types, narrowing, type inference, declaration files and typing React components.',
    intro:
      'TypeScript questions show up in almost every modern frontend loop, usually as concept questions about the type system or as part of a coding round. These questions cover generics, narrowing, utility and conditional types, inference and how to type real application code.',
    prepare: [
      'Explain the difference between type and interface, and between unknown, any and never.',
      'Write a small generic function and a custom utility type with conditional and mapped types.',
      'Know how narrowing works: type guards, discriminated unions and exhaustive checks.',
    ],
    match: (q) => q.quizCategory === 'typescript',
  },
  {
    slug: 'css',
    name: 'CSS',
    heading: 'CSS Interview Questions',
    title: 'CSS Interview Questions & Answers',
    description:
      'CSS interview questions with answers: the box model, specificity, the cascade, flexbox, grid, positioning, stacking context and responsive design.',
    intro:
      'CSS questions test whether you understand how the browser lays out a page, not whether you have memorised properties. These questions cover the box model, specificity and the cascade, flexbox and grid, positioning and stacking contexts, and responsive and accessible styling.',
    prepare: [
      'Explain how specificity and the cascade decide which rule wins.',
      'Know when to reach for flexbox vs grid, and how to centre anything both ways.',
      'Understand positioning, stacking contexts and what creates a new one.',
    ],
    match: (q) => q.quizCategory === 'css',
  },
  {
    slug: 'html',
    name: 'HTML',
    heading: 'HTML Interview Questions',
    title: 'HTML Interview Questions & Answers',
    description:
      'HTML interview questions with answers: semantic markup, accessibility, forms, script loading, metadata and how the browser parses a document.',
    intro:
      'HTML questions are often where interviewers check your accessibility and fundamentals: semantic elements, forms, script loading, metadata and how the browser turns markup into a page. Senior candidates are expected to connect markup choices to accessibility, performance and SEO.',
    prepare: [
      'Pick the right semantic element and explain what it gives assistive technology.',
      'Know the difference between async and defer scripts and how they affect parsing.',
      'Build an accessible form: labels, errors, validation and keyboard support.',
    ],
    match: (q) => q.quizCategory === 'html' || q.topics.includes('html'),
  },
  {
    slug: 'senior-frontend',
    name: 'Senior frontend',
    heading: 'Senior Frontend Interview Questions',
    title: 'Senior Frontend Developer Interview Questions',
    description:
      'The highest-value senior frontend interview questions: JavaScript and React coding, browser and performance concepts, and frontend system design.',
    intro:
      'Senior frontend interviews go deeper than definitions. Interviewers want production-quality code, clear trade-offs and an understanding of performance, accessibility and architecture. This list collects the questions marked highest importance across JavaScript, React and UI coding, algorithms, quizzes and system design.',
    prepare: [
      'Write clean, tested code and talk through edge cases as you go.',
      'Explain performance and accessibility decisions, not just the happy path.',
      'Practise at least one frontend system design end to end: requirements, architecture, data, API and optimisations.',
      'Follow a study plan so you cover every round, not just your favourite one.',
    ],
    match: (q) => q.importance === 'high' && q.format !== 'behavioral',
  },
  {
    slug: 'lead-frontend-engineer',
    name: 'Lead frontend engineer',
    heading: 'Lead Frontend Engineer Interview Questions',
    title: 'Lead & Staff Frontend Engineer Interview Questions',
    description:
      'Interview questions for lead and staff frontend engineers: frontend system design, architecture, and behavioral and leadership questions with answer guidance.',
    intro:
      'Lead and staff frontend loops shift weight from coding to system design and leadership. You will be asked to design applications and components at scale, and to talk about how you set direction, raise the quality bar, handle conflict and grow other engineers. This list covers both rounds.',
    prepare: [
      'Practise system design with a framework: requirements, architecture, data model, API, then optimisations.',
      'Prepare five or six STAR stories that show impact beyond your own code.',
      'Have examples of technical decisions you drove: RFCs, migrations, design systems or platform work.',
    ],
    match: (q) => q.format === 'system-design' || q.format === 'behavioral',
  },
];

export const getLanding = (slug: string) => LANDINGS.find((l) => l.slug === slug);

const IMPORTANCE_RANK: Record<Importance, number> = { high: 0, mid: 1, low: 2 };

/** A landing's questions: most important first, then by round (format order), then catalog order. */
export const landingQuestions = <Q extends QuestionSummary>(l: Landing, questions: readonly Q[]) =>
  questions
    .filter(l.match)
    .map((q, i) => ({ q, i }))
    .sort(
      (a, b) =>
        IMPORTANCE_RANK[a.q.importance] - IMPORTANCE_RANK[b.q.importance] ||
        FORMAT_ORDER.indexOf(a.q.format) - FORMAT_ORDER.indexOf(b.q.format) ||
        a.i - b.i
    )
    .map((x) => x.q);
