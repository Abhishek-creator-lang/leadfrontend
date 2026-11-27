import { afterEach, describe, expect, it, vi } from 'vitest';
import { aiFollowUp } from './aiFollowUp';
import { aiInterviewerAnswer, cleanInterviewerAnswer } from './aiInterviewerAnswer';
import { cleanSummary, reportFacts } from './aiReportSummary';
import { prepareChromeModel } from './builtInAI';
import {
  buildReport,
  endEarly,
  respond,
  startInterview,
  type InterviewReport,
} from '@/utils/interview/engine';

const g = globalThis as Record<string, unknown>;

/** A fake Chrome model that records the prompts it gets and replies with `reply`. */
function fakeModel(reply: string) {
  const prompts: { system: string; input: string }[] = [];
  g.LanguageModel = {
    availability: async () => 'available',
    create: async (opts: { initialPrompts?: { content: string }[] }) => ({
      promptStreaming: (input: string) => {
        prompts.push({ system: opts.initialPrompts?.[0]?.content ?? '', input });
        return new ReadableStream<string>({
          start(c) {
            c.enqueue(reply);
            c.close();
          },
        });
      },
      destroy: () => {},
    }),
  };
  return prompts;
}

afterEach(() => {
  delete g.LanguageModel;
});

describe('aiFollowUp', () => {
  it('tells the model what the behavioral follow-up should find out', async () => {
    const prompts = fakeModel('What did you personally change?');
    const q = await aiFollowUp('behavioral', {
      question: 'Tell me about a conflict.',
      answer: 'We had a disagreement and we fixed it.',
      goal: 'ownership',
    });
    expect(q).toBe('What did you personally change?');
    expect(prompts[0].input).toMatch(/what they personally did/);
    expect(prompts[0].system).toMatch(/behavioral/);
  });

  it('rejects replies that are not a single short question', async () => {
    fakeModel('Great story! You clearly led the team well.');
    expect(
      await aiFollowUp('intro', { question: 'Intro', answer: 'I lead a team' })
    ).toBeUndefined();
  });
});

describe('interviewer answers', () => {
  it.each([
    ['We are a team of eight engineers working mostly in React.', true],
    ['As an AI language model, I cannot share that.', false],
    ['- React\n- TypeScript\n- Next.js', false],
    ['Yes.', false],
    ['word '.repeat(100), false],
  ])('%j → accepted: %s', (raw, ok) => {
    expect(cleanInterviewerAnswer(raw) !== undefined).toBe(ok);
  });

  it('gives the model only the team facts', async () => {
    const prompts = fakeModel('The team is about eight engineers, with a designer and a PM.');
    expect(await aiInterviewerAnswer('How big is the team?')).toBe(
      'The team is about eight engineers, with a designer and a PM.'
    );
    expect(prompts[0].system).toMatch(/about eight engineers/);
    expect(prompts[0].system).toMatch(/recruiter/);
  });
});

describe('report summary', () => {
  const report: InterviewReport = (() => {
    let s = startInterview({
      role: 'lead',
      warmupCount: 0,
      introFollowups: 0,
      quiz: [],
      behavioral: [],
      coding: null,
      design: null,
    }).state;
    s = respond(s, 'ok').state;
    s = respond(s, 'I lead a team of six engineers who build the checkout for a large shop').state;
    return buildReport(endEarly(s));
  })();

  it('builds its facts from the report', () => {
    expect(reportFacts(report)).toMatch(new RegExp(`Overall score: ${report.score}%`));
    expect(reportFacts(report)).toMatch(/Your questions: not reached/);
  });

  it('accepts a summary that sticks to the report', () => {
    const text = `Your intro was clear and you scored ${report.score}% overall. Next, finish a full interview so every round gets feedback. Keep practising.`;
    expect(cleanSummary(text, report)).toBe(text);
  });

  it('rejects invented numbers and rounds the interview did not have', () => {
    expect(
      cleanSummary(
        'You scored 97% overall and your intro was clear. Next, finish a full interview. Keep going!',
        report
      )
    ).toBeUndefined();
    expect(
      cleanSummary(
        'Your intro was clear. Your coding round needs work, so practise more problems. Keep going!',
        report
      )
    ).toBeUndefined();
  });
});

describe('prepareChromeModel', () => {
  it('reports download progress and resolves true once the model is ready', async () => {
    let state = 'downloadable';
    const destroy = vi.fn();
    g.LanguageModel = {
      availability: async () => state,
      create: async (opts: { monitor?: (m: EventTarget) => void }) => {
        const m = new EventTarget();
        opts.monitor?.(m);
        const e = new Event('downloadprogress') as Event & { loaded: number };
        e.loaded = 0.5;
        m.dispatchEvent(e);
        state = 'available';
        return { promptStreaming: vi.fn(), destroy };
      },
    };
    const progress: number[] = [];
    expect(await prepareChromeModel((p) => progress.push(p))).toBe(true);
    expect(progress).toEqual([0.5, 1]);
    expect(destroy).toHaveBeenCalled();
  });

  it('resolves false when Chrome cannot set the model up', async () => {
    g.LanguageModel = {
      availability: async () => 'downloadable',
      create: async () => {
        throw new Error('NotAllowedError');
      },
    };
    expect(await prepareChromeModel(() => {})).toBe(false);
  });
});
