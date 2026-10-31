import { formatDay, greeting, levelFor, levelHint, MOCK_STEPS, nextStep, skyPhase } from './day';

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
