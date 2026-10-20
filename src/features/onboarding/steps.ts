import { router } from 'expo-router';

import type { CoachName } from '@/features/welcome/coach';

import type { Goal } from './answers';

/*
 * The onboarding steps in order (design spec 4.2). Each step is a route under
 * src/app/onboarding/ with the same name. The layout reads this to place the coach,
 * fill the bubble and the progress bar, and show Skip.
 */

export type StepId =
  | 'intro'
  | 'goal'
  | 'experience'
  | 'days'
  | 'place'
  | 'about'
  | 'limits'
  | 'build'
  | 'plan'
  | 'save'
  | 'sign-up'
  | 'reminders';

type Step = {
  coach: CoachName;
  /** Where Continue goes; null finishes onboarding. */
  next: StepId | null;
  /** The coach's bubble. Questions only: no subtext, except the allowed `note`. */
  question?: string;
  note?: string;
  skippable?: boolean;
  /** Shows the back chevron and progress bar. */
  bar?: boolean;
};

export const STEPS: Record<StepId, Step> = {
  intro: { coach: 'rex', next: 'goal' },
  goal: { coach: 'rex', next: 'experience', question: 'What brings you to Muvlet?', bar: true },
  experience: {
    coach: 'rex',
    next: 'days',
    question: 'How much have you lifted before?',
    bar: true,
  },
  days: { coach: 'rex', next: 'place', question: 'Which days can you train?', bar: true },
  place: { coach: 'axel', next: 'about', question: 'Where will you work out?', bar: true },
  about: {
    coach: 'sage',
    next: 'limits',
    question: 'A little about you',
    note: 'Only used to set your food targets. Only you can see this.',
    skippable: true,
    bar: true,
  },
  limits: {
    coach: 'luna',
    next: 'build',
    question: 'Anything we should go easy on?',
    skippable: true,
    bar: true,
  },
  // All four coaches work on the plan here; Rex leads the screens after it.
  build: { coach: 'rex', next: 'plan' },
  plan: { coach: 'rex', next: 'save', question: 'Your plan is ready!', bar: true },
  save: { coach: 'rex', next: 'reminders', question: 'Save your plan', bar: true },
  'sign-up': { coach: 'rex', next: 'reminders' },
  reminders: { coach: 'luna', next: null, question: 'How should I nudge you?' },
};

export const QUESTIONS: StepId[] = ['goal', 'experience', 'days', 'place', 'about', 'limits'];

export function isStep(id: string | undefined): id is StepId {
  return !!id && id in STEPS;
}

/** How full the progress bar is: the last question leaves room for the plan, which fills it. */
export function progress(id: StepId) {
  const question = QUESTIONS.indexOf(id);
  return question < 0 ? 1 : (question + 1) / (QUESTIONS.length + 1);
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
