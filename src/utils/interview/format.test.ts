import { describe, expect, it } from 'vitest';
import { formatClock, verdict } from './format';

describe('format', () => {
  it('maps scores to verdicts', () => {
    expect(verdict(90).label).toBe('Strong hire');
    expect(verdict(70).label).toBe('Hire');
    expect(verdict(50).label).toBe('Lean no hire');
    expect(verdict(10).label).toBe('No hire');
  });

  it('formats clocks', () => {
    expect(formatClock(605)).toBe('10:05');
    expect(formatClock(-30)).toBe('-0:30');
  });
});
