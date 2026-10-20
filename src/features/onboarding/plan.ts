import type { Answers } from './answers';

/*
 * The first plan, built from the onboarding answers with the mockup's maths.
 * Calories use Mifflin-St Jeor with an activity factor that grows with training days.
 */

export type DayKind = 'workout' | 'stretch' | 'rest';

export type Plan = {
  title: string;
  /** One entry per weekday, Sunday first. */
  week: { kind: DayKind; label: string }[];
  minutes: number;
  /** Left out when About you was skipped. */
  calories?: number;
  protein?: number;
};

const SPLITS: Record<number, { title: string; workouts: string[] }> = {
  2: { title: 'Full Body Starter', workouts: ['Full Body', 'Full Body'] },
  3: { title: 'Push, Pull, Legs', workouts: ['Push', 'Pull', 'Legs'] },
  4: { title: 'Upper and Lower', workouts: ['Upper', 'Lower', 'Upper', 'Lower'] },
  5: { title: 'Five Day Builder', workouts: ['Push', 'Pull', 'Legs', 'Upper', 'Lower'] },
};

export function buildPlan(answers: Answers): Plan {
  const days = [...answers.days].sort((a, b) => a - b);
  const split = SPLITS[days.length];

  // Workouts go on the picked days in order; the day after each is a stretch.
  let next = 0;
  const week = [0, 1, 2, 3, 4, 5, 6].map((day) => {
    if (days.includes(day)) {
      return { kind: 'workout' as const, label: split.workouts[next++] };
    }
    return days.includes((day + 6) % 7)
      ? { kind: 'stretch' as const, label: 'Stretch' }
      : { kind: 'rest' as const, label: 'Rest' };
  });

  const plan = { title: split.title, week, minutes: answers.minutes };
  if (answers.skippedAbout) return plan;

  const kg = answers.weightKg;
  const sexOffset = answers.sex === 'Male' ? 5 : answers.sex === 'Female' ? -161 : -78;
  let calories =
    (10 * kg + 6.25 * answers.heightCm - 5 * answers.age + sexOffset) * (1.35 + days.length * 0.04);
  if (answers.goal === 'Lose some fat') calories -= 400;
  if (answers.goal === 'Get stronger') calories += 150;

  return {
    ...plan,
    calories: Math.round(calories / 50) * 50,
    protein: Math.round((kg * 1.6) / 5) * 5,
  };
}

/** 2400 → "2,400", without relying on the device's locale. */
export function withCommas(n: number) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
