import { describe, expect, it } from 'vitest';
import { parseJudgement } from './aiGrade';

describe('parseJudgement', () => {
  it('reads the JSON even with prose or code fences around it', () => {
    expect(
      parseJudgement('```json\n{"covered":["cleanup"],"incorrect":[],"verdict":"partial"}\n```')
    ).toEqual({ covered: ['cleanup'], incorrect: [], verdict: 'partial' });
  });

  it('rejects anything that is not the expected shape', () => {
    expect(parseJudgement('Looks good to me!')).toBeUndefined();
    expect(
      parseJudgement('{"covered":"cleanup","incorrect":[],"verdict":"partial"}')
    ).toBeUndefined();
    expect(parseJudgement('{"covered":[],"incorrect":[],"verdict":"great"}')).toBeUndefined();
    expect(parseJudgement('{"covered":[1, "x"],"incorrect":[],"verdict":"correct"}')).toEqual({
      covered: ['x'],
      incorrect: [],
      verdict: 'correct',
    });
  });
});
