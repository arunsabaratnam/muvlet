import type { CoachName } from '@/features/welcome/coach';
import { withCommas } from '@/features/onboarding/plan';

/*
 * Today's plan and the maths behind the top of the screen. There's no saved data yet,
 * so the day is mock data, the same as the mockup's normal day.
 */

export type Step = {
  id: 'breakfast' | 'workout' | 'dinner' | 'stretch';
  coach: CoachName;
  title: string;
  points: number;
  done: boolean;
};

export const MOCK_NAME = 'Arun';
export const MOCK_POINTS = 1380;

export const MOCK_STEPS: Step[] = [
  { id: 'breakfast', coach: 'sage', title: 'Log breakfast', points: 10, done: true },
  { id: 'workout', coach: 'rex', title: 'Push Day A', points: 200, done: false },
  { id: 'dinner', coach: 'sage', title: 'Snap your dinner', points: 10, done: false },
  { id: 'stretch', coach: 'luna', title: 'Wind-down stretch', points: 20, done: false },
];

/** The first step not done yet. */
export function nextStep(steps: Step[]) {
  return steps.find((step) => !step.done);
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
