import { describe, expect, it } from 'vitest';
import { answerFromRequirements, isQuestion, mentionsComplexity } from './classify';
import {
  buildReport,
  codingEvent,
  respond,
  startInterview,
  type EngineState,
  type InterviewPlan,
} from './engine';
import { codingMaterial, withoutFollowUps, type CodingMaterial } from './material';

const PROMPT = `Implement \`myAt(index)\`. A negative index counts back from the end.

## Requirements

- Return \`undefined\` when the position is outside the array.
- Do not use the native \`at\`.
- Calling it on \`null\` throws a \`TypeError\`.

## Follow-up

- Why was \`at\` added when \`arr[arr.length - 1]\` works?
`;

const SOLUTION = `## Approach

\`at\` is a thin wrapper around a property read. The work is converting the index.

1. Reject \`null\` receivers with a \`TypeError\`.
2. Convert \`index\` with **ToIntegerOrInfinity**.
3. If negative, add \`length\`.

## Complexity

O(1) time and space.

## Edge cases

- **Sparse arrays:** a hole reads as undefined.
- **Strings:** work because the method is generic.

## Follow-ups

- **Why \`at\` exists:** because of expressions.
`;

const FILES = {
  'prompt.md': PROMPT,
  'solution.md': SOLUTION,
  'starter/index.js': 'export default function myAt() {}',
  'solution/index.js': 'SECRET SOLUTION',
  'index.test.js': 'test("x", () => {})',
};

const AT = {
  id: 'javascript/at',
  title: 'Array.prototype.at',
  format: 'javascript',
  difficulty: 'medium' as const,
};

describe('codingMaterial', () => {
  const m = codingMaterial(AT, FILES)!;

  it('sends starter and tests to the editor, never the solution', () => {
    expect(Object.keys(m.files).sort()).toEqual(['/index.js', '/index.test.js']);
    expect(JSON.stringify(m)).not.toContain('SECRET SOLUTION');
  });

  it('builds a hint ladder, requirements, complexity, edge cases and follow-ups', () => {
    expect(m.hints).toEqual([
      'at is a thin wrapper around a property read.',
      'Reject null receivers with a TypeError.',
      'Convert index with ToIntegerOrInfinity.',
    ]);
    expect(m.requirements).toHaveLength(3);
    expect(m.complexity).toBe('O(1) time and space.');
    expect(m.complexityTerms).toEqual(['O(1)']);
    expect(m.edgeCases).toEqual(['Sparse arrays', 'Strings']);
    expect(m.followUps[0]).toBe('Why was at added when arr[arr.length - 1] works?');
    expect(m.intro).toBe('Implement myAt(index).');
  });

  it('hides the prompt follow-ups from the candidate', () => {
    expect(withoutFollowUps(PROMPT)).not.toContain('Why was');
    expect(m.prompt).toContain('## Requirements');
  });

  it('rejects questions without tests', () => {
    expect(codingMaterial(AT, { 'starter/index.js': '' })).toBeNull();
  });
});

describe('coding helpers', () => {
  it.each([
    ['it is O of one in time and space', ['O(1)'], true],
    ['constant time', ['O(1)'], true],
    ['linear, because we loop once', ['O(n)'], true],
    ['n log n because of the sort', ['O(n log n)'], true],
    ['quadratic', ['O(n^2)'], true],
    ['linear', ['O(1)'], false],
  ])('"%s" mentions %j → %s', (answer, terms, expected) => {
    expect(mentionsComplexity(answer, terms)).toBe(expected);
  });

  it('recognises clarifying questions and answers them from the requirements', () => {
    expect(isQuestion('what if the index is outside the array')).toBe(true);
    expect(isQuestion("let's start")).toBe(false);
    expect(
      answerFromRequirements('what should happen if the index is outside the array?', [
        'Do not use the native at.',
        'Return undefined when the position is outside the array.',
      ])
    ).toBe('Return undefined when the position is outside the array.');
  });
});

// ---------- engine: coding stage ----------

const CODING: CodingMaterial = codingMaterial(AT, FILES)!;

const PLAN: InterviewPlan = {
  role: 'lead',
  warmupCount: 0,
  introFollowups: 0,
  quiz: [],
  behavioral: [
    {
      kind: 'behavioral',
      id: 'behavioral/x',
      ask: 'Tell me about a conflict.',
      title: 'x',
      assessing: [],
    },
  ],
  coding: CODING,
};

const INTRO =
  'I lead a team of six engineers building the checkout flow for a large ecommerce site used by millions of people';

function toCoding(): EngineState {
  let s = respond(startInterview(PLAN).state, 'ok').state;
  s = respond(s, INTRO).state;
  expect(s.stage).toBe('coding');
  return s;
}

describe('engine coding stage', () => {
  it('introduces the problem and mentions coding in the agenda', () => {
    const start = startInterview(PLAN);
    expect(start.say.join(' ')).toMatch(/a coding problem/);
    let t = respond(start.state, 'ok');
    t = respond(t.state, INTRO);
    expect(t.say).toContain("Good. Let's do some coding now.");
    expect(t.say.join(' ')).toMatch(/The problem is: Array\.prototype\.at\./);
    expect(t.say.at(-1)).toBe('Before you start, do you have any questions?');
  });

  it('answers clarifying questions from the requirements, then lets you code', () => {
    let t = respond(toCoding(), 'what should happen if the index is outside the array?');
    expect(t.say[0]).toBe(
      'Good question. Return undefined when the position is outside the array.'
    );
    t = respond(t.state, "no, I'm ready");
    expect(t.state.coding.phase).toBe('coding');
    expect(t.say[0]).toMatch(/^Sounds good\. Go ahead/);
  });

  it('gives hints from the approach, one at a time', () => {
    let t = respond(toCoding(), 'no questions');
    t = respond(t.state, 'can I get a hint');
    expect(t.say[0]).toBe("Here's a hint: at is a thin wrapper around a property read.");
    t = respond(t.state, 'hint please');
    expect(t.say[0]).toBe("Here's a hint: Reject null receivers with a TypeError.");
    expect(t.state.coding.hintIndex).toBe(2);
  });

  it('listens quietly while you think out loud', () => {
    let t = respond(toCoding(), 'no questions');
    t = respond(t.state, 'first I will convert the index to an integer');
    expect(t.say).toHaveLength(1); // occasional "Mm-hm."
    t = respond(t.state, 'then handle the negative case by adding the length');
    expect(t.say).toHaveLength(0);
    expect(t.state.awaiting).toBe(true);
    expect(t.state.coding.thinkAloud).toBe(2);
  });

  it('reacts to tests: failing, then passing → complexity and edge case → behavioral', () => {
    let s = respond(toCoding(), 'what about negative numbers?').state;
    s = respond(s, 'ready').state;
    let t = codingEvent(s, { type: 'tests', passed: 3, total: 5, elapsedRatio: 0.3 });
    expect(t.say).toEqual(['I see 2 tests failing. Take your time.']);
    t = codingEvent(t.state, { type: 'tests', passed: 5, total: 5, elapsedRatio: 0.4 });
    expect(t.say).toEqual([
      'Nice, all the tests pass.',
      "What's the time and space complexity of your solution?",
    ]);
    t = respond(t.state, "it's constant time, O of one");
    expect(t.say[0]).toMatch(/^(Right\.|Yes, that's right\.)$/);
    expect(t.say[1]).toBe('How does your solution handle sparse arrays?');
    t = respond(t.state, 'a hole is just a missing property so it returns undefined naturally');
    // Solved early → one twist question from the prompt's follow-ups.
    expect(t.say.at(-1)).toBe('Why was at added when arr[arr.length - 1] works?');
    t = respond(t.state, 'because negative indexes do not work with brackets and expressions');
    expect(t.state.stage).toBe('behavioral');
    expect(t.say.at(-1)).toBe('Tell me about a conflict.');

    const r = buildReport(t.state);
    expect(r.coding).toMatchObject({
      passed: 5,
      total: 5,
      complexityCorrect: true,
      clarifications: 1,
    });
    expect(r.coding!.score).toBeGreaterThanOrEqual(80);
    expect(r.stages.find((x) => x.id === 'coding')!.score).toBe(r.coding!.score);
  });

  it('corrects a wrong complexity answer', () => {
    let s = respond(toCoding(), 'ready').state;
    s = codingEvent(s, { type: 'tests', passed: 5, total: 5, elapsedRatio: 0.9 }).state;
    const t = respond(s, 'it is linear');
    expect(t.say[0]).toBe("Hmm, I'd say: O(1) time and space.");
  });

  it('asks you to run the tests before finishing, and to walk through failing code', () => {
    let t = respond(respond(toCoding(), 'ready').state, "I'm done");
    expect(t.say).toEqual(['Before we wrap up, could you run the tests?']);
    t = codingEvent(t.state, { type: 'tests', passed: 1, total: 4, elapsedRatio: 0.5 });
    t = respond(t.state, "I'm done");
    expect(t.say[0]).toMatch(/A few tests still fail/);
    t = respond(t.state, "I'm done");
    expect(t.say.at(-1)).toBe('Walk me through your approach, and what you would do next.');
  });

  it('nudges when idle, warns about time once, and stops at time up', () => {
    let s = respond(toCoding(), 'ready').state;
    let t = codingEvent(s, { type: 'idle' });
    expect(t.say).toEqual(["How's it going? Can you talk me through your approach so far?"]);
    t = codingEvent(t.state, { type: 'timeWarning', minutesLeft: 4.6 });
    expect(t.say).toEqual(['Just a heads-up: we have about 5 minutes left for this one.']);
    expect(codingEvent(t.state, { type: 'timeWarning', minutesLeft: 2 }).say).toEqual([]);
    s = codingEvent(t.state, { type: 'timeUp' }).state;
    expect(s.coding).toMatchObject({ phase: 'followups', timedOut: true });
    expect(s.transcript.at(-1)!.text).toBe(
      'Walk me through your approach, and what you would do next.'
    );
  });

  it('keeps waiting through silence while you code', () => {
    const s = respond(toCoding(), 'ready').state;
    const t = respond(s, null);
    expect(t.say).toEqual([]);
    expect(t.state.awaiting).toBe(true);
    expect(t.state.stage).toBe('coding');
  });
});
