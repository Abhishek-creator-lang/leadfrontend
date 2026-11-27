// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeModeProvider } from '@/context/ThemeModeContext';
import { STORAGE_KEYS } from '@/constants/storage';
import MockInterviewPage from './MockInterviewPage';

const push = vi.fn();
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  useRouter: () => ({ push }),
  usePathname: () => '/mock-interview',
}));

afterEach(cleanup);

describe('MockInterviewPage', () => {
  it('is the lobby for the live interview only', async () => {
    const user = userEvent.setup();
    render(
      <ThemeModeProvider>
        <MockInterviewPage />
      </ThemeModeProvider>
    );
    expect(await screen.findByText('Live interview with Aarav')).toBeTruthy();
    expect(screen.queryByText('Quick self-check')).toBeNull();

    await user.click(screen.getByRole('button', { name: /Full loop/ }));
    await user.click(screen.getByRole('button', { name: 'Start live interview' }));
    expect(push).toHaveBeenCalledWith('/mock-interview/room');
    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEYS.liveInterviewConfig)!)).toMatchObject({
      role: 'lead',
      length: 'standard',
    });
  });
});
