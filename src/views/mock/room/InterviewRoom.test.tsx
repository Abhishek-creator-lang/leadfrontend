// @vitest-environment jsdom
import { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentProvider } from '@/context/ContentContext';
import { ThemeModeProvider } from '@/context/ThemeModeContext';
import { STORAGE_KEYS } from '@/constants/storage';
import { EMPTY_CONTENT } from '@/content/lookups';
import type { ClientContentIndex, QuestionSummary } from '@/content/types';
import type { InterviewMaterial } from '@/utils/interview/material';
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

vi.mock('@/app/mock-interview/actions', () => ({
  loadInterviewMaterialAction: vi.fn(async () => MATERIALS),
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
      <ThemeModeProvider>
        <ContentProvider content={CONTENT}>
          <InterviewRoom lineDelayMs={0} />
        </ContentProvider>
      </ThemeModeProvider>
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

    // Don't know → short explanation, then the next (easier) one.
    await answer("I don't know");
    expect(
      await screen.findByText('The short version: The hard thing is about closures.')
    ).toBeTruthy();
    expect(await screen.findByText('What is the easy thing?')).toBeTruthy();
    await answer('skip');

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
    expect(screen.getByRole('link', { name: 'The hard thing' }).getAttribute('href')).toBe(
      '/questions/quiz/hard'
    );

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.liveInterview)!);
    expect(saved).toHaveLength(1);
    expect(saved[0].report.score).toBeGreaterThan(0);
  }, 30_000);
});
