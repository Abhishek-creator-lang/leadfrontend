import { describe, expect, it } from 'vitest';
import { buildFeedbackPrompt, MAX_ANSWER_CHARS } from './aiFeedbackPrompt';

describe('buildFeedbackPrompt', () => {
  const base = {
    format: 'behavioral' as const,
    title: 'Tell me about a `conflict`',
    excerpt: 'A disagreement with a peer.',
    rubric: ['STAR structure', 'Ownership'],
    answer: 'I led the migration…',
  };

  it('includes the round, question, rubric and answer', () => {
    const p = buildFeedbackPrompt(base);
    expect(p).toContain('Round: Behavioral & Leadership');
    expect(p).toContain('Question: Tell me about a conflict');
    expect(p).toContain('- STAR structure\n- Ownership');
    expect(p).toContain('I led the migration…');
  });

  it('truncates very long answers', () => {
    const p = buildFeedbackPrompt({ ...base, answer: 'x'.repeat(MAX_ANSWER_CHARS + 500) });
    expect(p).toContain('[answer truncated]');
    expect(p.length).toBeLessThan(MAX_ANSWER_CHARS + 600);
  });
});
