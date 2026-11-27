import { describe, expect, it } from 'vitest';
import { combineWithAI, gradeAnswer, matchKeyPoint } from './classify';
import { GRADING_FIXTURES } from './grading.fixtures';

describe('keyword grading accuracy', () => {
  const keywordCases = GRADING_FIXTURES.filter((f) => !f.aiOnly);
  const results = keywordCases.map((f) => ({ f, got: gradeAnswer(f.answer, f.keyPoints).grade }));

  it('agrees with the human label on at least 90% of the labelled answers', () => {
    const wrong = results.filter((r) => r.got !== r.f.expected);
    const agreement = 1 - wrong.length / results.length;
    expect(
      agreement,
      wrong
        .map((r) => `${r.f.kind}: "${r.f.answer}" → ${r.got}, expected ${r.f.expected}`)
        .join('\n')
    ).toBeGreaterThanOrEqual(0.9);
  });

  it.each(results.filter((r) => ['negated', 'trap', 'list', 'filler'].includes(r.f.kind)))(
    'never rates a $f.kind answer "good": $f.answer',
    ({ got }) => {
      expect(got).not.toBe('good');
    }
  );
});

describe('key-point matching', () => {
  it('needs every word of a multi-word term', () => {
    expect(matchKeyPoint('the loop runs forever', 'event loop').hit).toBe(false);
    expect(matchKeyPoint('the event loop runs forever', 'event loop').hit).toBe(true);
  });

  it('matches whole words only', () => {
    expect(matchKeyPoint('draw it on a bitmap', 'map').hit).toBe(false);
    expect(matchKeyPoint('use a Map keyed by id', 'map').hit).toBe(true);
  });

  it('flags a negated key point as contradicted, not covered', () => {
    const m = matchKeyPoint('fetch is not asynchronous', 'asynchronous');
    expect(m).toMatchObject({ hit: false, contradicted: true });
    expect(matchKeyPoint('it is not only asynchronous but also lazy', 'asynchronous').hit).toBe(
      true
    );
  });

  it('accepts curated aliases and acronyms', () => {
    expect(matchKeyPoint('it prevents XSS', 'Cross-site scripting').hit).toBe(true);
    expect(matchKeyPoint('we use ssr for the landing page', 'Server-side rendering').hit).toBe(
      true
    );
  });

  it('reports the words that matched', () => {
    expect(matchKeyPoint('make an abort controller first', 'AbortController').phrase).toBe(
      'abort controller'
    );
  });
});

describe('on-device AI second opinion', () => {
  const kp = ['useEffect', 'dependency array', 'cleanup'];

  it('can lower a keyword grade by one level when it names a wrong statement', () => {
    const answer =
      'useEffect runs before the browser paints, synchronously, and the cleanup only runs once';
    const g = gradeAnswer(answer, kp);
    expect(g.grade).toBe('good');
    const c = combineWithAI(
      g,
      { covered: kp, incorrect: ['runs before paint'], verdict: 'partial' },
      kp
    );
    expect(c.grade).toBe('partial');
    expect(c.incorrect).toEqual(['runs before paint']);
  });

  it('can raise a grade by one level for paraphrased key points, and ignores unknown ones', () => {
    const g = gradeAnswer('use effect runs after render and you can return a function', kp);
    expect(g.grade).toBe('partial');
    const c = combineWithAI(
      g,
      { covered: ['cleanup', 'made-up point'], incorrect: [], verdict: 'correct' },
      kp
    );
    expect(c.grade).toBe('good');
    expect(c.aiCovered).toEqual(['cleanup']);
    expect(c.hit).not.toContain('made-up point');
  });

  it('never moves more than one level', () => {
    const g = gradeAnswer('something unrelated', kp);
    expect(g.grade).toBe('weak');
    const c = combineWithAI(g, { covered: kp, incorrect: [], verdict: 'correct' }, kp);
    expect(c.grade).toBe('partial');
  });
});
