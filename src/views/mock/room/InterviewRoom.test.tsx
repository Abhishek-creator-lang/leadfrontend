// @vitest-environment jsdom
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentProvider } from '@/context/ContentContext';
import { ThemeModeProvider } from '@/context/ThemeModeContext';
import { STORAGE_KEYS } from '@/constants/storage';
import { EMPTY_CONTENT } from '@/content/lookups';
import type { ClientContentIndex, QuestionSummary } from '@/content/types';
import { makeStore } from '@/store';
import type { CodingMaterial, DesignMaterial, InterviewMaterial } from '@/utils/interview/material';
import InterviewRoom from './InterviewRoom';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const MATERIALS: InterviewMaterial[] = [
  ...(['easy', 'medium', 'hard'] as const).map((d): InterviewMaterial => ({
    kind: 'quiz',
    id: `quiz/${d}`,
    ask: `What is the ${d} thing?`,
    title: `The ${d} thing`,
    difficulty: d,
    category: 'javascript',
    keyPoints: ['closure', 'lexical scope'],
    summary: `The ${d} thing is about closures.`,
  })),
  {
    kind: 'behavioral',
    id: 'behavioral/conflict',
    ask: 'Tell me about a conflict.',
    title: 'Conflict',
    assessing: [],
  },
];

const mocks = vi.hoisted(() => ({ coding: null as unknown, design: null as unknown }));

vi.mock('@/app/mock-interview/actions', () => ({
  loadInterviewMaterialAction: vi.fn(async () => MATERIALS),
  loadCodingQuestionAction: vi.fn(async () => mocks.coding),
  loadDesignQuestionAction: vi.fn(async () => mocks.design),
}));

// Sandpack can't run in jsdom: a stand-in editor that reports test results like the real one.
vi.mock('./InterviewCodeEditor', () => ({
  default: ({ onTests }: { onTests: (r: { passed: number; total: number }) => void }) => (
    <div>
      <p>Fake editor</p>
      <button onClick={() => onTests({ passed: 1, total: 3 })}>Fail some tests</button>
      <button onClick={() => onTests({ passed: 3, total: 3 })}>Pass all tests</button>
    </div>
  ),
}));

const q = (id: string): QuestionSummary =>
  ({
    id,
    slug: id.split('/')[1],
    format: id.split('/')[0],
    title: id,
    excerpt: '',
    difficulty: 'medium',
    importance: 'high',
    duration: 5,
    topics: [],
    companies: [],
  }) as QuestionSummary;

const CONTENT: ClientContentIndex = {
  ...EMPTY_CONTENT,
  questions: [q('quiz/medium'), q('behavioral/conflict')],
};

beforeEach(() => {
  mocks.coding = null;
  mocks.design = null;
  localStorage.clear();
  sessionStorage.setItem(
    STORAGE_KEYS.liveInterviewConfig,
    JSON.stringify({ role: 'lead', length: 'short', mode: 'text' })
  );
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  Element.prototype.scrollTo ??= () => {};
});
afterEach(cleanup);

describe('InterviewRoom (typing mode)', () => {
  it('runs a whole interview: intro, follow-up, fundamentals, story, questions, report', async () => {
    const user = userEvent.setup();
    render(
      <Provider store={makeStore()}>
        <ThemeModeProvider>
          <ContentProvider content={CONTENT}>
            <InterviewRoom lineDelayMs={0} />
          </ContentProvider>
        </ThemeModeProvider>
      </Provider>
    );
    const answer = async (text: string) => {
      const box = await screen.findByRole('textbox', { name: 'Your answer' });
      await vi.waitFor(() => expect((box as HTMLTextAreaElement).disabled).toBe(false));
      await user.click(box);
      await user.paste(text);
      await user.keyboard('{Enter}');
    };

    await user.click(await screen.findByRole('button', { name: 'Join interview' }));
    expect(await screen.findByText(/^Hi, I'm Aarav/)).toBeTruthy();
    expect(await screen.findByText(/Sound good\?/)).toBeTruthy();

    await answer('Yes, sounds good');
    expect(await screen.findByText(/Tell me a bit about yourself/)).toBeTruthy();

    await answer(
      'I lead a team of six frontend engineers at an ecommerce company, we own checkout and I spend my time on architecture and reviews'
    );
    expect(await screen.findByText(/You mentioned leading/)).toBeTruthy();

    await answer(
      'Six engineers, and my week is mostly design reviews, planning and pairing with people'
    );
    expect(
      await screen.findByText("Let's do a few quick fundamentals", { exact: false })
    ).toBeTruthy();
    expect(await screen.findByText('What is the medium thing?')).toBeTruthy();

    // Good answer → harder question next.
    await answer('A closure keeps the lexical scope alive after the outer function returns');
    expect(await screen.findByText('What is the hard thing?')).toBeTruthy();

    // Don't know → short explanation, then the next stage (short interview: 2 questions).
    await answer("I don't know");
    expect(
      await screen.findByText('The short version: The hard thing is about closures.')
    ).toBeTruthy();

    expect(await screen.findByText('Tell me about a conflict.')).toBeTruthy();
    await answer(
      'Two senior engineers disagreed about state management. I set up a short design review, wrote down both options with trade-offs and I proposed a spike. We picked one in a week and it reduced bugs by 30 percent. Looking back I would have stepped in sooner.'
    );

    expect(await screen.findByText(/What questions do you have for me\?/)).toBeTruthy();
    await answer('What does the tech stack look like?');
    expect(await screen.findByText(/React and TypeScript/)).toBeTruthy();
    await answer("No, that's all");

    expect(await screen.findByText('Interview feedback', {}, { timeout: 3000 })).toBeTruthy();
    expect(screen.getByText('What went well')).toBeTruthy();
    // Per-question detail: open the question to see the answer, key points and the short answer.
    await user.click(screen.getByRole('button', { name: /^The hard thing/ }));
    expect(await screen.findByText('The hard thing is about closures.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Practise this question' }).getAttribute('href')).toBe(
      '/questions/quiz/hard'
    );

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.liveInterviewReports)!);
    expect(saved).toHaveLength(1);
    expect(saved[0].report.score).toBeGreaterThan(0);
    expect(saved[0].report.completed).toBe(true);
    expect(saved[0].transcript.length).toBeGreaterThan(5);
  }, 30_000);

  it('ending early saves an incomplete report', async () => {
    const user = userEvent.setup();
    render(
      <Provider store={makeStore()}>
        <ThemeModeProvider>
          <ContentProvider content={CONTENT}>
            <InterviewRoom lineDelayMs={0} />
          </ContentProvider>
        </ThemeModeProvider>
      </Provider>
    );
    await user.click(await screen.findByRole('button', { name: 'Join interview' }));
    const box = await screen.findByRole('textbox', { name: 'Your answer' });
    await vi.waitFor(() => expect((box as HTMLTextAreaElement).disabled).toBe(false));
    await user.click(box);
    await user.paste('Sounds good');
    await user.keyboard('{Enter}');
    expect(await screen.findByText(/Tell me a bit about yourself/)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /End/ }));

    expect(await screen.findByText('Incomplete')).toBeTruthy();
    expect(screen.getAllByText('Not reached').length).toBeGreaterThan(0);
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.liveInterviewReports)!);
    expect(saved[0].report).toMatchObject({ completed: false, endedDuring: 'Your intro' });
  }, 30_000);
});

// ---- voice: regression for "I can't hear Aarav and can't find how to speak" ----

class FakeUtterance {
  voice: unknown = null;
  lang = '';
  rate = 1;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public text: string) {}
}

class FakeRecognition {
  static last: FakeRecognition | null = null;
  lang = '';
  continuous = false;
  interimResults = false;
  onresult: ((e: unknown) => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  onend: (() => void) | null = null;
  constructor() {
    FakeRecognition.last = this;
  }
  start() {}
  stop() {}
  abort() {}
  say(text: string) {
    this.onresult?.({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: text } }] });
  }
}

describe('InterviewRoom (voice)', () => {
  const spoken: string[] = [];
  const w = window as unknown as Record<string, unknown>;

  beforeEach(() => {
    spoken.length = 0;
    w.SpeechSynthesisUtterance = FakeUtterance;
    w.speechSynthesis = {
      paused: false,
      speak: (u: FakeUtterance) => {
        spoken.push(u.text);
        setTimeout(() => u.onend?.(), 0);
      },
      cancel: () => {},
      resume: () => {},
      getVoices: () => [{ name: 'Google UK English Male', lang: 'en-GB' }],
      addEventListener: () => {},
    };
    w.webkitSpeechRecognition = FakeRecognition;
  });
  afterEach(() => {
    delete w.speechSynthesis;
    delete w.SpeechSynthesisUtterance;
    delete w.webkitSpeechRecognition;
  });

  const renderRoom = () =>
    render(
      <Provider store={makeStore()}>
        <ThemeModeProvider>
          <ContentProvider content={CONTENT}>
            <InterviewRoom lineDelayMs={0} />
          </ContentProvider>
        </ThemeModeProvider>
      </Provider>
    );

  it('speaks out loud and listens when voice was chosen in the lobby', async () => {
    sessionStorage.setItem(
      STORAGE_KEYS.liveInterviewConfig,
      JSON.stringify({ role: 'lead', length: 'short', mode: 'voice' })
    );
    const user = userEvent.setup();
    renderRoom();
    await user.click(await screen.findByRole('button', { name: 'Join interview' }));

    await vi.waitFor(() => expect(spoken[0]).toMatch(/^Hi, I'm Aarav/));
    // Microphone turns on by itself when it's your turn.
    expect(await screen.findByRole('button', { name: 'Listening… speak now' })).toBeTruthy();

    FakeRecognition.last!.say('yes sounds good');
    await user.click(await screen.findByRole('button', { name: "I'm done answering" }));
    await vi.waitFor(() => expect(spoken.at(-1)).toMatch(/Tell me a bit about yourself/));
  });

  it('still speaks when you answer by typing, and offers a speak button', async () => {
    const user = userEvent.setup();
    renderRoom(); // config from the outer beforeEach: typing
    await user.click(await screen.findByRole('button', { name: 'Join interview' }));
    await vi.waitFor(() => expect(spoken[0]).toMatch(/^Hi, I'm Aarav/));

    const speakButton = await screen.findByRole('button', { name: 'Speak your answer' });
    await vi.waitFor(() => expect((speakButton as HTMLButtonElement).disabled).toBe(false));
    await user.click(speakButton);
    expect(await screen.findByRole('button', { name: 'Listening… speak now' })).toBeTruthy();
  });

  it('can mute the interviewer', async () => {
    const user = userEvent.setup();
    renderRoom();
    await user.click(await screen.findByRole('button', { name: 'Join interview' }));
    await user.click(await screen.findByRole('button', { name: 'Mute Aarav' }));
    expect(screen.getByRole('button', { name: 'Unmute Aarav' })).toBeTruthy();
  });
});

// ---- coding round in the room ----

const CODING: CodingMaterial = {
  kind: 'coding',
  id: 'javascript/at',
  title: 'Array.prototype.at',
  format: 'javascript',
  difficulty: 'medium',
  prompt:
    'Implement **myAt**.\n\n## Requirements\n\n- Return undefined when the position is outside the array.',
  intro: 'Implement myAt(index).',
  files: { '/index.js': '', '/index.test.js': '' },
  hints: ['Convert the index first.'],
  requirements: ['Return undefined when the position is outside the array.'],
  complexity: 'O(1) time and space.',
  complexityTerms: ['O(1)'],
  edgeCases: ['Sparse arrays'],
  followUps: [],
};

describe('InterviewRoom (coding round)', () => {
  it('shows the problem and editor in the room and reacts to test results', async () => {
    mocks.coding = CODING;
    const user = userEvent.setup();
    render(
      <Provider store={makeStore()}>
        <ThemeModeProvider>
          <ContentProvider content={CONTENT}>
            <InterviewRoom lineDelayMs={0} />
          </ContentProvider>
        </ThemeModeProvider>
      </Provider>
    );
    const answer = async (text: string) => {
      const box = await screen.findByRole('textbox', { name: 'Your answer' });
      await vi.waitFor(() => expect((box as HTMLTextAreaElement).disabled).toBe(false));
      await user.click(box);
      await user.paste(text);
      await user.keyboard('{Enter}');
    };

    await user.click(await screen.findByRole('button', { name: 'Join interview' }));
    expect(await screen.findByText(/a coding problem/)).toBeTruthy();
    await answer('Sounds good');
    await answer(
      'I lead a team of six frontend engineers at an ecommerce company, we own checkout and I spend my time on architecture and reviews'
    );
    await answer(
      'Six engineers, and my week is mostly design reviews, planning and pairing with people'
    );
    await answer('A closure keeps the lexical scope alive after the outer function returns');
    await answer("I don't know");

    // Coding: problem and editor appear in the same room.
    expect(await screen.findByText('Fake editor')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Array.prototype.at' })).toBeTruthy();
    expect(await screen.findByText(/do you have any questions\?/)).toBeTruthy();

    await answer('What should happen if the index is outside the array?');
    expect(
      await screen.findByText(
        'Good question. Return undefined when the position is outside the array.'
      )
    ).toBeTruthy();
    await answer('No, ready');
    expect(await screen.findByRole('button', { name: /I'm done coding/ })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Fail some tests' }));
    expect(await screen.findByText('I see 2 tests failing. Take your time.')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Pass all tests' }));
    expect(await screen.findByText(/What's the time and space complexity/)).toBeTruthy();

    await answer("It's constant, O of one");
    expect(await screen.findByText('How does your solution handle sparse arrays?')).toBeTruthy();
    await answer('A hole is a missing property so reading it returns undefined, no special code');

    // Back to the conversation for the leadership question.
    expect(await screen.findByText('Tell me about a conflict.')).toBeTruthy();
    expect(screen.queryByText('Fake editor')).toBeNull();
  });
});

// ---- system design round in the room ----

const DESIGN: DesignMaterial = {
  kind: 'design',
  id: 'system-design/news-feed',
  title: 'News Feed',
  prompt: 'Design the front end of a **social news feed**.',
  intro: 'Design the front end of a social news feed.',
  steps: [
    {
      id: 'requirements',
      label: 'Requirements',
      ask: "Let's start with requirements. What would you clarify?",
      keyPoints: ['Browse the feed', 'Compose'],
    },
    {
      id: 'architecture',
      label: 'Architecture',
      ask: 'Walk me through the high-level architecture.',
      keyPoints: ['Rendering strategy', 'Component tree', 'Normalized entity store'],
    },
    {
      id: 'api',
      label: 'API',
      ask: 'What does the interface look like?',
      keyPoints: ['Pagination', 'Mutations'],
    },
  ],
  pushbacks: [{ q: 'How would you avoid showing the same post twice?', a: 'Dedupe by post id.' }],
  leadPoints: ['Defines contracts across teams'],
};

async function reachDesign(user: ReturnType<typeof userEvent.setup>) {
  const answer = async (text: string) => {
    const box = await screen.findByRole('textbox', { name: 'Your answer' });
    await vi.waitFor(() => expect((box as HTMLTextAreaElement).disabled).toBe(false));
    await user.click(box);
    await user.paste(text);
    await user.keyboard('{Enter}');
  };
  render(
    <Provider store={makeStore()}>
      <ThemeModeProvider>
        <ContentProvider content={CONTENT}>
          <InterviewRoom lineDelayMs={0} />
        </ContentProvider>
      </ThemeModeProvider>
    </Provider>
  );
  await user.click(await screen.findByRole('button', { name: 'Join interview' }));
  expect(await screen.findByText(/a system design discussion/)).toBeTruthy();
  await answer('Sounds good');
  await answer(
    'I lead a team of six frontend engineers at an ecommerce company, we own checkout and I spend my time on architecture and reviews'
  );
  await answer(
    'Six engineers, and my week is mostly design reviews, planning and pairing with people'
  );
  await answer('A closure keeps the lexical scope alive after the outer function returns');
  await answer("I don't know");
  await answer('skip');
  expect(await screen.findByText('Notes board')).toBeTruthy();
  return answer;
}

describe('InterviewRoom (system design round)', () => {
  beforeEach(() => {
    mocks.design = DESIGN;
    sessionStorage.setItem(
      STORAGE_KEYS.liveInterviewConfig,
      JSON.stringify({ role: 'lead', length: 'standard', mode: 'text' })
    );
  });
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).LanguageModel;
  });

  it('runs the design steps with a notes board, probes, pushback and the lead question', async () => {
    const user = userEvent.setup();
    const answer = await reachDesign(user);

    expect(screen.getByRole('heading', { name: 'News Feed' })).toBeTruthy();
    expect(await screen.findByText(/start with requirements/)).toBeTruthy();

    // Notes count: requirements written on the board, then "Next step".
    await user.click(screen.getByRole('textbox', { name: 'Notes: Requirements' }));
    await user.paste('Browse the feed with infinite scroll. Compose posts with images.');
    await user.click(screen.getByRole('button', { name: 'Next step' }));
    expect(await screen.findByText('Walk me through the high-level architecture.')).toBeTruthy();

    // A thin answer gets a probe on a missed topic.
    await answer('Some React components');
    expect(
      await screen.findByText('What about rendering strategy? How would you handle that here?')
    ).toBeTruthy();
    await answer('Server render the first page, then a normalized entity store on the client');
    expect(await screen.findByText('What does the interface look like?')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Next step' }));
    expect(
      await screen.findByText('How would you avoid showing the same post twice?')
    ).toBeTruthy();
    await answer('I do not know');
    expect(await screen.findByText('Okay. One approach I like: Dedupe by post id.')).toBeTruthy();
    expect(await screen.findByText(/As the lead, how would you roll this out/)).toBeTruthy();
    await answer(
      'Define contracts across teams, roll out behind flags and measure with real user data'
    );

    expect(await screen.findByText('Tell me about a conflict.')).toBeTruthy();
    expect(screen.queryByText('Notes board')).toBeNull();
  }, 30_000);

  it('asks a follow-up written by Chrome’s on-device AI when it is available', async () => {
    (globalThis as Record<string, unknown>).LanguageModel = {
      availability: async () => 'available',
      create: async () => ({
        promptStreaming: () =>
          new ReadableStream<string>({
            start(c) {
              c.enqueue('Which posts would you load first on a slow 3G phone?');
              c.close();
            },
          }),
        destroy: () => {},
      }),
    };
    const user = userEvent.setup();
    const answer = await reachDesign(user);
    await answer('Hmm, a list of posts I guess');
    expect(
      await screen.findByText(
        'Which posts would you load first on a slow 3G phone?',
        {},
        { timeout: 4000 }
      )
    ).toBeTruthy();
  }, 30_000);
});

// ---- Chrome's on-device AI across the interview ----

/** A fake Chrome model that answers by the job its system prompt describes. */
function fakeChromeAI(create = vi.fn()) {
  const reply = (system: string) =>
    /summary at the top/.test(system)
      ? 'Your strongest area was the fundamentals, where you explained closures clearly. Next, practise ending your stories with a concrete result. Keep going, you are close.'
      : /end of a job interview/.test(system)
        ? 'We are a small team of eight engineers, and most of our work is in React and TypeScript.'
        : /grade one answer/.test(system)
          ? '{"covered":["closure","lexical scope"],"incorrect":[],"verdict":"correct"}'
          : /starting a job interview/.test(system)
            ? 'What made the checkout ownership hard at your company?'
            : 'What did you personally say to the two engineers?';
  (globalThis as Record<string, unknown>).LanguageModel = {
    availability: async () => 'available',
    create: async (opts: { initialPrompts?: { content: string }[] }) => {
      create(opts);
      const text = reply(opts.initialPrompts?.[0]?.content ?? '');
      return {
        promptStreaming: () =>
          new ReadableStream<string>({
            start(c) {
              c.enqueue(text);
              c.close();
            },
          }),
        destroy: () => {},
      };
    },
  };
  return create;
}

describe('InterviewRoom (on-device AI)', () => {
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).LanguageModel;
  });

  const renderRoom = () =>
    render(
      <Provider store={makeStore()}>
        <ThemeModeProvider>
          <ContentProvider content={CONTENT}>
            <InterviewRoom lineDelayMs={0} />
          </ContentProvider>
        </ThemeModeProvider>
      </Provider>
    );

  it('asks tailored follow-ups, answers your questions and writes a summary', async () => {
    fakeChromeAI();
    const user = userEvent.setup();
    renderRoom();
    const answer = async (text: string) => {
      const box = await screen.findByRole('textbox', { name: 'Your answer' });
      await vi.waitFor(() => expect((box as HTMLTextAreaElement).disabled).toBe(false), {
        timeout: 4000,
      });
      await user.click(box);
      await user.paste(text);
      await user.keyboard('{Enter}');
    };

    await user.click(await screen.findByRole('button', { name: 'Join interview' }));
    await answer('Sounds good');
    await answer(
      'I lead a team of six frontend engineers at an ecommerce company, we own checkout and I spend my time on architecture and reviews'
    );
    expect(
      await screen.findByText('What made the checkout ownership hard at your company?')
    ).toBeTruthy();
    await answer('Three teams wanted different things and we had no shared roadmap at all');

    expect(await screen.findByText('What is the medium thing?')).toBeTruthy();
    // A paraphrase keywords miss: the on-device AI confirms it (raised one level, to partial),
    // so Aarav invites more instead of moving on.
    await answer('It keeps the outer variables around after the function returns');
    expect(
      await screen.findByText(/go a bit deeper|Anything you would add|say a bit more/)
    ).toBeTruthy();
    await answer("no, that's all");
    expect(await screen.findByText(/What is the (easy|hard) thing\?/)).toBeTruthy();
    await answer("I don't know");

    expect(await screen.findByText('Tell me about a conflict.')).toBeTruthy();
    await answer('Two engineers disagreed about state management and I set up a meeting.');
    expect(
      await screen.findByText('What did you personally say to the two engineers?')
    ).toBeTruthy();
    await answer(
      'I asked each of them to write down the trade-offs, I proposed a one week spike, it reduced bugs by 30 percent and I learned to step in sooner.'
    );

    expect(await screen.findByText(/What questions do you have for me\?/)).toBeTruthy();
    await answer('How big is the team?');
    expect(
      await screen.findByText(
        'We are a small team of eight engineers, and most of our work is in React and TypeScript.'
      )
    ).toBeTruthy();
    await answer("No, that's all");

    expect(await screen.findByText('Interview feedback', {}, { timeout: 4000 })).toBeTruthy();
    expect(
      await screen.findByText(/Your strongest area was the fundamentals/, {}, { timeout: 4000 })
    ).toBeTruthy();
    // The paraphrased fundamentals answer was confirmed by the on-device AI.
    expect(screen.getByText(/double-checked by Chrome’s on-device AI/)).toBeTruthy();
    await vi.waitFor(() => {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.liveInterviewReports)!);
      expect(saved[0].summary.text).toMatch(/Your strongest area/);
    });
  }, 60_000);

  it('makes no AI calls when the candidate switched the on-device AI off', async () => {
    const create = fakeChromeAI();
    sessionStorage.setItem(
      STORAGE_KEYS.liveInterviewConfig,
      JSON.stringify({ role: 'lead', length: 'short', mode: 'text', ai: false })
    );
    const user = userEvent.setup();
    renderRoom();
    await user.click(await screen.findByRole('button', { name: 'Join interview' }));
    const box = await screen.findByRole('textbox', { name: 'Your answer' });
    for (const text of [
      'Sounds good',
      'I lead a team of six frontend engineers at an ecommerce company, we own checkout and I spend my time on architecture and reviews',
    ]) {
      await vi.waitFor(() => expect((box as HTMLTextAreaElement).disabled).toBe(false));
      await user.click(box);
      await user.paste(text);
      await user.keyboard('{Enter}');
    }
    expect(await screen.findByText(/You mentioned leading/)).toBeTruthy();
    expect(create).not.toHaveBeenCalled();
  }, 30_000);
});
