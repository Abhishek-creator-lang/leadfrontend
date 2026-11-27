import type { Grade } from './classify';

/**
 * Labelled fundamentals answers: what a human interviewer would grade them. grading.test.ts checks
 * the keyword grader agrees on at least 90% of them, so matcher changes can't quietly get worse.
 *
 * `aiOnly` marks answers that keywords cannot judge (wrong facts that use the right words, or
 * correct paraphrases with no shared terms). They are left out of the keyword score and are what
 * the optional on-device AI check is for.
 *
 * The paraphrase set at the end was used to test a small in-browser embedding model as a "meaning
 * check" (all-MiniLM-L6-v2 and bge-small). Neither beat keywords (78% agreement either way): they
 * rate topic similarity, not correctness, so wrong and partial answers scored as high as these.
 */
export interface GradingFixture {
  keyPoints: string[];
  answer: string;
  expected: Grade;
  kind: 'correct' | 'paraphrase' | 'partial' | 'list' | 'filler' | 'negated' | 'wrong' | 'trap';
  aiOnly?: boolean;
}

const EVENT_LOOP = ['call stack', 'event loop', 'microtask', 'macrotask'];
const CLOSURE = ['closure', 'lexical scope', 'outer function'];
const DEBOUNCE = ['debounce', 'throttle', 'last call', 'fixed interval'];
const CSP = ['Content Security Policy', 'XSS', 'script-src', 'nonce'];
const VDOM = ['virtual DOM', 'reconciliation', 'keys'];
const DELEGATION = ['event delegation', 'bubbling', 'event.target'];
const CORS = ['CORS', 'preflight', 'Access-Control-Allow-Origin', 'OPTIONS'];
const EFFECT = ['useEffect', 'dependency array', 'cleanup'];
const MEMO = ['memoization', 'cache', 'pure function'];
const SSR = ['server-side rendering', 'hydration', 'time to first byte', 'SEO'];
const TREE = ['tree shaking', 'unused exports', 'ES modules'];

export const GRADING_FIXTURES: GradingFixture[] = [
  // ---- event loop ----
  {
    keyPoints: EVENT_LOOP,
    kind: 'correct',
    expected: 'good',
    answer:
      'JavaScript runs on a single call stack. When it is empty the event loop takes work: first it drains the microtask queue like promise callbacks, then picks the next macrotask such as a timer.',
  },
  {
    keyPoints: EVENT_LOOP,
    kind: 'paraphrase',
    expected: 'good',
    answer:
      'the event loop waits for the call stack to clear, then runs promise callbacks from the job queue before the next task from the task queue',
  },
  {
    keyPoints: EVENT_LOOP,
    kind: 'partial',
    expected: 'partial',
    answer: 'it is how javascript handles async code with the event loop',
  },
  {
    keyPoints: EVENT_LOOP,
    kind: 'list',
    expected: 'partial',
    answer: 'call stack event loop microtask macrotask',
  },
  {
    keyPoints: EVENT_LOOP,
    kind: 'filler',
    expected: 'weak',
    answer:
      'well it is a very important concept that every developer should know about and it is used everywhere in modern web applications today honestly',
  },
  {
    keyPoints: EVENT_LOOP,
    kind: 'negated',
    expected: 'weak',
    answer:
      'promises do not go through the microtask queue, they wait for the call stack like timers',
  },
  {
    keyPoints: EVENT_LOOP,
    kind: 'wrong',
    expected: 'partial',
    aiOnly: true,
    answer:
      'the event loop runs macrotasks before microtasks, and the call stack is cleared by the garbage collector',
  },

  // ---- closures ----
  {
    keyPoints: CLOSURE,
    kind: 'correct',
    expected: 'good',
    answer:
      'A closure is a function that keeps access to its lexical scope, so it can read variables of the outer function even after that function has returned.',
  },
  {
    keyPoints: CLOSURE,
    kind: 'paraphrase',
    expected: 'good',
    answer:
      'an inner function closes over the variables of the outer function and can still use them after it returns',
  },
  {
    keyPoints: CLOSURE,
    kind: 'partial',
    expected: 'partial',
    answer: 'a closure is just a function object in javascript',
  },
  {
    keyPoints: CLOSURE,
    kind: 'negated',
    expected: 'weak',
    answer: "closures don't keep the lexical scope, they copy values at creation time",
  },
  {
    keyPoints: CLOSURE,
    kind: 'filler',
    expected: 'weak',
    answer: "it's a concept I use every day in my React code and it's really useful",
  },

  // ---- debounce / throttle ----
  {
    keyPoints: DEBOUNCE,
    kind: 'correct',
    expected: 'good',
    answer:
      'Debounce waits until calls stop and only runs the last call after a pause, while throttle runs at most once per fixed interval no matter how often it is called.',
  },
  {
    keyPoints: DEBOUNCE,
    kind: 'partial',
    expected: 'partial',
    answer: 'debounce delays a function until the user stops typing',
  },
  { keyPoints: DEBOUNCE, kind: 'list', expected: 'partial', answer: 'debounce throttle' },
  {
    keyPoints: DEBOUNCE,
    kind: 'paraphrase',
    expected: 'good',
    answer:
      'debouncing waits until the user stops, throttling makes it run at most once every hundred milliseconds',
  },

  // ---- CSP ----
  {
    keyPoints: CSP,
    kind: 'correct',
    expected: 'good',
    answer:
      'CSP is an HTTP header that lists where scripts may load from with script-src, and uses a nonce for inline scripts, which blocks most XSS.',
  },
  {
    keyPoints: CSP,
    kind: 'partial',
    expected: 'partial',
    answer: 'it is a header that helps prevent cross site scripting',
  },
  { keyPoints: CSP, kind: 'filler', expected: 'weak', answer: 'it makes the website more secure' },

  // ---- virtual DOM ----
  {
    keyPoints: VDOM,
    kind: 'paraphrase',
    expected: 'good',
    answer:
      'React keeps a virtual DOM, diffs it against the previous one and only patches what changed. Keys help it match list items.',
  },
  {
    keyPoints: VDOM,
    kind: 'partial',
    expected: 'partial',
    answer: 'react uses a virtual dom to be fast',
  },
  {
    keyPoints: VDOM,
    kind: 'trap',
    expected: 'weak',
    answer: 'keyboard events are handled by react',
  },
  {
    keyPoints: VDOM,
    kind: 'paraphrase',
    expected: 'partial',
    aiOnly: true,
    answer: 'React compares the new element tree with the old one and updates only the differences',
  },

  // ---- event delegation ----
  {
    keyPoints: DELEGATION,
    kind: 'correct',
    expected: 'good',
    answer:
      'Instead of many listeners you attach one listener on the parent and rely on bubbling, then check event.target to see which child was clicked.',
  },
  {
    keyPoints: DELEGATION,
    kind: 'partial',
    expected: 'partial',
    answer: 'events bubble up to the parent element',
  },

  // ---- CORS ----
  {
    keyPoints: CORS,
    kind: 'correct',
    expected: 'good',
    answer:
      'the browser blocks cross origin reads unless the server sends Access-Control-Allow-Origin. For non-simple requests it first sends an OPTIONS preflight.',
  },
  {
    keyPoints: CORS,
    kind: 'wrong',
    expected: 'weak',
    aiOnly: true,
    answer: 'CORS is something the server does to block requests, the browser is not involved',
  },
  {
    keyPoints: CORS,
    kind: 'filler',
    expected: 'weak',
    answer: 'you need to configure the backend',
  },

  // ---- useEffect ----
  {
    keyPoints: EFFECT,
    kind: 'correct',
    expected: 'good',
    answer:
      'useEffect runs after render. The dependency array controls when it runs again, and the function you return is the cleanup.',
  },
  {
    keyPoints: EFFECT,
    kind: 'wrong',
    expected: 'partial',
    aiOnly: true,
    answer:
      'useEffect runs before the browser paints, synchronously, and the cleanup only runs once',
  },
  {
    keyPoints: EFFECT,
    kind: 'partial',
    expected: 'partial',
    answer: 'use effect is for side effects in react',
  },
  {
    keyPoints: EFFECT,
    kind: 'negated',
    expected: 'weak',
    answer: "you don't need a dependency array, use effect figures it out",
  },

  // ---- memoization ----
  {
    keyPoints: MEMO,
    kind: 'paraphrase',
    expected: 'good',
    answer:
      'you cache the result of a pure function by its arguments so repeated calls return instantly',
  },
  { keyPoints: MEMO, kind: 'filler', expected: 'weak', answer: "it's an optimization technique" },

  // ---- SSR ----
  {
    keyPoints: SSR,
    kind: 'paraphrase',
    expected: 'good',
    answer:
      'with SSR the HTML is generated on the server, which helps SEO, then the client does hydration to attach event handlers',
  },
  {
    keyPoints: SSR,
    kind: 'partial',
    expected: 'partial',
    answer: 'the page is rendered on the server',
  },
  { keyPoints: SSR, kind: 'list', expected: 'partial', answer: 'hydration seo ssr' },

  // ---- tree shaking ----
  {
    keyPoints: TREE,
    kind: 'correct',
    expected: 'good',
    answer:
      'it not only reduces bundle size, tree shaking also removes unused exports, which works because ES modules are static',
  },
  {
    keyPoints: TREE,
    kind: 'correct',
    expected: 'good',
    answer:
      'it does not matter which bundler, tree shaking removes unused exports using the static structure of ES modules',
  },
  {
    keyPoints: TREE,
    kind: 'trap',
    expected: 'weak',
    answer: 'we shake things up in the build and export a lot of modules',
  },
  // ---- correct paraphrases keywords miss (need the on-device AI) ----
  {
    keyPoints: EVENT_LOOP,
    kind: 'paraphrase',
    expected: 'good',
    aiOnly: true,
    answer:
      'JavaScript has one thread that runs functions one at a time. When that work is finished it first runs every pending promise callback, and only then takes the next timer or network callback.',
  },
  {
    keyPoints: CLOSURE,
    kind: 'paraphrase',
    expected: 'good',
    aiOnly: true,
    answer:
      'a function created inside another function keeps a reference to the variables around it, so it can still read and change them after the parent has finished running',
  },
  {
    keyPoints: DEBOUNCE,
    kind: 'paraphrase',
    expected: 'good',
    aiOnly: true,
    answer:
      'one waits until the user has stopped typing for a moment and then fires once, the other fires regularly, say every 200 milliseconds, while the user keeps scrolling',
  },
  {
    keyPoints: CSP,
    kind: 'paraphrase',
    expected: 'partial',
    aiOnly: true,
    answer:
      'the server sends a response header that tells the browser which domains it may load scripts from, so injected scripts from attackers do not run',
  },
  {
    keyPoints: VDOM,
    kind: 'paraphrase',
    expected: 'partial',
    aiOnly: true,
    answer:
      'React builds a lightweight copy of the page in memory, compares it with the previous copy and only touches the real page where something changed',
  },
  {
    keyPoints: DELEGATION,
    kind: 'paraphrase',
    expected: 'good',
    aiOnly: true,
    answer:
      'put a single click handler on the list container, because clicks travel up from the item, then look at which element was actually clicked to decide what to do',
  },
  {
    keyPoints: CORS,
    kind: 'paraphrase',
    expected: 'partial',
    aiOnly: true,
    answer:
      'before a cross domain request with custom headers the browser sends a check request first and only continues if the server says that origin is allowed',
  },
  {
    keyPoints: EFFECT,
    kind: 'paraphrase',
    expected: 'good',
    aiOnly: true,
    answer:
      'the hook runs after the component renders, you list the values it depends on so it only runs again when they change, and you return a function that tears down subscriptions',
  },
  {
    keyPoints: MEMO,
    kind: 'paraphrase',
    expected: 'good',
    aiOnly: true,
    answer:
      'store what a function returned for a given input so the next call with the same input skips the work, which is only safe when the function has no side effects',
  },
  {
    keyPoints: TREE,
    kind: 'paraphrase',
    expected: 'good',
    aiOnly: true,
    answer:
      'the bundler looks at which imported functions are actually used and drops the rest from the final file, which works because import and export statements are static',
  },
];
