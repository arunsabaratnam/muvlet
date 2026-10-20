import { router } from 'expo-router';

import type { CoachName } from '@/features/welcome/coach';

import type { Goal } from './answers';

/*
 * The onboarding steps in order (design spec 4.2). Each step is a route under
 * src/app/onboarding/ with the same name. The layout reads this to place the coach,
 * fill the bubble and the progress bar, and show Skip.
 */

export type StepId = 'intro' | 'goal' | 'experience' | 'days' | 'place' | 'about' | 'limits';

type Step = {
  coach: CoachName;
  /** Where Continue goes; null finishes onboarding. */
  next: StepId | null;
  /** The coach's bubble. Questions only: no subtext, except the allowed `note`. */
  question?: string;
  note?: string;
  skippable?: boolean;
};

export const STEPS: Record<StepId, Step> = {
  intro: { coach: 'rex', next: 'goal' },
  goal: { coach: 'rex', next: 'experience', question: 'What brings you to Muvlet?' },
  experience: { coach: 'rex', next: 'days', question: 'How much have you lifted before?' },
  days: { coach: 'rex', next: 'place', question: 'Which days can you train?' },
  place: { coach: 'axel', next: 'about', question: 'Where will you work out?' },
  about: {
    coach: 'sage',
    next: 'limits',
    question: 'A little about you',
    note: 'Only used to set your food targets. Only you can see this.',
    skippable: true,
  },
  // Building and showing the plan come next; until then onboarding ends here.
  limits: {
    coach: 'luna',
    next: null,
    question: 'Anything we should go easy on?',
    skippable: true,
  },
};

export const QUESTIONS: StepId[] = ['goal', 'experience', 'days', 'place', 'about', 'limits'];

export function isStep(id: string | undefined): id is StepId {
  return !!id && id in STEPS;
}

/** How full the progress bar is: the last question leaves room for the plan. */
export function progress(id: StepId) {
  return (QUESTIONS.indexOf(id) + 1) / (QUESTIONS.length + 1);
}

/** Moves on from a step: to the next one, or out to Today with no way back. */
export function goOn(from: StepId) {
  const next = STEPS[from].next;
  if (next) router.push(`/onboarding/${next}`);
  else router.replace('/today');
}

/** Each goal takes the colour of the coach it fits, on its row and on the progress bar. */
export const GOAL_COACH: Record<Goal, CoachName> = {
  'Get stronger': 'rex',
  'Lose some fat': 'axel',
  'Feel fitter and healthier': 'sage',
  'Feel confident at the gym': 'luna',
};
