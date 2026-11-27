// @vitest-environment jsdom
import { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { STORAGE_KEYS } from '@/constants/storage';
import { LiveInterviewSetup } from './LiveInterviewSetup';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const g = globalThis as Record<string, unknown>;

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  push.mockReset();
});
afterEach(() => {
  cleanup();
  delete g.LanguageModel;
});

describe('LiveInterviewSetup: smarter interviewer', () => {
  it('shows nothing about AI in browsers without Chrome’s built-in AI', async () => {
    render(<LiveInterviewSetup />);
    expect(await screen.findByRole('button', { name: /Start live interview/ })).toBeTruthy();
    expect(screen.queryByText(/smarter interviewer/i)).toBeNull();
    expect(screen.queryByText(/on-device AI/)).toBeNull();
  });

  it('downloads Chrome’s model with progress, then offers the switch', async () => {
    let state = 'downloadable';
    let finish: () => void = () => {};
    g.LanguageModel = {
      availability: async () => state,
      create: (opts: { monitor?: (m: EventTarget) => void }) =>
        new Promise((resolve) => {
          const m = new EventTarget();
          opts.monitor?.(m);
          const e = new Event('downloadprogress') as Event & { loaded: number };
          e.loaded = 0.4;
          m.dispatchEvent(e);
          finish = () => {
            state = 'available';
            resolve({ promptStreaming: vi.fn(), destroy: () => {} });
          };
        }),
    };
    const user = userEvent.setup();
    render(<LiveInterviewSetup />);
    await user.click(await screen.findByRole('button', { name: 'Enable smarter interviewer' }));
    expect(await screen.findByText(/Downloading Chrome's on-device AI… 40%/)).toBeTruthy();
    finish();
    const toggle = await screen.findByRole('checkbox', { name: /Use on-device AI/ });
    expect((toggle as HTMLInputElement).checked).toBe(true);
  });

  it('saves the switch with the interview settings', async () => {
    g.LanguageModel = { availability: async () => 'available', create: vi.fn() };
    const user = userEvent.setup();
    render(<LiveInterviewSetup />);
    await user.click(await screen.findByRole('checkbox', { name: /Use on-device AI/ }));
    await user.click(screen.getByRole('button', { name: /Start live interview/ }));
    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEYS.liveInterviewConfig)!)).toMatchObject({
      ai: false,
    });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.aiPrefs)!)).toEqual({ enabled: false });
  });

  it('says the interview still works when the download fails', async () => {
    g.LanguageModel = {
      availability: async () => 'downloadable',
      create: async () => {
        throw new Error('NotAllowedError');
      },
    };
    const user = userEvent.setup();
    render(<LiveInterviewSetup />);
    await user.click(await screen.findByRole('button', { name: 'Enable smarter interviewer' }));
    expect(await screen.findByText(/The interview works fine without/)).toBeTruthy();
  });
});
