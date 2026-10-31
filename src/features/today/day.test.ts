import {
  forYou,
  formatDay,
  greeting,
  levelFor,
  levelHint,
  MOCK_STEPS,
  nextStep,
  proteinToday,
  skyPhase,
  thisWeek,
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

test('the level hint says what gets you to the next level', () => {
  const workout = nextStep(MOCK_STEPS);
  expect(workout?.title).toBe('Push Day A');
  expect(levelHint(1380, workout)).toBe('Push Day A takes you to Level 5');

  const stretch = MOCK_STEPS.find((step) => step.id === 'stretch');
  expect(levelHint(1600, stretch)).toBe('400 pts to Level 6 · Wind-down stretch +20');
  expect(levelHint(1600)).toBe('400 pts to Level 6');
  expect(levelHint(3000)).toBeUndefined();
});

const withDone = (...ids: StepId[]) =>
  MOCK_STEPS.map((step) => (ids.includes(step.id) ? { ...step, doneAt: 20 * 60 } : step));

test('protein left counts the meals logged', () => {
  expect(proteinToday(MOCK_STEPS).left).toBe(58);
  expect(proteinToday(withDone('dinner')).left).toBe(20);
  expect(proteinToday(MOCK_STEPS.map((step) => ({ ...step, doneAt: undefined }))).left).toBe(86);
});

test('the week shows workouts done and planned, Monday first', () => {
  const monday = thisWeek(at(17, 45), false);
  expect(monday.days.map((day) => day.state[0]).join('')).toBe('prprprr');
  expect(monday.days[0].today).toBe(true);
  expect(monday.title).toBe('4-week streak');
  expect(monday.detail).toBe('0 of 3 workouts this week');

  // Friday, after the last workout of the week.
  const friday = thisWeek(new Date(2026, 9, 2, 19), true);
  expect(friday.days.map((day) => day.state[0]).join('')).toBe('drdrdrr');
  expect(friday.title).toBe('5-week streak');
  expect(friday.detail).toBe('3 of 3 workouts. Week done!');
});

test('For you follows the day', () => {
  expect(forYou(MOCK_STEPS).map((read) => read.coach)).toEqual(['axel', 'sage']);
  expect(forYou(withDone('workout', 'dinner')).map((read) => read.title)).toEqual([
    'Why sore muscles are normal',
    '3 quick high-protein breakfasts',
  ]);
});
