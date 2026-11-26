import { describe, expect, it } from 'vitest';
import { countTests } from './testResults';

describe('countTests', () => {
  it('counts passing and failing tests across nested describe blocks', () => {
    expect(
      countTests({
        '/index.test.js': {
          tests: { top: { status: 'pass' } },
          describes: {
            myAt: {
              tests: { a: { status: 'pass' }, b: { status: 'fail' } },
              describes: { edge: { tests: { c: { status: 'pass' }, d: { status: 'idle' } } } },
            },
          },
        },
      })
    ).toEqual({ passed: 3, total: 4 });
  });

  it('handles no results', () => {
    expect(countTests({})).toEqual({ passed: 0, total: 0 });
  });
});
