# Content authoring guide

All content lives in `content/`. `npm run index` validates it and builds `src/content/index.generated.json`, and the
app won't start if validation fails. `npm run verify:content` runs every coding solution against its tests.

## Ground rules (non-negotiable)

1. **Original writing only.** Do not copy text, code or tests from GreatFrontEnd, LeetCode, BFE.dev or any other
   site/book. You may cover the same well-known problems (debounce, Promise.all, Tabs, News Feed design…), but every
   prompt, solution, explanation and test must be written fresh.
   *Exception:* content from MIT-licensed sources (see `LICENSES.md`) may be adapted, with `source` set accordingly.
2. **Technically correct.** Behaviour must match the spec (ECMAScript, HTML, CSS, React docs at react.dev). When in
   doubt, check MDN / react.dev and add the URL to `references`. Mention version caveats (e.g. "React 19 adds …").
3. **Senior/lead depth.** Explanations should cover trade-offs, edge cases, complexity, accessibility,
   performance and follow-up questions an interviewer may ask.

## Folder layout

```
content/questions/<format>/<slug>/
  meta.json        required for every question
  prompt.md        required except for quiz (the title is the question)
  solution.md      required: explanation / answer / write-up
  starter/…        coding formats only: what the candidate starts with
  solution/…       coding formats only: reference implementation
  index.test.js    javascript + algorithms (required); App.test.js for UI (optional)
```

`<format>` is one of `javascript`, `user-interface`, `algorithms`, `quiz`, `system-design`, `behavioral`.
`<slug>` is kebab-case and must equal `meta.slug`.

## meta.json

```json
{
  "slug": "debounce",
  "format": "javascript",
  "title": "Debounce",
  "excerpt": "One sentence shown in lists (≥ 10 chars).",
  "difficulty": "medium",              // easy | medium | hard
  "importance": "high",                // low | mid | high (how often it appears in interviews)
  "duration": 20,                      // minutes a candidate should spend
  "topics": ["closures", "async"],     // lower-case free text, reuse existing topics where possible
  "frameworks": [],                    // ["react"] for React UI questions, ["vanilla"] for DOM-only
  "languages": ["js"],                 // js | ts | html | css
  "companies": ["Google", "Meta"],     // only if publicly known to be asked; otherwise []
  "quizCategory": "javascript",        // quiz only: javascript | react | html | css | typescript | web | performance | security
  "sdType": "application",             // system-design only: application | component | lead
  "source": { "type": "original" },    // or { "type": "mit-handbook", "url": "…" }
  "references": ["https://developer.mozilla.org/…"]
}
```

No other keys are allowed (the schema is strict).

## JavaScript functions & algorithms

- `starter/index.js` and `solution/index.js` both use **`export default function name(...)`** (or
  `export default class`). Named exports are allowed in addition.
- `starter/index.js` has the signature plus JSDoc and a body that **fails the tests** (e.g. `throw 'Not implemented!'`).
- `index.test.js` imports from `'./index'` and uses only Jest-compatible globals: `describe`, `test`/`it`, `expect`,
  `beforeEach`, `afterEach`, `jest.fn()`. **Do not use fake timers.** For timing tests, use short real delays
  (`await new Promise(r => setTimeout(r, 50))`) with generous margins.
- Write 6–15 tests covering the basics, edge cases (empty input, `this` binding, rejection, nesting…) and anything
  the prompt promises.
- `prompt.md`: problem statement, signature, examples (code blocks), constraints / clarifications, and a short
  "Follow-up" list.
- `solution.md`: approach, step-by-step reasoning, complexity, edge cases, common mistakes, interviewer follow-ups.
  The reference code is appended automatically, so don't paste it again (small snippets are fine).

## User interface (React)

- Sandpack `react` template. `starter/App.js` and `solution/App.js` must `export default function App()`.
  Add `starter/styles.css` / `solution/styles.css` and import them (`import './styles.css'`). Extra component files
  are fine (`solution/Tabs.js`).
- Starter = minimal working skeleton (renders something, has TODO comments, and sample data inline).
- Use plain React 18 (`useState`, `useEffect`, `useRef`, `useReducer`, `useId` …). No external libraries.
- Accessibility matters: correct roles/ARIA, keyboard support and focus management are part of the solution.
- Optional `App.test.js`: `import React from 'react'` and `import { render, screen, fireEvent } from '@testing-library/react'`,
  using only plain `expect` matchers (`toBe`, `toEqual`, `toBeTruthy`, `toBeNull`, `toHaveLength`). **Do not use
  jest-dom matchers** like `toBeInTheDocument`. If you add tests, the starter must fail them.
- `solution.md`: component architecture, state design, a11y, edge cases, how to scale it (perf, API) and follow-ups.

## Quiz

- Folder with `meta.json` + `solution.md` (the answer). The title is the question, e.g. "Explain event delegation".
- Answer: TL;DR first (2–4 sentences, bold the key idea), then a deeper explanation with code examples, pitfalls, and
  "In an interview, mention…" notes. Typically 250–700 words.

## System design

- `prompt.md`: the brief (what to design, any constraints the interviewer gives).
- `solution.md` follows **RADIO**:
  1. **Requirements exploration**: functional, non-functional, out of scope, clarifying questions.
  2. **Architecture / high-level design**: components and responsibilities, plus a ```` ```mermaid ```` diagram.
  3. **Data model**: client state and server data, where each lives (server cache vs UI state), normalisation.
  4. **Interface definition (API)**: server APIs (REST/GraphQL/WebSocket shapes, pagination) and component props.
  5. **Optimizations & deep dives**: performance (rendering, network, bundle), UX, a11y, i18n, offline, security,
     observability, testing.
- End with "What a lead-level answer adds" and "Common follow-up questions". Typically 1,800–3,500 words.
- Mermaid diagrams: use `flowchart LR` / `sequenceDiagram`, and keep labels simple (no parentheses or quotes inside
  node labels unless the label is wrapped in quotes).

## Behavioral & leadership

- `prompt.md`: the question as asked, plus "What the interviewer is assessing" (bullets).
- `solution.md`: how to structure the answer (STAR / STAR-L), a **model answer** (realistic and specific, first
  person, quantified results), red flags to avoid, and follow-up probes. Pitch it at senior/lead/staff level.

## Guides

- `content/guides/guides.json` lists the guides. Chapters are `content/guides/<guide-id>/NN-slug.md` with front-matter:

```
---
title: Chapter title
description: One line
source: original            # or mit-handbook
sourceUrl: https://…        # when source is not original
---
```

## Study plans & focus areas

- `content/study-plans.json` and `content/focus-areas.json` reference questions by id (`<format>/<slug>`).
  The index build fails if an id does not exist.
