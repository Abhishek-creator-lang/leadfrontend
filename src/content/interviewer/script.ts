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

export const opening = (
  role: InterviewRole,
  behavioralCount: number,
  hasCoding = false,
  hasDesign = false
) => [
  `Hi, I'm ${INTERVIEWER.name}, a staff engineer on the web platform team. Thanks for making time today.`,
  `This is the interview for the ${ROLE_LABEL[role]} role. Here's the plan.`,
  `We'll start with a quick intro from you, then a few frontend fundamentals, ${
    hasCoding ? 'a coding problem, ' : ''
  }${hasDesign ? 'a system design discussion, ' : ''}then ${
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
export const warmupRephrase = (title: string) =>
  `Let me put it another way. The topic is: ${title}. What is it, and when does it matter in practice?`;
/** Neutral follow-up on a partial answer: invites more without giving anything away. */
export const PROBE_DEEPER = [
  'Can you go a bit deeper? Anything else that matters here?',
  'Anything you would add to that?',
  'Can you say a bit more about how it works?',
];
export const FINISH_PARTIAL = 'Okay, thanks.';

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
export const BEHAVIORAL_NO_STORY =
  "That's okay. A similar situation works too, even from a side project or outside work. Do you want to try one, or shall we move on?";
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
export const GO_AHEAD = 'Sure, go ahead.';
export const HINT_DECLINED = 'Sure, take your time.';
export const NO_STORY_YET = 'No problem, take a moment.';

/** "How should I answer this?": the shape of a good answer in each part of the interview. */
export const HOW_TO_ANSWER: Record<
  'intro' | 'warmup' | 'coding' | 'design' | 'behavioral' | 'questions',
  string
> = {
  intro:
    'About a minute is perfect: your current role and scope, one thing you are proud of, and what you want next.',
  warmup:
    'Say what it is, why it matters, and give one quick example. Thirty seconds to a minute is plenty.',
  coding:
    'Tell me your approach first, then code it. Talk through your thinking, and run the tests when you want feedback.',
  design:
    'State your assumptions first, then walk me through your choices and their trade-offs. Notes on the board count too.',
  behavioral:
    'Use a real example: the situation, what you were responsible for, what you did, and the result. Say "I" for your part.',
  questions:
    'Anything you would like to know: the team, the work, how we make decisions, or what happens next.',
};
/** "Just tell me the answer" during the coding or design round: a hint instead. */
export const NO_SOLUTION = "I can't give you the full answer, but here's something to help.";
export const BEHAVIORAL_NO_RIGHT_ANSWER =
  "There's no single right answer here. I'm interested in a real situation and what you did.";

// ---- coding round ----

export const CODING_START = "Good. Let's do some coding now.";
export const codingIntro = (title: string, intro: string) => [
  `The problem is: ${title}. ${intro}`,
  'The full details and the tests are on your screen. Take a minute to read them.',
  'Before you start, do you have any questions?',
];
export const CLARIFY_ANSWER = (req: string) => `Good question. ${req}`;
export const CLARIFY_OPEN = "That's up to you. Make a reasonable assumption and tell me what it is.";
export const CLARIFY_MORE = 'Anything else, or are you ready to start?';
export const CODING_KEEP_GOING = "Sure, keep going. Say you're done when you want to wrap up.";
export const CODING_GO =
  "Sounds good. Go ahead, and talk me through your thinking as you code. Run the tests whenever you're ready.";
export const CODING_GO_NO_QUESTIONS =
  "Okay, go ahead. Talk me through your thinking as you code, and run the tests whenever you're ready.";
export const THINK_ACK = ['Mm-hm.', 'Okay, sounds good.', 'Makes sense.', 'Okay.'];
export const CODING_HINT = (hint: string) => `Here's a hint: ${hint}`;
export const CODING_NO_MORE_HINTS = "I've given you all my hints. Try writing it step by step, and test as you go.";
export const CODING_NUDGE = "How's it going? Can you talk me through your approach so far?";
export const CODING_FAILING = (failing: number) =>
  `I see ${failing === 1 ? 'one test' : `${failing} tests`} failing. Take your time.`;
export const CODING_OFFER_HINT = 'Would you like a hint?';
export const CODING_TIME_WARNING = (minutes: number) =>
  `Just a heads-up: we have about ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} left for this one.`;
export const CODING_TIME_UP = "Let's pause the coding here, in the interest of time.";
export const CODING_RUN_FIRST = 'Before we wrap up, could you run the tests?';
export const CODING_STILL_FAILING =
  'A few tests still fail. Do you want to keep going, or walk me through what you have?';
export const CODING_ALL_PASS = 'Nice, all the tests pass.';
export const CODING_WALKTHROUGH = 'Walk me through your approach, and what you would do next.';
export const CODING_COMPLEXITY_Q = "What's the time and space complexity of your solution?";
export const CODING_COMPLEXITY_OK = ['Right.', "Yes, that's right."];
export const codingComplexityFix = (c: string) => `Hmm, I'd say: ${c}`;
export const codingEdgeQ = (edge: string) => `How does your solution handle ${edge.charAt(0).toLowerCase()}${edge.slice(1)}?`;
export const CODING_FOLLOWUP_ACK = ['Good.', 'Okay, that makes sense.', 'Interesting.'];
export const CODING_DONE = 'Great, thanks for walking me through that.';

// ---- system design round ----

export const DESIGN_START = "Great. Let's zoom out to system design.";
export const designIntro = (title: string, intro: string) => [
  `Here's the problem: ${title}. ${intro}`,
  "The details are on your screen, and there's a notes board for each step if you want to write things down.",
  "We'll go step by step, starting with requirements.",
];
export const DESIGN_ACK_GOOD = ['Good, that covers the important parts.', "Nice, that's thorough.", 'Good.'];
export const DESIGN_ACK = ['Okay.', 'Got it.', 'Okay, thanks.'];
export const designProbe = (topic: string) =>
  `What about ${topic.charAt(0).toLowerCase()}${topic.slice(1)}? How would you handle that here?`;
export const designNudge = (a: string, b?: string) =>
  `Some things I'd also look for here: ${b ? `${a} and ${b}` : a}.`;
export const designHint = (topic: string) => `Here's a hint: think about ${topic.charAt(0).toLowerCase()}${topic.slice(1)}.`;
export const DESIGN_CLARIFY =
  "Make reasonable assumptions and state them out loud. That's part of the exercise.";
export const DESIGN_PUSHBACK_START = "Let me push on a few things, like I would in a real interview.";
export const DESIGN_PUSHBACK_GOOD = ["Good, that's a solid approach.", "Yes, that's what I'd look for."];
export const designPushbackTeach = (a: string) => `Okay. One approach I like: ${a}`;
export const DESIGN_LEAD_Q =
  "Last one on this. As the lead, how would you roll this out across teams, and how would you keep it healthy over time?";
export const DESIGN_TIME_WARNING = (minutes: number) =>
  `We have about ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} left for the design, so let's keep moving.`;
export const DESIGN_TIME_UP = "We're out of time for the design, so let's stop here.";
export const DESIGN_DONE = 'Thanks, that was a good discussion.';
