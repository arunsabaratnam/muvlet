import { render, screen } from '@testing-library/react-native';

import TodayScreen from './today-screen';

jest.mock('react-native-worklets', () => jest.requireActual('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => jest.requireActual('react-native-reanimated/mock'));
// Rive is native code that doesn't run in Jest.
jest.mock('@/features/welcome/coach', () => ({ Coach: () => null }));

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2026, 8, 28, 17, 45));
});

afterEach(() => {
  jest.useRealTimers();
});

test('shows the day, the greeting and the level', async () => {
  await render(<TodayScreen />);

  expect(screen.getByText('Monday, Sept 28')).toBeOnTheScreen();
  expect(screen.getByText('Good evening, Arun')).toBeOnTheScreen();
  expect(screen.getByText('Gym Rookie')).toBeOnTheScreen();
  expect(screen.getByText('1,380 / 1,500')).toBeOnTheScreen();
  expect(screen.getByText('Push Day A takes you to Level 5')).toBeOnTheScreen();
});
