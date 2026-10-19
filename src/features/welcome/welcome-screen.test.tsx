import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import WelcomeScreen from './welcome-screen';

jest.mock('react-native-worklets', () => jest.requireActual('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated/mock'),
  useReducedMotion: () => false,
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
// Rive is native code that doesn't run in Jest.
jest.mock('./coach', () => ({ Coach: () => null }));

beforeEach(() => {
  jest.useFakeTimers();
  jest.mocked(router.replace).mockClear();
});

afterEach(() => {
  jest.useRealTimers();
});

test('the buttons only work once the relay has settled', async () => {
  await render(<WelcomeScreen />);

  await fireEvent.press(screen.getByText('Get started'));
  expect(router.replace).not.toHaveBeenCalled();

  await act(() => jest.advanceTimersByTime(1500));
  await fireEvent.press(screen.getByText('Get started'));
  expect(router.replace).toHaveBeenCalledWith('/today');
});

test('tapping during the relay skips to the end', async () => {
  await render(<WelcomeScreen />);

  await fireEvent.press(screen.getByText('muvlet'));
  await fireEvent.press(screen.getByText('I already have an account'));

  expect(router.replace).toHaveBeenCalledWith('/today');
});
