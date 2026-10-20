import { DEFAULT_ANSWERS, type Answers } from './answers';
import { buildPlan, withCommas } from './plan';

function planFor(changes: Partial<Answers>) {
  return buildPlan({ ...DEFAULT_ANSWERS, sex: 'Male', ...changes });
}

function labels(changes: Partial<Answers>) {
  return planFor(changes).week.map((day) => day.label);
}

test('the plan is named after how many days you train', () => {
  expect(planFor({ days: [1, 4] }).title).toBe('Full Body Starter');
  expect(planFor({ days: [1, 3, 5] }).title).toBe('Push, Pull, Legs');
  expect(planFor({ days: [1, 2, 4, 5] }).title).toBe('Upper and Lower');
  expect(planFor({ days: [1, 2, 3, 4, 5] }).title).toBe('Five Day Builder');
});

test('workouts go on the picked days, with a stretch the day after and rest otherwise', () => {
  // Sunday first.
  expect(labels({ days: [1, 3, 5] })).toEqual([
    'Rest',
    'Push',
    'Stretch',
    'Pull',
    'Stretch',
    'Legs',
    'Stretch',
  ]);
  // Picked out of order, and a workout the day after another.
  expect(labels({ days: [6, 0] })).toEqual([
    'Full Body',
    'Stretch',
    'Rest',
    'Rest',
    'Rest',
    'Rest',
    'Full Body',
  ]);
});

test('calories follow the goal, and protein the weight', () => {
  expect(planFor({ goal: 'Lose some fat' }).calories).toBe(2150);
  expect(planFor({ goal: 'Get stronger' }).calories).toBe(2700);
  expect(planFor({ goal: 'Feel fitter and healthier', sex: 'Female' }).calories).toBe(2300);
  expect(planFor({}).protein).toBe(125);
});

test('skipping About you leaves out the food targets', () => {
  const plan = planFor({ skippedAbout: true });
  expect(plan.calories).toBeUndefined();
  expect(plan.protein).toBeUndefined();
  expect(plan.minutes).toBe(45);
});

test('big numbers get commas', () => {
  expect(withCommas(950)).toBe('950');
  expect(withCommas(2400)).toBe('2,400');
});
