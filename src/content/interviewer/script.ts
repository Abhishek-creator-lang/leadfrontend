/**
 * What the live interviewer says. Kept as data so the tone can be tuned without touching the
 * dialogue engine (src/utils/interview/engine.ts). Lines are short: they are spoken aloud.
 */

export const INTERVIEWER = {
  name: 'Aarav',
  role: 'Staff Frontend Engineer',
  initials: 'A',
};

export type InterviewRole = 'senior' | 'lead';

export const ROLE_LABEL: Record<InterviewRole, string> = {
  senior: 'Senior Frontend Engineer',
  lead: 'Lead Frontend Engineer',
};

export const opening = (role: InterviewRole, behavioralCount: number) => [
  `Hi, I'm ${INTERVIEWER.name}, a staff engineer on the web platform team. Thanks for making time today.`,
  `This is the interview for the ${ROLE_LABEL[role]} role. Here's the plan.`,
  `We'll start with a quick intro from you, then a few frontend fundamentals, then ${
    behavioralCount > 1 ? 'a couple of questions' : 'a question'
  } about how you work with teams. We'll keep a few minutes at the end for your questions.`,
  "Think out loud, ask if anything is unclear, and it's fine to ask for a hint. Sound good?",
];

export const INTRO_ASK = "Great. Let's start with you. Tell me a bit about yourself and what you're working on right now.";
export const INTRO_MORE = 'Could you tell me a bit more? What does your current role look like day to day?';

/** Follow-ups to the candidate's intro, chosen by what they mentioned. First match wins. */
export const INTRO_FOLLOWUPS: { id: string; when: RegExp; ask: string }[] = [
  {
    id: 'lead',
    when: /\b(lead|led|leading|manag\w*|tech lead|team of|my team|reports)\b/i,
    ask: 'You mentioned leading. How big is the team, and what does a typical week look like for you as a lead?',
  },
  {
    id: 'migration',
    when: /\b(migrat\w*|rewrite|rewrote|legacy|monolith|re-?platform\w*)\b/i,
    ask: 'You mentioned a migration. What made it hard, and how did you reduce the risk?',
  },
  {
    id: 'performance',
    when: /\b(performance|core web vitals|lcp|inp|cls|load time|bundle size|fast(er)?)\b/i,
    ask: "You mentioned performance. What's one improvement you drove, and how did you measure it?",
  },
  {
    id: 'design-system',
    when: /\b(design system|component library|ui library|storybook)\b/i,
    ask: 'Tell me more about the design system. How did you get other teams to adopt it?',
  },
  {
    id: 'mentoring',
    when: /\b(mentor\w*|hiring|interview\w*|coach\w*|onboard\w*)\b/i,
    ask: "You mentioned mentoring. Tell me about someone you helped grow. What changed for them?",
  },
  {
    id: 'framework',
    when: /\b(react|next(\.?js)?|angular|vue|svelte|typescript)\b/i,
    ask: "How do you usually structure state and data fetching in a large app with that stack?",
  },
  {
    id: 'proud',
    when: /./,
    ask: "What's the project from the last year or so that you're most proud of, and what was your part in it?",
  },
];

export const WARMUP_START = "Thanks, that's helpful. Let's do a few quick fundamentals. Short answers are fine.";
export const WARMUP_NEXT = ['Next one.', 'Okay, another one.', "Let's try this one.", 'Moving on.'];
export const ACK_GOOD = ['Nice, that covers it.', "Good, that's right.", 'Yes, exactly.', 'Great answer.'];
export const ACK_PARTIAL = ['Okay, partly there.', 'Right, that is part of it.', 'Okay.'];
export const ACK_DONT_KNOW = ["No problem, that's fine.", 'No worries.', "That's okay."];
export const probeMissing = (term: string) => `And where does ${term} come into it?`;
export const hintFor = (term: string) => `Here's a hint: think about ${term}.`;
export const explain = (summary: string) => `The short version: ${summary}`;
export const WARMUP_CLARIFY = "Explain it the way you would to a teammate who hasn't used it. What it is and why it matters.";

export const BEHAVIORAL_START = "Thanks. Let's switch gears and talk about how you work with people.";
export const BEHAVIORAL_NEXT = "Okay, one more like that.";
export const BEHAVIORAL_PROBES = {
  more: 'Can you walk me through the situation in a bit more detail? What was going on, and what was at stake?',
  ownership: 'You said "we" a lot. What did you personally do there?',
  result: 'How did it turn out? Any numbers you can share?',
  reflect: 'Looking back, what would you do differently?',
};
export const BEHAVIORAL_HINT =
  'A simple structure helps: the situation, your task, the actions you took, and the result.';
export const BEHAVIORAL_CLARIFY = 'Any real example from your work is fine. Walk me through what happened.';
export const ACK_STORY = ['Got it, thanks.', 'Okay, that helps.', 'Thanks for walking me through that.'];

export const QA_ASK = "That's all from my side. We have a few minutes. What questions do you have for me?";
export const QA_MORE = 'Anything else you want to know?';
export const QA_NONE =
  "That's okay. A small tip though: it's always good to have one or two questions ready. It shows you're evaluating us too.";

/** Answers to the candidate's questions, chosen by keywords. Last one is the fallback. */
export const QA_ANSWERS: { when: RegExp; answer: string }[] = [
  {
    when: /\b(team|size|people|structure|report)\b/i,
    answer:
      "The team is about eight engineers, mostly frontend, with a designer and a PM. Leads split their time between hands-on work and unblocking others.",
  },
  {
    when: /\b(stack|tech|react|typescript|tools?|framework)\b/i,
    answer:
      'Mostly React and TypeScript, with Next.js for the web app, a shared design system, and Playwright for end-to-end tests.',
  },
  {
    when: /\b(grow\w*|career|promot\w*|learn\w*|level)\b/i,
    answer:
      'Growth is mostly about scope. Leads own a product area end to end, and we have a clear path to staff for people who want to go deeper technically.',
  },
  {
    when: /\b(on-?call|incident|pager|support)\b/i,
    answer: 'There is a weekly on-call rotation for the frontend, and incidents get blameless reviews.',
  },
  {
    when: /\b(culture|process|agile|sprint|work|day|remote|hybrid)\b/i,
    answer:
      'We work in two-week cycles with written design docs for bigger changes. Most people are hybrid, and we try to keep meetings light.',
  },
  {
    when: /\b(next|steps|hear back|feedback|result|process)\b/i,
    answer: "You'll get feedback right after this, so you'll know where you stand.",
  },
  {
    when: /./,
    answer:
      "Good question. Honestly, it depends a lot on the team, but the short answer is we care about ownership and clear communication more than any specific process.",
  },
];

export const CLOSING = [
  'Thanks, I really enjoyed this conversation.',
  "That's the end of the interview. Your feedback is ready on the next screen.",
];

export const ENCOURAGE_SILENCE = 'Take your time. Whenever you are ready.';
export const REPEAT_PREFIX = 'Sure.';
