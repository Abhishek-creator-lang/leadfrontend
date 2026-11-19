import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App, { ProgressBar } from './App';

describe('ProgressBar', () => {
  test('exposes progressbar semantics and a label', () => {
    render(<ProgressBar value={42} label="Download" />);
    const bar = screen.getByRole('progressbar', { name: 'Download' });
    expect(bar.getAttribute('aria-valuenow')).toBe('42');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
    expect(screen.getByText('42%')).toBeTruthy();
  });

  test('clamps out-of-range values', () => {
    render(
      <>
        <ProgressBar value={150} label="High" />
        <ProgressBar value={-20} label="Low" />
      </>
    );
    expect(screen.getByRole('progressbar', { name: 'High' }).getAttribute('aria-valuenow')).toBe('100');
    expect(screen.getByRole('progressbar', { name: 'Low' }).getAttribute('aria-valuenow')).toBe('0');
    expect(screen.getByText('100%')).toBeTruthy();
    expect(screen.getByText('0%')).toBeTruthy();
  });

  test('respects a custom max', () => {
    render(<ProgressBar value={3} max={4} label="Steps" />);
    const bar = screen.getByRole('progressbar', { name: 'Steps' });
    expect(bar.getAttribute('aria-valuemax')).toBe('4');
    expect(screen.getByText('75%')).toBeTruthy();
  });

  test('indeterminate when value is null', () => {
    render(<ProgressBar value={null} label="Waiting" />);
    const bar = screen.getByRole('progressbar', { name: 'Waiting' });
    expect(bar.getAttribute('aria-valuenow')).toBeNull();
  });

  test('demo buttons change the value', () => {
    render(<App />);
    const bar = screen.getByRole('progressbar', { name: 'Upload progress' });
    expect(bar.getAttribute('aria-valuenow')).toBe('30');
    fireEvent.click(screen.getByRole('button', { name: '+10%' }));
    expect(bar.getAttribute('aria-valuenow')).toBe('40');
    fireEvent.click(screen.getByRole('button', { name: '−10%' }));
    fireEvent.click(screen.getByRole('button', { name: '−10%' }));
    expect(bar.getAttribute('aria-valuenow')).toBe('20');
  });
});
