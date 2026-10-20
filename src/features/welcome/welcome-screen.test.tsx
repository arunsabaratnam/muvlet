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
// Rive is native code that doesn't run in Jest. The stand-in coaches are ready at once
// unless a test says they never load.
let mockCoachesLoad = true;
jest.mock('./coach', () => {
  const { useEffect } = jest.requireActual('react');
  return {
    Coach: ({ onReady }: { onReady?: () => void }) => {
      useEffect(() => {
        if (mockCoachesLoad) onReady?.();
      }, [onReady]);
      return null;
    },
  };
});

beforeEach(() => {
  jest.useFakeTimers();
  jest.mocked(router.replace).mockClear();
});

afterEach(() => {
  jest.useRealTimers();
  mockCoachesLoad = true;
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

test('the relay waits for the coaches, but not forever', async () => {
  mockCoachesLoad = false;
  await render(<WelcomeScreen />);

  // Long enough for the relay, but it's still waiting for the coaches.
  await act(() => jest.advanceTimersByTime(1500));
  await fireEvent.press(screen.getByText('Get started'));
  expect(router.replace).not.toHaveBeenCalled();

  // At 3 s it stops waiting, then the relay plays.
  await act(() => jest.advanceTimersByTime(1500));
  await act(() => jest.advanceTimersByTime(1500));
  await fireEvent.press(screen.getByText('Get started'));
  expect(router.replace).toHaveBeenCalledWith('/today');
});
