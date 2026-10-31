import type { CoachName } from '@/features/welcome/coach';

import { MOCK_POINTS, MOCK_STEPS, WALK, type Step, type StepId, type Week } from './day';

/*
 * Days to try Today on, from the mockup's "Try a day" list. The app opens on the normal day;
 * the others are for checking how Today handles a day that didn't go to plan.
 */

export type DayKey = 'normal' | 'lapse' | 'night' | 'missed' | 'rest' | 'back' | 'paused';

/** A coach's card above the path. */
export type CardKey = 'missed' | 'back' | 'paused' | 'rest';

/** Whose card it is; they stand in the sky while it shows. */
export const CARD_COACH: Record<CardKey, CoachName> = {
  missed: 'rex',
  back: 'rex',
  paused: 'luna',
  rest: 'luna',
};

export type Day = {
  key: DayKey;
  /** In the Try a day list. */
  name: string;
  when: string;
  /** A fixed moment to show; the phone's clock when left out. */
  at?: Date;
  steps: Step[];
  points: number;
  /** Protein eaten outside the steps, in grams. */
  protein: number;
  week: Week;
  card?: CardKey;
  /** What a coach says in the sky when Today opens, instead of the next step's tip. */
  say?: { coach: CoachName; text: string };
};

const STREAK = 4;

const step = (id: StepId, change: Partial<Step> = {}) => ({
  ...MOCK_STEPS.find((s) => s.id === id)!,
  ...change,
});
const notYet = { doneAt: undefined };

export const DAYS: Record<DayKey, Day> = {
  normal: {
    key: 'normal',
    name: 'A normal day',
    when: 'Now',
    steps: MOCK_STEPS,
    points: MOCK_POINTS,
    protein: 64,
    week: { streak: STREAK },
  },
  lapse: {
    key: 'lapse',
    name: 'Breakfast slipped by',
    when: 'Monday, 12:40 PM',
    at: new Date(2026, 8, 28, 12, 40),
    steps: MOCK_STEPS.map((s) => (s.id === 'breakfast' ? { ...s, ...notYet } : s)),
    points: MOCK_POINTS,
    protein: 45,
    week: { plan: [0, 2, 4], streak: STREAK },
    say: { coach: 'sage', text: "Breakfast slipped by? All good. I'll catch you at dinner." },
  },
  night: {
    key: 'night',
    name: 'Too tired to stretch',
    when: 'Monday, 10:45 PM',
    at: new Date(2026, 8, 28, 22, 45),
    steps: [
      step('breakfast'),
      step('workout', { doneAt: 18 * 60 + 5 }),
      step('dinner', { doneAt: 19 * 60 + 40 }),
      step('stretch'),
    ],
    points: 1600,
    protein: 74,
    week: { plan: [0, 2, 4], streak: STREAK },
    say: { coach: 'luna', text: 'Too tired to stretch? Sleep is recovery too.' },
  },
  missed: {
    key: 'missed',
    name: "Yesterday's workout didn't happen",
    when: 'Tuesday, 7:30 AM',
    at: new Date(2026, 8, 29, 7, 30),
    steps: [step('breakfast', notYet), step('dinner'), step('stretch')],
    points: MOCK_POINTS,
    protein: 0,
    week: { plan: [0, 2, 4], streak: STREAK, missed: [0] },
    card: 'missed',
  },
  rest: {
    key: 'rest',
    name: 'Rest day',
    when: 'Saturday, 10:00 AM',
    at: new Date(2026, 9, 3, 10),
    steps: [step('breakfast', { doneAt: 8 * 60 + 40 }), WALK, step('dinner'), step('stretch')],
    points: 1820,
    protein: 0,
    week: { plan: [0, 2, 4], streak: STREAK },
    card: 'rest',
    say: { coach: 'luna', text: 'Rest day. Your muscles grow while you rest.' },
  },
  back: {
    key: 'back',
    name: 'Back after 12 days',
    when: 'Monday, 5:30 PM',
    at: new Date(2026, 9, 12, 17, 30),
    steps: MOCK_STEPS,
    points: MOCK_POINTS,
    protein: 64,
    week: { plan: [0, 2, 4], streak: 0, fresh: true },
    card: 'back',
  },
  paused: {
    key: 'paused',
    name: 'On a break',
    when: 'Monday, 9:30 AM',
    at: new Date(2026, 9, 5, 9, 30),
    steps: [step('breakfast', notYet), step('dinner')],
    points: MOCK_POINTS,
    protein: 0,
    week: { plan: [0, 2, 4], streak: STREAK, pausedUntil: new Date(2026, 9, 9) },
    card: 'paused',
  },
};
