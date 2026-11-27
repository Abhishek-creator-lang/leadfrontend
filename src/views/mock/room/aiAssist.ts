import { INTRO_ASK } from '@/content/interviewer/script';
import { aiDesignFollowUp, aiFollowUp } from '@/lib/aiFollowUp';
import { aiGradeAnswer } from '@/lib/aiGrade';
import { aiInterviewerAnswer } from '@/lib/aiInterviewerAnswer';
import {
  behavioralProbeGoal,
  designWouldProbe,
  introWouldFollowUp,
  questionsWouldAnswer,
  warmupAnswerToCheck,
  type AnswerExtras,
  type EngineState,
} from '@/utils/interview/engine';

/**
 * What Chrome's on-device AI adds to this reply, or null when the interviewer wouldn't use it here
 * (so the room answers at once). The engine decides *whether* to probe, answer or grade; the AI only
 * writes the words or a second opinion. Every call gives up quietly, and the scripted line is used.
 */
export function aiAssist(s: EngineState, text: string, notes = ''): Promise<AnswerExtras> | null {
  const check = warmupAnswerToCheck(s, text);
  if (check) return aiGradeAnswer(check).then((aiJudgement) => ({ aiJudgement }));

  if (introWouldFollowUp(s, text))
    return aiFollowUp('intro', {
      question: INTRO_ASK,
      answer: [...s.intro.answers, text].join(' '),
    }).then((aiFollowUp) => ({ aiFollowUp }));

  const goal = behavioralProbeGoal(s, text);
  if (goal) {
    const story = s.plan.behavioral[s.beh.index];
    return aiFollowUp('behavioral', {
      question: story.ask,
      answer: [...s.beh.answers, text].join(' '),
      goal,
    }).then((aiFollowUp) => ({ aiFollowUp }));
  }

  if (s.stage === 'design' && designWouldProbe(s, text, notes)) {
    const design = s.plan.design!;
    const step = design.steps[s.design.stepIndex];
    return aiDesignFollowUp({
      problem: design.title,
      step: step.label,
      keyPoints: step.keyPoints,
      answer: [...s.design.answers, text, notes].join(' '),
    }).then((aiFollowUp) => ({ aiFollowUp }));
  }

  if (questionsWouldAnswer(s, text))
    return aiInterviewerAnswer(text).then((aiAnswer) => ({ aiAnswer }));

  return null;
}
