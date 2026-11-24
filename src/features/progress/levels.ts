/*
 * The 12 levels. Points earn levels 1 to 8. Levels 9 to 12 also wait for kept weeks, so
 * points alone can't rush the top of the ladder. Points and levels never go down.
 */

const LEVELS = [
  { from: 0, name: 'Newcomer' },
  { from: 250, name: 'First Steps' },
  { from: 600, name: 'Learner' },
  { from: 1200, name: 'Gym Rookie' },
  { from: 2200, name: 'Gym Regular' },
  { from: 3600, name: 'Steady Lifter' },
  { from: 5400, name: 'Habit Builder' },
  { from: 8000, name: 'Confident Lifter' },
  { from: 11500, name: 'Seasoned Lifter', weeks: 10 },
  { from: 16000, name: 'Gym Veteran', weeks: 14 },
  { from: 21500, name: 'Iron Habit', weeks: 20 },
  { from: 28000, name: 'Lifer', weeks: 26 },
];

/** Points for one workout on a planned day. */
export const WORKOUT_POINTS = 200;

export type Level = {
  number: number;
  name: string;
  from: number;
  /** Points for the next level; undefined at the top level. */
  to?: number;
  /** The next level's name; undefined at the top level. */
  next?: string;
  /** Kept weeks the next level also needs, when it needs more than you have. */
  weeksToGo?: number;
};

/** The level for these points and kept weeks (weeks kept so far, counting from the first). */
export function levelFor(points: number, keptWeeks = 0): Level {
  const index =
    LEVELS.filter((level) => points >= level.from && keptWeeks >= (level.weeks ?? 0)).length - 1;
  const level = LEVELS[index];
  const next = LEVELS[index + 1];
  const weeksToGo = next?.weeks ? Math.max(0, next.weeks - keptWeeks) : 0;
  return {
    number: index + 1,
    name: level.name,
    from: level.from,
    to: next?.from,
    next: next?.name,
    ...(weeksToGo > 0 ? { weeksToGo } : {}),
  };
}
