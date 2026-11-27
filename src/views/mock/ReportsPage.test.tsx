// @vitest-environment jsdom
import { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { buildReport, endEarly, respond, startInterview } from '@/utils/interview/engine';
import { saveRecord } from './room/liveStore';
import ReportsPage from './ReportsPage';

const nav = vi.hoisted(() => ({ id: null as string | null, push: vi.fn() }));

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(nav.id ? { id: nav.id } : {}),
  useRouter: () => ({ push: nav.push }),
}));
vi.mock('@/layout/Page', () => ({
  Page: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

function seed(id: string, at: number) {
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
  const ended = endEarly(s);
  saveRecord({
    id,
    at,
    config: { role: 'lead', length: 'short', mode: 'text' },
    report: buildReport(ended, { durationSec: 300 }),
    transcript: ended.transcript,
  });
}

beforeEach(() => {
  localStorage.clear();
  nav.id = null;
});
afterEach(cleanup);

describe('ReportsPage', () => {
  it('lists saved interviews with a trend and links to each report', () => {
    seed('one', Date.UTC(2026, 0, 1));
    seed('two', Date.UTC(2026, 0, 2));
    render(<ReportsPage />);
    expect(screen.getByText('Your interview reports')).toBeTruthy();
    expect(
      screen.getByRole('img', { name: /Overall score over your last 2 interviews/ })
    ).toBeTruthy();
    const links = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href')?.includes('?id='));
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/mock-interview/reports?id=two',
      '/mock-interview/reports?id=one',
    ]);
    expect(screen.getAllByText('Ended early')).toHaveLength(2);
  });

  it('shows one full report with its transcript', () => {
    seed('one', Date.UTC(2026, 0, 1));
    nav.id = 'one';
    render(<ReportsPage />);
    expect(screen.getByText('Interview feedback')).toBeTruthy();
    expect(screen.getByText('Incomplete')).toBeTruthy();
    expect(screen.getByText('Full transcript')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeTruthy();
  });

  it('says so when a report is not in this browser', () => {
    nav.id = 'missing';
    render(<ReportsPage />);
    expect(screen.getByText(/isn't saved in this browser/)).toBeTruthy();
  });
});
