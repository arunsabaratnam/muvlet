import { render, screen } from '@testing-library/react-native';

import ProgressScreen from './progress-screen';

jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2026, 10, 22, 18, 30));
});

afterEach(() => {
  jest.useRealTimers();
});

test('shows the level, the bar and how far to the next level', async () => {
  await render(<ProgressScreen />);

  expect(screen.getByText('Gym Rookie')).toBeOnTheScreen();
  expect(screen.getByText('About 1 workout to Gym Regular')).toBeOnTheScreen();
  expect(screen.getByText('2,080 / 2,200')).toBeOnTheScreen();
  expect(screen.getByLabelText('A barbell with 3 plates a side')).toBeOnTheScreen();
});

test('shows 16 weeks coloured by what you trained, with a key and no counts', async () => {
  await render(<ProgressScreen />);

  expect(screen.getByText('Last 16 weeks')).toBeOnTheScreen();
  expect(
    screen.getByLabelText(/^Last 16 weeks: \d+ push, \d+ pull, \d+ legs and \d+ stretch/),
  ).toBeOnTheScreen();
  for (const name of ['Push', 'Pull', 'Legs', 'Stretch']) {
    expect(screen.getByText(name)).toBeOnTheScreen();
  }
  expect(screen.queryByText(/weeks in a row/)).not.toBeOnTheScreen();
});

test('lists PRs and badges', async () => {
  await render(<ProgressScreen />);

  expect(screen.getByText('Dumbbell bench press')).toBeOnTheScreen();
  expect(screen.getByText('+2 reps')).toBeOnTheScreen();
  expect(screen.getByText('6 of 18')).toBeOnTheScreen();
  expect(screen.getByLabelText('First comeback, not earned yet')).toBeOnTheScreen();
});
