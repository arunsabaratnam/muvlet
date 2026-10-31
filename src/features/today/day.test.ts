import {
  daySections,
  doneLabel,
  forYou,
  formatDay,
  greeting,
  isQuiet,
  levelFor,
  MOCK_STEPS,
  nextStep,
  previewOf,
  proteinToday,
  skyPhase,
  thisWeek,
  WALK,
  type StepId,
} from './day';

const at = (hours: number, minutes = 0) => new Date(2026, 8, 28, hours, minutes);

test('the sky follows the time of day', () => {
  expect(skyPhase(at(4, 59))).toBe('night');
  expect(skyPhase(at(5))).toBe('morning');
  expect(skyPhase(at(10, 59))).toBe('morning');
  expect(skyPhase(at(11))).toBe('day');
  expect(skyPhase(at(17))).toBe('sunset');
  expect(skyPhase(at(19, 29))).toBe('sunset');
  expect(skyPhase(at(19, 30))).toBe('night');
});

test('the greeting and date read like the mockup', () => {
  expect(greeting(at(6, 15), 'Arun')).toBe('Good morning, Arun');
  expect(greeting(at(12, 40), 'Arun')).toBe('Good afternoon, Arun');
  expect(greeting(at(17, 45), 'Arun')).toBe('Good evening, Arun');
  expect(formatDay(at(17, 45))).toBe('Monday, Sept 28');
  expect(formatDay(new Date(2026, 9, 3))).toBe('Saturday, Oct 3');
});

test('points fill levels', () => {
  expect(levelFor(1380)).toEqual({ number: 4, name: 'Gym Rookie', from: 1200, to: 1500 });
  expect(levelFor(1500)).toMatchObject({ number: 5, name: 'Gym Regular', to: 2000 });
  expect(levelFor(3000)).toMatchObject({ number: 7, to: undefined });
});

const withDone = (...ids: StepId[]) =>
  MOCK_STEPS.map((step) => (ids.includes(step.id) ? { ...step, doneAt: 20 * 60 } : step));

test('protein left counts the meals logged', () => {
  expect(proteinToday(MOCK_STEPS, 64).left).toBe(58);
  expect(proteinToday(withDone('dinner'), 64).left).toBe(20);
  expect(
    proteinToday(
      MOCK_STEPS.map((step) => ({ ...step, doneAt: undefined })),
      0,
    ).left,
  ).toBe(150);
});

test('the week shows workouts done and planned, Monday first', () => {
  const workout = MOCK_STEPS.find((step) => step.id === 'workout');
  const monday = thisWeek(at(17, 45), { streak: 4 }, workout);
  expect(monday.days.map((day) => day.state[0]).join('')).toBe('prprprr');
  expect(monday.days[0].today).toBe(true);
  expect(monday.title).toBe('4-week streak');
  expect(monday.detail).toBe('0 of 3 workouts this week');

  // Friday, after the last workout of the week.
  const friday = thisWeek(
    new Date(2026, 9, 2, 19),
    { plan: [0, 2, 4], streak: 4 },
    { ...workout!, doneAt: 19 * 60 },
  );
  expect(friday.days.map((day) => day.state[0]).join('')).toBe('drdrdrr');
  expect(friday.title).toBe('5-week streak');
  expect(friday.detail).toBe('3 of 3 workouts. Week done!');
});

test('the week shows a missed day, a fresh start and a break', () => {
  const tuesday = new Date(2026, 8, 29, 7, 30);
  const missed = thisWeek(tuesday, { plan: [0, 2, 4], streak: 4, missed: [0] });
  expect(missed.days.map((day) => day.state[0]).join('')).toBe('mrprprr');
  expect(missed.detail).toBe('0 of 3 workouts this week');

  expect(thisWeek(at(17, 30), { plan: [0, 2, 4], streak: 0, fresh: true }).title).toBe(
    'New streak · week 1',
  );

  const paused = thisWeek(new Date(2026, 9, 5, 9, 30), {
    plan: [0, 2, 4],
    streak: 4,
    pausedUntil: new Date(2026, 9, 9),
  });
  expect(paused).toMatchObject({ held: true, title: 'Streak on hold' });
  expect(paused.detail).toBe('Paused until Fri, Oct 9');
});

test('a meal whose time has passed becomes a quiet line, not the next step', () => {
  const lapsed = MOCK_STEPS.map((step) => ({ ...step, doneAt: undefined }));
  const breakfast = lapsed[0];
  expect(isQuiet(breakfast, 10 * 60 + 59)).toBe(false);
  expect(isQuiet(breakfast, 12 * 60 + 40)).toBe(true);
  expect(nextStep(lapsed, 12 * 60 + 40)?.id).toBe('workout');
  // It stays in the morning, where it was planned.
  expect(daySections(lapsed, 12 * 60 + 40)[0]).toMatchObject({ title: 'Morning' });
  // On a break, meals are optional lines all day.
  expect(isQuiet(breakfast, 9 * 60, true)).toBe(true);
  expect(isQuiet(WALK, 9 * 60, true)).toBe(false);
});

test('a skipped step folds into its chip as skipped', () => {
  const stretch = { ...MOCK_STEPS[3], doneAt: 22 * 60 + 50, skipped: true };
  expect(doneLabel([stretch])).toBe('Stretch · skipped');
});

test("a lighter workout previews at last time's weights", () => {
  const workout = { ...MOCK_STEPS[1], lite: true };
  const preview = previewOf(workout)!;
  expect(preview.kind).toBe('Workout · 35 min');
  expect(preview.up).toBeUndefined();
  expect(preview.items[0].detail).toBe('3 × 8 · 30 lb');
  expect(preview.items.some((item) => item.up)).toBe(false);
});

test('For you follows the day', () => {
  expect(forYou(MOCK_STEPS).map((read) => read.coach)).toEqual(['axel', 'sage']);
  expect(forYou(withDone('workout', 'dinner')).map((read) => read.title)).toEqual([
    'Why sore muscles are normal',
    '3 quick high-protein breakfasts',
  ]);
});
