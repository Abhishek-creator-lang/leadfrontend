import { describe, expect, it } from 'vitest';
import { gradeAnswer, intentOf, mentions, storySignals } from './classify';
import {
  buildReport,
  respond,
  startInterview,
  type EngineState,
  type InterviewPlan,
} from './engine';
import {
  behavioralMaterial,
  quizMaterial,
  spokenQuestion,
  type BehavioralMaterial,
  type QuizMaterial,
} from './material';

// ---------- material ----------

const QUIZ_MD = `## TL;DR

Create an **\`AbortController\`**, pass its **\`signal\`** to \`fetch(url, { signal })\`, and call **\`controller.abort()\`** to cancel. It rejects with **\`AbortError\`**.

## Basic usage

\`\`\`js
const c = new AbortController();
\`\`\`
`;

const BEHAVIORAL_MD = `> "Tell me about a time you failed. What did you take away from it?"

Intro text.

## What the interviewer is assessing

- **Self-awareness**: can you name your own mistake?
- **Recovery**: what you did.
`;

describe('material', () => {
  it('extracts key points and a one-line summary from a quiz TL;DR', () => {
    const m = quizMaterial(
      {
        id: 'quiz/abort',
        title: 'How do you cancel a fetch with `AbortController`?',
        difficulty: 'medium',
      },
      QUIZ_MD
    )!;
    expect(m.keyPoints).toEqual(['AbortController', 'signal', 'controller.abort()', 'AbortError']);
    expect(m.summary).toBe(
      'Create an AbortController, pass its signal to fetch(url, { signal }), and call controller.abort() to cancel.'
    );
    expect(m.ask).toBe('How do you cancel a fetch with AbortController?');
  });

  it('ignores emphasis words and fragments as key points, and keeps HTML tag names', () => {
    const m = quizMaterial(
      { id: 'quiz/dom', title: 'DOM?', difficulty: 'easy' },
      '## TL;DR\n\n**Create** a node with **createElement**, fill a **`<template>`** and **, React matches the wrong old element to each new item** then **append** it.'
    )!;
    expect(m.keyPoints).toEqual(['createElement', 'template', 'append']);
  });

  it('skips quiz questions without enough key points', () => {
    expect(
      quizMaterial({ id: 'q/x', title: 'X?', difficulty: 'easy' }, 'Plain answer.')
    ).toBeNull();
  });

  it('phrases non-question titles as questions', () => {
    expect(spokenQuestion('Explain Function.prototype.bind.')).toBe(
      'Explain Function.prototype.bind.'
    );
    expect(spokenQuestion('Tree shaking in module bundling')).toBe(
      'Can you explain tree shaking in module bundling?'
    );
  });

  it('uses the quoted prompt as the behavioral question', () => {
    const m = behavioralMaterial({ id: 'behavioral/failure', title: 'A failure' }, BEHAVIORAL_MD);
    expect(m.ask).toBe('Tell me about a time you failed. What did you take away from it?');
    expect(m.assessing).toEqual(['Self-awareness', 'Recovery']);
  });
});

// ---------- classifier ----------

describe('classify', () => {
  it.each([
    ['can you repeat that', 'repeat'],
    ['sorry I didnt catch that', 'repeat'],
    ['can I get a hint', 'hint'],
    ["let's skip this one", 'skip'],
    ["I don't know", 'dontKnow'],
    ['never used it honestly', 'dontKnow'],
    ['what do you mean exactly', 'clarify'],
    ['closures capture variables from the outer scope', 'answer'],
  ])('%s → %s', (text, intent) => {
    expect(intentOf(text)).toBe(intent);
  });

  it('treats long answers that mention "hint" as answers', () => {
    expect(
      intentOf(
        'the browser uses the fetchpriority hint to decide which images and scripts to download first when bandwidth is limited'
      )
    ).toBe('answer');
  });

  it('matches key points across speech-recognition spacing', () => {
    expect(mentions('you create an abort controller and pass the signal', 'AbortController')).toBe(
      true
    );
    expect(mentions('call controller dot abort', 'controller.abort()')).toBe(true);
    expect(mentions('use a timeout', 'AbortController')).toBe(false);
  });

  it('grades by key-point coverage', () => {
    const kp = ['AbortController', 'signal', 'controller.abort()', 'AbortError'];
    expect(gradeAnswer('make an abort controller, pass the signal to fetch', kp).grade).toBe(
      'good'
    );
    expect(gradeAnswer('you can cancel with a signal', kp).grade).toBe('partial');
    expect(gradeAnswer('use axios', kp).grade).toBe('weak');
  });

  it('spots "we" stories and missing results', () => {
    const s = storySignals('we planned it, we built it, we shipped it and our team was happy');
    expect(s.hidesBehindWe).toBe(true);
    const t = storySignals(
      'I led the rewrite and it reduced load time by 40%. I learned to ship smaller.'
    );
    expect(t).toMatchObject({ hidesBehindWe: false, hasResult: true, reflects: true });
  });
});

// ---------- engine ----------

const quiz = (
  id: string,
  difficulty: QuizMaterial['difficulty'],
  keyPoints: string[]
): QuizMaterial => ({
  kind: 'quiz',
  id,
  ask: `Question ${id}?`,
  title: `Title ${id}`,
  difficulty,
  category: 'javascript',
  keyPoints,
  summary: `Summary of ${id}.`,
});

const story = (id: string): BehavioralMaterial => ({
  kind: 'behavioral',
  id,
  ask: `Tell me about ${id}.`,
  title: id,
  assessing: [],
});

const PLAN: InterviewPlan = {
  role: 'lead',
  warmupCount: 2,
  introFollowups: 1,
  quiz: [
    quiz('easy1', 'easy', ['hoisting', 'scope']),
    quiz('med1', 'medium', ['closure', 'lexical scope']),
    quiz('hard1', 'hard', ['event loop', 'microtask']),
  ],
  behavioral: [story('conflict')],
  coding: null,
  design: null,
};

const say = (s: EngineState, text: string | null) => respond(s, text);

describe('engine', () => {
  it('opens with an introduction and the agenda, then asks for your intro', () => {
    let t = startInterview(PLAN);
    expect(t.say[0]).toMatch(/^Hi, I'm Aarav/);
    expect(t.state.stage).toBe('opening');
    t = say(t.state, 'sounds good');
    expect(t.state.stage).toBe('intro');
    expect(t.say.at(-1)).toMatch(/Tell me a bit about yourself/);
  });

  it('asks for more on a short intro, then follows up on what you mentioned', () => {
    let t = say(startInterview(PLAN).state, 'ok');
    t = say(t.state, 'I am a frontend engineer');
    expect(t.say.at(-1)).toMatch(/tell me a bit more/i);
    t = say(
      t.state,
      'I lead a team of six engineers working on the checkout and we migrated it from a legacy app'
    );
    expect(t.say.at(-1)).toMatch(/You mentioned leading/);
  });

  it('goes deeper after a good answer and easier after a weak one', () => {
    let t = say(startInterview(PLAN).state, 'ok');
    t = say(
      t.state,
      'I lead a team of six engineers building the checkout flow for a large ecommerce site used by millions of people'
    );
    t = say(t.state, 'about six people, mostly planning and reviews');
    // lead starts at medium
    expect(t.state.stage).toBe('warmup');
    expect(t.say.at(-1)).toBe('Question med1?');
    // good answer covering both points → next question is harder
    t = say(t.state, 'a closure keeps the lexical scope alive after the function returns');
    expect(t.state.warm.results[0]).toMatchObject({ grade: 'good', score: 100 });
    expect(t.say.at(-1)).toBe('Question hard1?');
  });

  it('gives a hint on a partial answer, explains when you do not know, and moves on', () => {
    let t = say(startInterview({ ...PLAN, introFollowups: 0 }).state, 'ok');
    t = say(
      t.state,
      'I lead a team of six engineers building the checkout flow for a large ecommerce site used by millions of people'
    );
    expect(t.say.at(-1)).toBe('Question med1?');
    t = say(t.state, 'something about functions I think');
    expect(t.say.at(-1)).toMatch(/hint: think about closure/);
    t = say(t.state, "I don't know");
    expect(t.say).toContain('The short version: Summary of med1.');
    expect(t.state.warm.results[0]).toMatchObject({ grade: 'dontKnow', hinted: true, score: 0 });
  });

  it('repeats the last question on request', () => {
    let t = say(startInterview(PLAN).state, 'ok');
    t = say(t.state, 'can you repeat that');
    expect(t.say).toEqual(['Sure.', expect.stringMatching(/Tell me a bit about yourself/)]);
    expect(t.state.stage).toBe('intro');
  });

  it('probes "we" stories, then asks for your questions and closes', () => {
    let t = say(startInterview({ ...PLAN, warmupCount: 0, introFollowups: 0 }).state, 'ok');
    t = say(
      t.state,
      'I lead a team of six engineers building the checkout flow for a large ecommerce site used by millions of people'
    );
    expect(t.state.stage).toBe('behavioral');
    expect(t.say.at(-1)).toBe('Tell me about conflict.');
    t = say(
      t.state,
      'we had a disagreement about the architecture for the new checkout and we discussed it for weeks and we finally agreed on our plan together as a team after many meetings and long reviews with everyone involved in the project across three different teams'
    );
    expect(t.say.at(-1)).toMatch(/What did you personally do/);
    t = say(
      t.state,
      'I wrote the RFC and it reduced build time by 30%. Looking back I would involve design earlier.'
    );
    expect(t.state.stage).toBe('questions');
    t = say(t.state, 'what does the tech stack look like');
    expect(t.say[0]).toMatch(/React and TypeScript/);
    t = say(t.state, "no that's all");
    expect(t.state.stage).toBe('done');
    expect(t.say.at(-1)).toMatch(/feedback is ready/);

    const r = buildReport(t.state);
    expect(r.stages.find((x) => x.id === 'questions')!.score).toBe(100);
    expect(r.behavioral[0].score).toBeGreaterThanOrEqual(80);
    expect(r.score).toBeGreaterThan(0);
  });

  it('moves on after silence', () => {
    let t = say(startInterview({ ...PLAN, introFollowups: 0 }).state, null); // silence at opening = ready
    expect(t.state.stage).toBe('intro');
    t = say(t.state, null);
    expect(t.say).toEqual(['Take your time. Whenever you are ready.']);
    t = say(t.state, null);
    expect(t.state.stage).toBe('warmup');
  });
});
