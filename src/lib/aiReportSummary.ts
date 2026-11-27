import { promptWithTimeout } from '@/lib/builtInAI';
import type { InterviewReport } from '@/utils/interview/engine';

/**
 * A 2–3 sentence summary of an interview report, written by Chrome's on-device AI from the report's
 * own facts. Rejected (undefined) if it mentions a number or a round that isn't in the report, so it
 * can't contradict the scores shown next to it.
 */

const SYSTEM = `You write the summary at the top of a mock interview report, speaking to the candidate as "you".
Write 2 or 3 short sentences: their strongest area, the one thing to focus on next, and a brief encouraging close.
Use only the facts given. Do not invent numbers; if you mention a score, copy it exactly. No lists, no markdown, no headings.`;

/** The facts the model may use, as plain lines. */
export function reportFacts(report: InterviewReport): string {
  const rounds = report.stages
    .map((s) =>
      s.status === 'notReached'
        ? `${s.label}: not reached`
        : `${s.label}: ${s.score ?? 0}%${s.status === 'skipped' ? ' (skipped)' : ''}`
    )
    .join('; ');
  return [
    `Overall score: ${report.score}%${report.completed ? '' : ` (ended early during ${report.endedDuring ?? 'the interview'})`}`,
    `Rounds: ${rounds}`,
    `Strengths: ${report.strengths.slice(0, 3).join(' ') || 'none recorded'}`,
    `Most important to improve: ${report.gaps.slice(0, 3).join(' ') || 'nothing major'}`,
    `Hints asked: ${report.hintsUsed}`,
  ].join('\n');
}

const ROUND_WORDS: [string, RegExp][] = [
  ['coding', /\bcoding\b/i],
  ['design', /\bsystem design\b/i],
  ['warmup', /\bfundamentals\b/i],
  ['behavioral', /\bleadership\b/i],
];

/** The summary, cleaned, or undefined when it doesn't stick to the report. */
export function cleanSummary(raw: string, report: InterviewReport): string | undefined {
  if (/^\s*([-*•]|\d+[.)])\s/m.test(raw)) return undefined;
  const text = raw
    .replace(/[*_`#>]/g, '')
    .replace(/^\s*summary\s*:\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  const words = text.split(' ').filter(Boolean).length;
  if (words < 12 || words > 90) return undefined;
  if (/\b(as an ai|language model)\b/i.test(text)) return undefined;
  const allowed = new Set(reportFacts(report).match(/\d+/g) ?? []);
  if ((text.match(/\d+/g) ?? []).some((n) => !allowed.has(n))) return undefined;
  const ids = new Set(report.stages.map((s) => s.id));
  if (ROUND_WORDS.some(([id, re]) => re.test(text) && !ids.has(id as never))) return undefined;
  return text;
}

export async function aiReportSummary(
  report: InterviewReport,
  timeoutMs = 15000
): Promise<string | undefined> {
  const raw = await promptWithTimeout(SYSTEM, reportFacts(report), timeoutMs);
  return raw === undefined ? undefined : cleanSummary(raw, report);
}
