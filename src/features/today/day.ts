import type { CoachName } from '@/features/welcome/coach';
import { withCommas } from '@/features/onboarding/plan';

/*
 * Today's plan and the maths behind the top of the screen. There's no saved data yet,
 * so the day is mock data, the same as the mockup's normal day.
 */

export type StepId = 'breakfast' | 'workout' | 'dinner' | 'stretch';

export type Step = {
  id: StepId;
  coach: CoachName;
  /** Minutes after midnight. */
  plannedAt: number;
  points: number;
  title: string;
  doneTitle: string;
  /** Under the title once the step is open. */
  detail: string;
  /** The step's button. */
  action: string;
  /** What the coach says in the sky while it's the next step. */
  tip: string;
  /** Its name on a section's done chip, e.g. "Breakfast · 28 g protein". */
  name: string;
  result: string;
  /** Under the title once done. */
  doneDetail: string;
  /** Minutes after midnight; undefined until done. */
  doneAt?: number;
};

export const MOCK_NAME = 'Arun';
export const MOCK_POINTS = 1380;

export const MOCK_STEPS: Step[] = [
  {
    id: 'breakfast',
    coach: 'sage',
    plannedAt: 8 * 60,
    points: 10,
    title: 'Log breakfast',
    doneTitle: 'Breakfast logged',
    detail: 'Snap a photo to log it',
    action: 'Snap breakfast',
    tip: 'Start with breakfast. Protein keeps you full.',
    name: 'Breakfast',
    result: '28 g protein',
    doneDetail: 'Oats and berries · 28 g protein',
    doneAt: 8 * 60 + 10,
  },
  {
    id: 'workout',
    coach: 'rex',
    plannedAt: 18 * 60,
    points: 200,
    title: 'Push Day A',
    doneTitle: 'Push Day A done',
    detail: '5 exercises · 45 min',
    action: 'Start workout',
    tip: "Ready when you are. I'll time your rests.",
    name: 'Workout',
    result: '45 min',
    doneDetail: '5 exercises · 45 min',
  },
  {
    id: 'dinner',
    coach: 'sage',
    plannedAt: 19 * 60 + 30,
    points: 10,
    title: 'Snap your dinner',
    doneTitle: 'Dinner logged',
    detail: 'Training later? Keep it on the lighter side',
    action: 'Snap a photo',
    tip: 'Training later? Keep dinner light.',
    name: 'Dinner',
    result: '38 g protein',
    doneDetail: 'Dinner · 38 g protein',
  },
  {
    id: 'stretch',
    coach: 'luna',
    plannedAt: 22 * 60,
    points: 20,
    title: 'Wind-down stretch',
    doneTitle: 'Stretch done',
    detail: '10 min · 5 easy moves for chest, shoulders and hips',
    action: 'Begin stretch',
    tip: 'Ten easy minutes helps you sleep.',
    name: 'Stretch',
    result: '10 min',
    doneDetail: '10 min · 5 moves',
  },
];

/** Push Day A, as its big card shows it. */
export const WORKOUT = {
  minutes: 45,
  focus: 'Chest, shoulders and triceps',
  progress: 'Bench 35 lb · up from 30 lb',
};

/** Once the workout is done, dinner is about recovery. */
export function stepText(step: Step, steps: Step[]) {
  const trained = steps.some((s) => s.id === 'workout' && s.doneAt !== undefined);
  if (step.id === 'dinner' && trained) {
    return {
      detail: 'Aim for 40 g protein after training',
      tip: "Snap it and I'll count the protein.",
    };
  }
  return { detail: step.detail, tip: step.tip };
}

/** What each coach says when you finish one of their steps. */
export const DONE_LINES: Record<CoachName, string> = {
  rex: "That's the big one done today.",
  axel: 'Good form today.',
  sage: "Got it. I'll count the protein.",
  luna: 'Nice and loose. Sleep well.',
};

/** The first step not done yet. */
export function nextStep(steps: Step[]) {
  return steps.find((step) => step.doneAt === undefined);
}

const SECTION_TITLES = ['Morning', 'Afternoon', 'Evening', 'Before bed'];

function sectionOf(minutes: number) {
  if (minutes >= 21 * 60) return 3;
  if (minutes >= 17 * 60) return 2;
  if (minutes >= 12 * 60) return 1;
  return 0;
}

export type Section = {
  title: string;
  /** Earlier in the day than now. */
  past: boolean;
  steps: Step[];
};

/**
 * The day in sections. A done step sits where it was done; a step still to do sits at its
 * planned time, or now if that has passed. Nothing is ever late.
 */
export function daySections(steps: Step[], now: number): Section[] {
  const at = (step: Step) => step.doneAt ?? Math.max(step.plannedAt, now);
  const sorted = [...steps].sort((a, b) => at(a) - at(b) || a.plannedAt - b.plannedAt);
  return SECTION_TITLES.map((title, index) => ({
    title,
    past: index < sectionOf(now),
    steps: sorted.filter((step) => sectionOf(at(step)) === index),
  })).filter((section) => section.steps.length > 0);
}

/** The label on a section's done chip. */
export function doneLabel(done: Step[]) {
  if (done.length === 1) return `${done[0].name} · ${done[0].result}`;
  if (done.length === 2) return `${done[0].name} and ${done[1].name.toLowerCase()}`;
  return `${done.length} done`;
}

export type SkyPhase = 'morning' | 'day' | 'sunset' | 'night';

/** Night runs from 7:30 PM until 5 AM. */
export function skyPhase(now: Date): SkyPhase {
  const hour = now.getHours() + now.getMinutes() / 60;
  if (hour < 5) return 'night';
  if (hour < 11) return 'morning';
  if (hour < 17) return 'day';
  if (hour < 19.5) return 'sunset';
  return 'night';
}

export function greeting(now: Date, name: string) {
  const hour = now.getHours();
  const part = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  return `Good ${part}, ${name}`;
}

const WEEKDAYS = 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' ');
const MONTHS = 'Jan Feb March April May June July Aug Sept Oct Nov Dec'.split(' ');

/** "Monday, Sept 28", without relying on the device's locale. */
export function formatDay(now: Date) {
  return `${WEEKDAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
}

const LEVELS = [
  { from: 0, name: 'Newcomer' },
  { from: 500, name: 'First Steps' },
  { from: 900, name: 'Learner' },
  { from: 1200, name: 'Gym Rookie' },
  { from: 1500, name: 'Gym Regular' },
  { from: 2000, name: 'Steady Lifter' },
  { from: 2600, name: 'Confident Lifter' },
];

export type Level = {
  number: number;
  name: string;
  from: number;
  /** Points for the next level; undefined at the top level. */
  to?: number;
};

export function levelFor(points: number): Level {
  const index = LEVELS.filter((level) => points >= level.from).length - 1;
  return { number: index + 1, ...LEVELS[index], to: LEVELS[index + 1]?.from };
}

/** What gets you to the next level, e.g. "Push Day A takes you to Level 5". */
export function levelHint(points: number, next?: Step) {
  const { number, to } = levelFor(points);
  if (to === undefined) return undefined;
  const left = to - points;
  if (next && next.points >= left) return `${next.title} takes you to Level ${number + 1}`;
  const hint = `${withCommas(left)} pts to Level ${number + 1}`;
  return next ? `${hint} · ${next.title} +${next.points}` : hint;
}
