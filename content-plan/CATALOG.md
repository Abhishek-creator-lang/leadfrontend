# Content catalog: who writes what

Each batch is owned by one author (agent). Only create folders for slugs in your own batch. Follow
`CONTENT_GUIDE.md` exactly. Difficulty is a suggestion (E/M/H) and can be adjusted.
`★` means the problem is frequently reported in real loops (Front End Interview Handbook company guides), so make it
extra thorough and add the companies where it was reported to `meta.companies` (see `content/companies/*.md`).

---

## Batch JS-1: native & Promise polyfills (javascript)

array-prototype-at (E), array-prototype-concat (E), array-prototype-filter (E) ★, array-prototype-map (E),
array-prototype-reduce (E) ★, array-prototype-square (E), array-prototype-flat (M), function-prototype-apply (M),
function-prototype-call (M), function-prototype-bind (M) ★, promise-all (M) ★, promise-all-settled (M),
promise-any (M) ★, promise-race (E), promise-resolve (M), promise-reject (E), promise-with-resolvers (E),
promise-timeout (M), promisify (M) ★, promisify-ii (custom symbol) (M), sleep (E), cancellable-timeout (E),
cancellable-interval (E), throttle (M) ★, debounce-ii (leading/trailing/maxWait) (H), set-interval-with-set-timeout (M),
promise-implementation (a Promises/A+ subset: then/catch/finally, chaining, thenable adoption) (H),
instanceof (M), object-create (E), new-operator (M)

## Batch JS-2: lodash-style utilities (javascript)

chunk (E), compact (E), clamp (E), count-by (E), difference (E), drop-while (E), drop-right-while (E), fill (E),
find-index (E), find-last-index (E), from-pairs (E), group-by (M), intersection (M), in-range (E), is-empty (M),
max-by (E), min-by (E), mean (E), range (E), range-right (E), size (E), unique-array (E) ★, union-by (M),
get (M), set (M), has (M), omit (M), pick (E), deep-omit (M), deep-map (M), deep-clone (M) ★,
deep-clone-ii (cycles, Map/Set/Date/RegExp) (H), deep-equal (M), deep-merge (M), flatten (M) ★, curry (M),
curry-ii (placeholders) (H), compose (E), pipe (E), once (E), memoize (M) ★, memoize-ii (multi-arg, cache key) (M),
partial (M), number-of-arguments (E), make-counter (E), classnames (M) ★, camel-case-keys (M), squash-object (M) ★,
type-utilities (E), type-utilities-ii (M), list-format (M) ★, text-search (highlight matches) (M),
data-merging (M), string-repeat-and-pad (E)

## Batch JS-3: async control, DOM & architecture (javascript)

map-async (M), map-async-limit (H) ★, promise-pool (concurrency-limited task queue) (H), retry-with-backoff (M),
async-queue-with-priority (H), sequential-async (run in series) (M), cache-async (dedupe in-flight requests) (M),
event-emitter (M) ★, event-emitter-ii (once, off, unsubscribe handles) (M), pub-sub-store (mini Redux createStore) (M),
middlewares (Express/Redux-style compose) (M) ★, observable (subscribe/unsubscribe/pipe-like map) (H),
get-elements-by-class-name (M) ★, get-elements-by-tag-name (M) ★, get-elements-by-style (M) ★,
dom-element-identical (is-same-tree) (M), html-serializer (E), jquery-class-manipulation (E), jquery-css (E),
table-of-contents (H) ★, json-stringify (H) ★, json-parse-lite (H), data-selection (M) ★, backbone-model (H) ★,
lru-cache (M), undoable-counter / undo-redo-stack (M), virtual-dom-render (createElement → DOM) (H),
virtual-dom-diff (keyed children patch) (H), template-engine (`{{ }}` interpolation) (M), url-query-parse-stringify (M),
spreadsheet-evaluator (cells with formulas and dependency graph, cycle detection) (H) ★,
signals (createSignal/createEffect fine-grained reactivity) (H), dependency-injection-container (M),
feature-flag-evaluator (rules, percentage rollout with stable hashing) (M)

## Batch UI-1: React UI coding (user-interface)

hello-world-counter (E), like-button (E) ★, tabs (E) ★, tabs-ii-accessible (M), accordion-ii-single-open (M),
star-rating (E) ★, progress-bar (E), progress-bars (M) ★, progress-bars-ii-concurrent-limit (M),
progress-bars-iii-pause-resume (H), todo-list (E) ★, contact-form (E) ★, signup-form-validation (M) ★,
temperature-converter (E), mortgage-calculator (E), flight-booker (E), generate-table (E) ★, holy-grail-layout (E),
traffic-light (M) ★, digital-clock (E) ★, analog-clock (M), stopwatch (M) ★, dice-roller (E), tweet-card (E),
modal-dialog (M) ★, modal-dialog-ii-accessible-focus-trap (H), toast-notifications (M), tooltip-and-popover (M)

## Batch UI-2: React UI coding (user-interface)

image-carousel (M) ★, image-carousel-ii-infinite-transitions (H), data-table (M) ★, data-table-ii-sort-filter (M),
data-table-iii-generic-columns (H), users-database-crud (M) ★, job-board (M) ★, file-explorer (M) ★,
file-explorer-ii-keyboard-tree (H), nested-checkboxes (M), transfer-list (M) ★, tic-tac-toe (M) ★,
tic-tac-toe-ii-n-by-m (H), wordle (H) ★, memory-game (M) ★, whack-a-mole (M) ★, connect-four (H),
grid-lights (M), selectable-cells (drag select) (H) ★, pixel-art (M), birth-year-histogram (M),
auth-code-input (M), autocomplete-typeahead (H), infinite-scroll-feed (M), virtualized-list (H), kanban-board (H),
dropdown-menu (M), multi-step-form-wizard (M), date-picker (H), drag-and-drop-sortable-list (H)

## Batch ALGO: algorithmic coding (algorithms)

stack (E) ★, queue (E) ★, linked-list (M), binary-search (E) ★, merge-sort (M) ★, quick-sort (M),
insertion-sort (E), selection-sort (E), heap-sort (M), topological-sort (M), depth-first-search (M),
breadth-first-search (M), binary-tree-traversals (E), binary-search-tree (M), trie (M), min-heap (M),
merge-intervals (M) ★, insert-interval (M), meeting-rooms-ii (M) ★, non-overlapping-intervals (M),
two-sum (E), valid-parentheses (E), best-time-to-buy-sell-stock (E), longest-substring-without-repeating (M),
group-anagrams (M), top-k-frequent (M), product-of-array-except-self (M), maximum-subarray (M),
number-of-islands (M), course-schedule (M), coin-change (M), climbing-stairs (E), house-robber (M),
longest-increasing-subsequence (M), rotate-matrix (M), spiral-matrix (M), word-search (M),
permutations (M), subsets (M), combination-sum (M), level-order-traversal (M), lowest-common-ancestor (M),
validate-bst (M), serialize-deserialize-tree (H), sliding-window-maximum (H), kth-largest-element (M)

## Batch QUIZ-JS-A / QUIZ-JS-B: JavaScript quiz (quiz, quizCategory: javascript)

Source list: `content-plan/quiz-javascript-titles.txt` (`n|title|level`). Basic → easy, Intermediate → medium,
Advanced → hard. **QUIZ-JS-A owns items 1–97, QUIZ-JS-B owns items 98–193.** Write **original** answers; never copy.
Skip an item when `content/questions/quiz/` already has a question with the same meaning (imported from the MIT
handbook, check `source.type`). Then add the handbook question's id to `content-plan/quiz-coverage.txt` as
`<n>|<existing-id>` (append only).

## Batch QUIZ-REACT-TS: React + TypeScript quiz (quiz)

- React (quizCategory: react): all 50 in `content-plan/quiz-react-titles.txt`, then **12 more** modern-React items:
  React Server Components, Suspense for data, `use()`, Actions/`useActionState`/`useOptimistic`, the React Compiler,
  transitions (`useTransition`/`useDeferredValue`), hydration errors, streaming SSR, error boundaries, React 19 ref
  as prop, Strict Mode double invoke, and the rules of hooks with lint enforcement. Skip duplicates of the 50.
- TypeScript (quizCategory: typescript): 40 items: `any` vs `unknown` vs `never`, interfaces vs type aliases,
  generics and constraints, conditional types and `infer`, mapped types, template literal types, utility types
  (Partial/Required/Pick/Omit/Record/ReturnType/Awaited…), discriminated unions and exhaustiveness, type guards,
  `satisfies`, `as const`, declaration merging, overloads, variance basics, `keyof`/`typeof`/indexed access,
  enums vs union literals, structural typing, strict flags, typing React props/events/refs/generic components,
  typing `useReducer`, module augmentation, `.d.ts`, branded types, assertion functions…

## Batch QUIZ-WEB: web platform, performance, security, modern CSS/HTML (quiz)

~45 items across quizCategory web / performance / security / css / html, not duplicating the handbook import:

- **web:** critical rendering path, what happens when you type a URL, reflow vs repaint and compositing, CORS
  (preflight, credentials), HTTP caching (Cache-Control, ETag, stale-while-revalidate), HTTP/2 and HTTP/3, service
  workers, Web Workers, `IntersectionObserver`/`ResizeObserver`/`MutationObserver`, `requestAnimationFrame` vs
  `requestIdleCallback`, `fetch` and `AbortController`, streams, WebSockets vs SSE vs long polling, storage
  (IndexedDB), modules (ESM vs CJS, dynamic import), tree shaking, bundlers, source maps, CSR/SSR/SSG/ISR/streaming,
  islands.
- **performance:** Core Web Vitals (LCP/INP/CLS) and how to improve each, image optimization, fonts, code splitting,
  preload/prefetch/preconnect, long tasks and yielding, memory leaks in SPAs, virtualization, measuring with
  PerformanceObserver/RUM.
- **security:** XSS (stored, reflected, DOM) and React's escaping, CSP, CSRF and SameSite, clickjacking, CORS
  misconceptions, JWT storage trade-offs, Subresource Integrity, supply-chain risks, iframe sandboxing, Trusted Types.
- **css/html (modern):** Flexbox vs Grid, container queries, `:has()`, cascade layers, logical properties, CSS custom
  properties vs preprocessor variables, `clamp()` fluid type, stacking contexts and `isolation`, `content-visibility`,
  view transitions, semantic HTML and landmarks, `<dialog>`, `inert`, form validation API, `loading="lazy"`,
  `fetchpriority`, ARIA first rule and live regions.

## Batch SD-1 / SD-2 / SD-3: system design (system-design)

- **SD-1 (applications):** news-feed ★ (Facebook), chat-application ★ (Messenger), autocomplete ★ (component but
  write it in full depth), photo-sharing (Instagram) ★, pinterest-masonry ★, e-commerce-marketplace (Amazon) ★,
  travel-booking (Airbnb) ★, video-streaming (Netflix) ★, email-client (Outlook) ★
- **SD-2 (applications and components):** collaborative-editor (Google Docs) ★, collaborative-spreadsheet (Google
  Sheets) ★, drawing-tool (Figma/Canva) ★, music-streaming (Spotify) ★, video-conferencing (Zoom) ★,
  rich-text-editor ★, data-table-component ★, image-carousel-component ★, dropdown-menu-component ★,
  modal-dialog-component ★, poll-widget ★, image-uploader-component, date-picker-component
- **SD-3 (lead-level, sdType: lead):** design-system-at-scale, micro-frontend-platform, feature-flag-and-experimentation-platform,
  frontend-observability-platform (RUM, error tracking, tracing), offline-first-pwa (sync and conflict resolution),
  frontend-monorepo-and-ci-platform, localization-platform-i18n, analytics-event-pipeline-client-sdk,
  embeddable-widget-sdk (third-party script, isolation, versioning), real-time-collaborative-whiteboard,
  web-performance-program (org-wide CWV strategy)

## Batch BEHAVIORAL (behavioral)

40 questions at senior/lead level. Examples (write your own phrasing): tell me about yourself (lead edition), a
project you led end to end, a technical decision you'd make differently, a disagreement with a manager/PM/designer,
influencing without authority, mentoring an underperformer, giving hard feedback, receiving critical feedback, a
production incident you owned, prioritizing tech debt vs features, saying no to a stakeholder, the hardest bug,
improving team velocity, setting a technical vision, driving cross-team alignment, migrating a legacy codebase,
introducing a design system, hiring and interviewing, onboarding a new team, handling ambiguity, a failure and
what you learned, delivering under a tight deadline, scope cuts, raising the quality bar (testing/CI), performance
wins with business impact, accessibility advocacy, an RFC/ADR you wrote, building consensus, a conflict between
two engineers, burnout and sustainable pace, delegation, growing senior engineers into leads, working with remote
teams, a time you changed your mind, why this company, why leave your job, the lead vs staff vs manager track,
questions to ask the interviewer, salary/level negotiation scenarios.

## Batch GUIDES (content/guides)

New chapters (original writing) that sit alongside the imported handbook chapters (keep their NN numbers distinct):

- **front-end-interview-playbook:** 02-interview-rounds-and-formats, 07-how-to-practice, 08-day-of-the-interview, 09-senior-vs-lead-expectations
- **front-end-system-design-playbook:** 02-radio-framework, 03-requirements-exploration, 04-architecture-and-data-model,
  07-api-design-for-front-end, 08-performance-deep-dives, 09-evaluation-rubric-by-level, 10-common-mistakes
- **react-interview-playbook** (all new): 01-what-react-interviews-test, 02-rendering-and-reconciliation,
  03-hooks-in-depth, 04-state-management-choices, 05-performance-optimization, 06-patterns (compound components,
  render props, headless, HOCs, custom hooks), 07-data-fetching-and-caching, 08-forms, 09-testing-react,
  10-server-components-and-ssr, 11-react-19-features, 12-ui-coding-checklist
- **lead-track** (all new): 01-what-lead-loops-assess, 02-frontend-architecture-decisions, 03-monorepos-and-micro-frontends,
  04-design-systems, 05-performance-budgets-and-cwv, 06-observability-and-reliability, 07-ci-cd-and-quality-gates,
  08-security-for-front-end-leads, 09-accessibility-at-scale, 10-i18n, 11-technical-strategy-rfcs-adrs,
  12-mentoring-and-team-growth, 13-stakeholder-management, 14-incident-leadership, 15-estimation-and-delivery
- **behavioral-playbook:** 02-star-method, 03-building-your-story-bank, 04-leadership-principles-mapping, 05-questions-to-ask
- **resume-and-process:** 02-hiring-process-and-leveling, 03-offer-negotiation, 04-portfolio-and-open-source
