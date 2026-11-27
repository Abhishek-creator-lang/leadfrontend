import { describe, expect, it } from 'vitest';
import { gradeAnswer, intentOf, mentions, storySignals } from './classify';
import {
  behavioralProbeGoal,
  buildReport,
  endEarly,
  introWouldFollowUp,
  questionsWouldAnswer,
  respond,
  stageScore,
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

const INTRO =
  'I lead a team of six engineers building the checkout flow for a large ecommerce site used by millions of people';

/** Lead plan, no intro follow-ups: the first fundamentals question is med1 (three key points). */
const PLAN3: InterviewPlan = {
  ...PLAN,
  introFollowups: 0,
  quiz: [
    quiz('easy1', 'easy', ['hoisting', 'scope']),
    quiz('med1', 'medium', ['closure', 'lexical scope', 'garbage collection']),
    quiz('hard1', 'hard', ['event loop', 'microtask']),
  ],
};

function toWarmup(plan: InterviewPlan = PLAN3): EngineState {
  let t = say(startInterview(plan).state, 'ok');
  t = say(t.state, INTRO);
  expect(t.state.stage).toBe('warmup');
  return t.state;
}

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

  it('probes a partial answer without a hint, and explains when you do not know', () => {
    let t = say(startInterview({ ...PLAN, introFollowups: 0 }).state, 'ok');
    t = say(t.state, INTRO);
    expect(t.say.at(-1)).toBe('Question med1?');
    t = say(t.state, 'something about functions I think');
    expect(t.say.join(' ')).not.toMatch(/hint/i);
    expect(t.state.expect).toBe('anythingElse');
    t = say(t.state, "I don't know");
    expect(t.say).toContain('The short version: Summary of med1.');
    expect(t.state.warm.results[0]).toMatchObject({ grade: 'dontKnow', hinted: false, score: 0 });
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

describe('engine: hints only on request, and "no" means no', () => {
  it('keeps a partial answer when you decline to add more, and never hints', () => {
    let t = say(toWarmup(), 'a closure is a function that remembers stuff');
    expect(t.state.expect).toBe('anythingElse');
    t = say(t.state, 'no, move on');
    expect(t.say.join(' ')).not.toMatch(/hint/i);
    expect(t.state.warm.results[0]).toMatchObject({
      grade: 'partial',
      hinted: false,
      score: 60,
      hit: ['closure'],
    });
  });

  it.each(['no thanks', "no that's all", 'nope'])(
    '"%s" after the probe keeps the grade',
    (reply) => {
      let t = say(toWarmup(), 'a closure is a function that remembers stuff');
      t = say(t.state, reply);
      expect(t.state.warm.results[0].grade).toBe('partial');
    }
  );

  it('keeps a partial answer through silence after the probe', () => {
    let t = say(toWarmup(), 'a closure is a function that remembers stuff');
    t = say(t.state, null);
    expect(t.state.warm.results[0]).toMatchObject({ grade: 'partial', score: 60 });
  });

  it('treats "no hint please" as a no, not a hint request', () => {
    expect(intentOf('no hint please')).toBe('decline');
    expect(intentOf("I don't need a hint")).toBe('decline');
    expect(intentOf('no hints, just move on')).toBe('skip');
    let t = say(toWarmup(), 'a closure is a function that remembers stuff');
    t = say(t.state, 'no hint please');
    expect(t.say.join(' ')).not.toMatch(/hint:/i);
    expect(t.state.warm.results[0]).toMatchObject({ grade: 'partial', hinted: false });
  });

  it('gives a hint when asked, and counts it', () => {
    let t = say(toWarmup(), 'hint please');
    expect(t.say).toEqual(["Here's a hint: think about closure."]);
    t = say(t.state, 'a closure keeps the lexical scope of the outer function alive');
    expect(t.say.at(-1)).toBe('And where does garbage collection come into it?');
    t = say(t.state, "that's all");
    expect(t.state.warm.results[0]).toMatchObject({
      grade: 'good',
      hinted: true,
      hints: 1,
      score: 90,
    });
  });

  it('answers "how should I answer this?" without grading it', () => {
    const t = say(toWarmup(), 'how should I answer this');
    expect(t.say[0]).toMatch(/what it is, why it matters/i);
    expect(t.say.at(-1)).toBe('Question med1?');
    expect(t.state.warm.results).toHaveLength(0);
    expect(t.state.warm.current?.answers).toEqual([]);
  });

  it('reads "not sure, but maybe…" with a key point as an answer', () => {
    const t = say(toWarmup(), 'not sure, maybe a closure');
    expect(t.state.warm.current?.answers).toEqual(['not sure, maybe a closure']);
  });

  it('treats "not sure what you mean" as a request to clarify, then rephrases', () => {
    expect(intentOf("I'm not sure what you mean")).toBe('clarify');
    let t = say(toWarmup(), "I'm not sure what you mean");
    expect(t.say[0]).toMatch(/Explain it the way you would/);
    t = say(t.state, 'what do you mean');
    expect(t.say[0]).toMatch(/Let me put it another way/);
  });

  it('marks a negated key point as contradicted', () => {
    let t = say(toWarmup(), 'it does not use a closure, it copies the lexical scope');
    t = say(t.state, 'no');
    expect(t.state.warm.results[0].contradicted).toEqual(['closure']);
  });
});

describe('engine: behavioral and questions', () => {
  const plan = { ...PLAN, warmupCount: 0, introFollowups: 0 };
  const toStory = () => {
    const t = say(say(startInterview(plan).state, 'ok').state, INTRO);
    expect(t.state.stage).toBe('behavioral');
    return t.state;
  };

  it('offers a way in when you have no example, then moves on with a clear note', () => {
    let t = say(toStory(), "I don't have an example for that");
    expect(t.say[0]).toMatch(/similar situation works too/);
    t = say(t.state, 'no');
    expect(t.state.stage).toBe('questions');
    expect(t.state.beh.results[0]).toMatchObject({ noStory: true, score: 0 });
    expect(t.state.beh.results[0].notes[0].text).toMatch(/No example/);
  });

  it('does not score a one-word story', () => {
    let t = say(toStory(), 'fine');
    t = say(t.state, 'ok');
    t = say(t.state, 'nothing');
    expect(t.state.beh.results[0].score).toBe(0);
  });

  it('says "go ahead" to a plain yes at the questions stage', () => {
    let t = say(toStory(), 'skip');
    expect(t.state.stage).toBe('questions');
    t = say(t.state, 'yes');
    expect(t.say).toEqual(['Sure, go ahead.']);
    expect(t.state.qa.count).toBe(0);
    t = say(t.state, 'how big is the team');
    expect(t.state.qa.count).toBe(1);
  });
});

describe('engine: on-device AI hooks', () => {
  const toIntro = () => say(startInterview(PLAN).state, 'ok').state;

  it('uses an AI intro follow-up only where the script would ask one', () => {
    const s = toIntro();
    expect(introWouldFollowUp(s, 'I am a frontend engineer')).toBe(false); // too short: "tell me more"
    expect(introWouldFollowUp(s, 'can you repeat that')).toBe(false);
    expect(introWouldFollowUp(s, INTRO)).toBe(true);
    const t = respond(s, INTRO, { aiFollowUp: 'What does checkout ownership mean for your team?' });
    expect(t.say.at(-1)).toBe('What does checkout ownership mean for your team?');
    expect(t.state.intro.followups).toEqual(['lead']);
    // Without AI text, the scripted follow-up.
    expect(respond(s, INTRO).say.at(-1)).toMatch(/You mentioned leading/);
  });

  it('tells the room what a behavioral probe is for, and scores stories the same way', () => {
    const plan = { ...PLAN, warmupCount: 0, introFollowups: 0 };
    const s = say(say(startInterview(plan).state, 'ok').state, INTRO).state;
    expect(s.stage).toBe('behavioral');
    const short = 'We disagreed about the architecture and we talked it through.';
    expect(behavioralProbeGoal(s, short)).toBe('more');
    expect(behavioralProbeGoal(s, 'hint please')).toBeNull();
    expect(behavioralProbeGoal(s, 'no')).toBeNull();
    const withAI = respond(s, short, { aiFollowUp: 'What exactly was the disagreement about?' });
    expect(withAI.say.at(-1)).toBe('What exactly was the disagreement about?');
    const scripted = respond(s, short);
    expect(withAI.state.beh.probes).toEqual(scripted.state.beh.probes);
  });

  it('uses an AI answer to a real question, never to "no" or a bare "yes"', () => {
    const plan = { ...PLAN, warmupCount: 0, introFollowups: 0, behavioral: [] };
    const s = say(say(startInterview(plan).state, 'ok').state, INTRO).state;
    expect(s.stage).toBe('questions');
    expect(questionsWouldAnswer(s, 'How big is the team?')).toBe(true);
    for (const reply of ['no', "no that's all", 'yes', 'can you repeat that'])
      expect(questionsWouldAnswer(s, reply)).toBe(false);
    const t = respond(s, 'How big is the team?', { aiAnswer: 'About eight engineers.' });
    expect(t.say[0]).toBe('About eight engineers.');
    expect(t.state.qa.count).toBe(1);
  });
});

describe('report', () => {
  it('ending early gives an incomplete report over the whole plan', () => {
    const t = say(
      toWarmup(),
      'a closure keeps the lexical scope alive and is garbage collected later'
    );
    const ended = endEarly(t.state);
    expect(ended.stage).toBe('done');
    expect(ended.transcript).toHaveLength(t.state.transcript.length);
    const r = buildReport(ended);
    expect(r.completed).toBe(false);
    expect(r.verdict.label).toBe('Incomplete');
    expect(r.endedDuring).toBe('Fundamentals');
    const status = Object.fromEntries(r.stages.map((x) => [x.id, x.status]));
    expect(status).toMatchObject({
      intro: 'completed',
      warmup: 'partial',
      behavioral: 'notReached',
      questions: 'notReached',
    });
    // One of two fundamentals answered (well): 50 for the round.
    expect(r.stages.find((x) => x.id === 'warmup')!.score).toBe(50);
    expect(r.completedScore).not.toBeNull();
    expect(r.score).toBeLessThan(r.completedScore!);
    expect(r.gaps.some((g) => g.startsWith('Not reached: leadership'))).toBe(true);
  });

  it('counts a skipped intro as 0 instead of leaving it out', () => {
    let t = say(startInterview(PLAN3).state, 'ok');
    t = say(t.state, 'skip');
    expect(t.state.stage).toBe('warmup');
    const r = buildReport(endEarly(t.state));
    expect(r.stages.find((x) => x.id === 'intro')).toMatchObject({ status: 'skipped', score: 0 });
  });

  it('adds every breakdown up to its round score, and counts hints from all rounds', () => {
    let t = say(toWarmup({ ...PLAN3, warmupCount: 1 }), 'hint');
    t = say(t.state, 'a closure keeps the lexical scope of the outer function');
    t = say(t.state, 'no');
    expect(t.state.stage).toBe('behavioral');
    t = say(t.state, 'hint');
    t = say(
      t.state,
      'I wrote the RFC for our checkout rewrite, I got buy in from two teams and it reduced build time by 30 percent. Looking back I would involve design earlier because they had good ideas.'
    );
    while (t.state.stage !== 'done') t = say(t.state, 'no');
    const r = buildReport(t.state);
    expect(r.completed).toBe(true);
    for (const st of r.stages.filter((x) => x.breakdown.length))
      expect(st.score).toBe(stageScore(st.breakdown));
    expect(r.hintsByRound).toMatchObject({ warmup: 1, behavioral: 1 });
    expect(r.hintsUsed).toBe(2);
  });
});
