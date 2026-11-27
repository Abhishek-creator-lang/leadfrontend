import { describe, expect, it } from 'vitest';
import {
  buildReport,
  designWouldProbe,
  respond,
  roundEvent,
  startInterview,
  type EngineState,
  type InterviewPlan,
} from './engine';
import { designMaterial, type DesignMaterial } from './material';

const PROMPT = `Design the front end of a **social news feed** similar to the Facebook home feed.

Users scroll indefinitely and react to posts.
`;

const SOLUTION = `## 1. Requirements exploration

### Functional requirements

- **Browse the feed**: infinite scroll.
- **Compose**: create posts.

## 2. Architecture / high-level design

### Rendering strategy
### Component tree

**Normalized entity store** and a **Real-time client**.

## 3. Data model

### Normalized shape

Keep **server state** apart from **client/UI state**.

## 4. Interface definition (API)

### Pagination: cursor, not offset
### Mutations

## 5. Optimizations and deep dives

### Infinite scroll and virtualization
### Optimistic updates
### Accessibility

## What a lead-level answer adds

- **Frames trade-offs with data**.
- **Defines contracts across teams**.

## Common follow-up questions

**How would you avoid showing the same post twice?** Dedupe by post id when merging pages. The server helps too.

**How do you restore scroll position after going back?** Keep the query cache in memory and scroll to the anchor post.
`;

const FEED = designMaterial(
  { id: 'system-design/news-feed', title: 'News Feed', format: 'system-design' },
  { 'prompt.md': PROMPT, 'solution.md': SOLUTION }
)!;

describe('designMaterial', () => {
  it('builds the five steps with key points from headings and bold terms', () => {
    expect(FEED.steps.map((s) => s.id)).toEqual([
      'requirements',
      'architecture',
      'data',
      'api',
      'deepdive',
    ]);
    expect(FEED.steps[0].keyPoints).toEqual(['Browse the feed', 'Compose']);
    expect(FEED.steps[1].keyPoints).toEqual([
      'Rendering strategy',
      'Component tree',
      'Normalized entity store',
      'Real-time client',
    ]);
    expect(FEED.steps[3].keyPoints).toEqual(['Pagination', 'Mutations']);
    expect(FEED.steps[4].keyPoints).toContain('Infinite scroll and virtualization');
  });

  it('extracts pushback questions with a one-line answer, and lead-level points', () => {
    expect(FEED.pushbacks[0]).toEqual({
      q: 'How would you avoid showing the same post twice?',
      a: 'Dedupe by post id when merging pages.',
    });
    expect(FEED.pushbacks).toHaveLength(2);
    expect(FEED.leadPoints).toEqual([
      'Frames trade-offs with data',
      'Defines contracts across teams',
    ]);
    expect(FEED.intro).toBe(
      'Design the front end of a social news feed similar to the Facebook home feed.'
    );
  });

  it('rejects questions without enough steps', () => {
    expect(
      designMaterial(
        { id: 'system-design/x', title: 'X', format: 'system-design' },
        { 'solution.md': '## Intro' }
      )
    ).toBeNull();
  });
});

// ---------- engine: design round ----------

const plan = (role: 'senior' | 'lead', design: DesignMaterial = FEED): InterviewPlan => ({
  role,
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
  coding: null,
  design,
});

const INTRO =
  'I lead a team of six engineers building the checkout flow for a large ecommerce site used by millions of people';

function toDesign(role: 'senior' | 'lead' = 'lead'): EngineState {
  let s = respond(startInterview(plan(role)).state, 'ok').state;
  s = respond(s, INTRO).state;
  expect(s.stage).toBe('design');
  return s;
}

describe('engine design round', () => {
  it('mentions design in the agenda and introduces the problem, starting with requirements', () => {
    const start = startInterview(plan('lead'));
    expect(start.say.join(' ')).toMatch(/a system design discussion/);
    const t = respond(respond(start.state, 'ok').state, INTRO);
    expect(t.say).toContain("Great. Let's zoom out to system design.");
    expect(t.say.join(' ')).toMatch(/Here's the problem: News Feed\./);
    expect(t.say.at(-1)).toMatch(/^Let's start with requirements/);
  });

  it('moves on after a strong answer, and probes a missed topic after a weak one', () => {
    let t = respond(
      toDesign(),
      'users browse the feed with infinite scroll and can compose new posts'
    );
    expect(t.say[0]).toMatch(/^(Good, that covers|Nice, that's thorough|Good\.)/);
    expect(t.say.at(-1)).toMatch(/high-level architecture/);

    t = respond(t.state, 'there would be some React components');
    expect(t.say.at(-1)).toBe('What about rendering strategy? How would you handle that here?');
    t = respond(
      t.state,
      'server render the first page then hydrate, with a normalized entity store'
    );
    expect(t.state.design.steps[1]).toMatchObject({ label: 'Architecture', grade: 'good' });
    expect(t.say.at(-1)).toMatch(/model the data/);
  });

  it('grades notes written on the board together with what was said', () => {
    const s = toDesign();
    expect(designWouldProbe(s, 'not much to add')).toBe(true);
    expect(designWouldProbe(s, 'not much to add', 'Browse the feed, Compose posts')).toBe(false);
    const t = roundEvent(s, {
      type: 'done',
      notes: 'Browse the feed (infinite scroll). Compose posts.',
    });
    expect(t.state.design.steps[0]).toMatchObject({ grade: 'good' });
  });

  it('uses an AI-written follow-up when one is provided', () => {
    const t = respond(toDesign(), 'hmm, a list of posts I guess', {
      aiFollowUp: 'Which posts load first on a slow 3G connection?',
    });
    expect(t.say.at(-1)).toBe('Which posts load first on a slow 3G connection?');
  });

  it('nudges with missed topics when moving on, then pushes back and asks the lead question', () => {
    let s = toDesign('lead');
    for (let i = 0; i < 5; i++) s = roundEvent(s, { type: 'done' }).state;
    expect(s.design.steps.every((x) => x.grade === 'weak')).toBe(true);
    expect(s.transcript.at(-1)!.text).toBe('How would you avoid showing the same post twice?');

    let t = respond(s, 'no idea');
    expect(t.say[0]).toBe('Okay. One approach I like: Dedupe by post id when merging pages.');
    expect(t.say.at(-1)).toBe('How do you restore scroll position after going back?');
    t = respond(
      t.state,
      'I would keep the list in a query cache and store the anchor post id and offset in history state, then restore it after layout'
    );
    expect(t.say[0]).toMatch(/solid approach|what I'd look for/);
    expect(t.say.at(-1)).toMatch(/As the lead, how would you roll this out/);
    t = respond(
      t.state,
      'I would define contracts across teams, ship behind flags, and frame trade-offs with data from real user monitoring'
    );
    expect(t.state.stage).toBe('behavioral');

    const r = buildReport(t.state);
    expect(r.design).toMatchObject({
      leadAnswered: true,
      pushbacks: [{ good: false }, { good: true }],
    });
    expect(r.stages.find((x) => x.id === 'design')!.score).toBe(r.design!.score);
    expect(r.gaps.some((g) => g.startsWith('System design, requirements: cover'))).toBe(true);
  });

  it('asks one pushback and no lead question for senior roles', () => {
    let s = toDesign('senior');
    for (let i = 0; i < 5; i++) s = roundEvent(s, { type: 'done' }).state;
    const t = respond(
      s,
      'dedupe by id when merging pages and let the server exclude already served items'
    );
    expect(t.state.stage).toBe('behavioral');
  });

  it('warns about time once and stops the round at time up', () => {
    const s = toDesign();
    let t = roundEvent(s, { type: 'timeWarning', minutesLeft: 3.7 });
    expect(t.say).toEqual(["We have about 4 minutes left for the design, so let's keep moving."]);
    expect(roundEvent(t.state, { type: 'timeWarning', minutesLeft: 1 }).say).toEqual([]);
    t = roundEvent(t.state, { type: 'timeUp' });
    expect(t.say[0]).toBe("We're out of time for the design, so let's stop here.");
    expect(t.state.stage).toBe('behavioral');
    expect(t.state.design.result).toMatchObject({ timedOut: true });
    expect(t.state.design.result!.steps).toHaveLength(5);
  });

  it('counts design hints and takes them off the score', () => {
    let t = respond(toDesign(), 'can I get a hint');
    expect(t.say[0]).toMatch(/^Here's a hint: think about browse the feed/);
    t = respond(t.state, 'users browse the feed with infinite scroll and can compose new posts');
    let s = t.state;
    for (let i = 0; i < 4; i++) s = roundEvent(s, { type: 'done' }).state;
    s = respond(s, 'dedupe by post id when merging pages').state;
    s = respond(s, 'keep the query cache in memory and scroll to the anchor post on return').state;
    s = respond(s, 'define contracts across teams').state;
    const r = buildReport(s);
    expect(r.design!.hints).toBe(1);
    expect(r.design!.breakdown.at(-1)).toEqual({ label: 'Hints used (1)', points: -5, max: 0 });
    expect(r.hintsByRound.design).toBe(1);
  });

  it('judges pushback by the approach, not just the length', () => {
    let s = toDesign('senior');
    for (let i = 0; i < 5; i++) s = roundEvent(s, { type: 'done' }).state;
    const short = respond(s, 'dedupe by post id when merging pages');
    expect(short.state.design.result!.pushbacks[0].good).toBe(true);
    const vague = respond(s, 'I would think about it carefully and discuss it with the team first');
    expect(vague.state.design.result!.pushbacks[0].good).toBe(false);
  });

  it('waits quietly through silence while you think or write notes', () => {
    const t = respond(toDesign(), null);
    expect(t.say).toEqual([]);
    expect(t.state.awaiting).toBe(true);
  });
});
