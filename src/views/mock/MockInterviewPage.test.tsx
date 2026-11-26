// @vitest-environment jsdom
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentProvider } from '@/context/ContentContext';
import { MockInterviewProvider } from '@/context/MockInterviewContext';
import { ThemeModeProvider } from '@/context/ThemeModeContext';
import { STORAGE_KEYS } from '@/constants/storage';
import { EMPTY_CONTENT } from '@/content/lookups';
import type { ClientContentIndex, QuestionSummary } from '@/content/types';
import { makeStore } from '@/store';
import MockInterviewPage from './MockInterviewPage';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const q = (id: string): QuestionSummary =>
  ({
    id,
    slug: id.split('/')[1],
    format: id.split('/')[0],
    title: `Question ${id}`,
    excerpt: 'Do the thing.',
    difficulty: 'medium',
    importance: 'high',
    duration: 20,
    topics: [],
    companies: [],
  }) as QuestionSummary;

const CONTENT: ClientContentIndex = {
  ...EMPTY_CONTENT,
  questions: [q('javascript/debounce'), q('system-design/news-feed')],
};

function renderPage() {
  return render(
    <ThemeModeProvider>
      <ContentProvider content={CONTENT}>
        <Provider store={makeStore()}>
          <MockInterviewProvider>
            <MockInterviewPage />
          </MockInterviewProvider>
        </Provider>
      </ContentProvider>
    </ThemeModeProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
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
});
afterEach(cleanup);

describe('MockInterviewPage', () => {
  it('runs a quick loop from setup to scorecard and saves it to history', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Quick 45' }));
    await user.click(screen.getByRole('button', { name: 'Start mock interview' }));

    // Round 1: JavaScript
    expect(screen.getByText('Round 1 of 2 · 20 min')).toBeTruthy();
    expect(screen.getByText('Question javascript/debounce')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Start round and timer' }));
    expect(screen.getByRole('link', { name: /Open in workspace/ }).getAttribute('href')).toBe(
      '/questions/javascript/debounce'
    );
    // Tick all 6 JavaScript rubric items.
    for (const box of screen.getAllByRole('checkbox')) await user.click(box);
    expect(screen.getByText('Round score: 100%')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Next round' }));

    // Round 2: system design, tick nothing.
    expect(screen.getByText('Question system-design/news-feed')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Start round and timer' }));
    await user.click(screen.getByRole('button', { name: 'Finish interview' }));

    // Scorecard: 100% × 20 min + 0% × 25 min → 44%.
    expect(screen.getByText('Quick 45 scorecard')).toBeTruthy();
    expect(screen.getByText('44%')).toBeTruthy();
    expect(screen.getByText('No hire')).toBeTruthy();

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.mockInterview)!);
    expect(saved.history).toHaveLength(1);

    // Back to setup: the finished interview is listed.
    await user.click(screen.getByRole('button', { name: 'New mock interview' }));
    const past = screen.getByText('Past mock interviews').parentElement!;
    expect(within(past).getByText('44%')).toBeTruthy();
  });

  it('restores an interview in progress after a reload', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Quick 45' }));
    await user.click(screen.getByRole('button', { name: 'Start mock interview' }));
    cleanup();

    renderPage();
    expect(await screen.findByText('Round 1 of 2 · 20 min')).toBeTruthy();
  });
});
