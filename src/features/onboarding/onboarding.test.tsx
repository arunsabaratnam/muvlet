import { router, Stack } from 'expo-router';
import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { Text } from 'react-native';
import * as Reanimated from 'react-native-reanimated';

import OnboardingLayout from './onboarding-layout';
import {
  AboutStep,
  DaysStep,
  ExperienceStep,
  GoalStep,
  IntroStep,
  LimitsStep,
  PlaceStep,
} from './questions';

jest.mock('react-native-worklets', () => jest.requireActual('react-native-worklets/src/mock'));
// Rive is native code that doesn't run in Jest.
jest.mock('@/features/welcome/coach', () => ({ Coach: () => null }));

// expo-router's test helpers swap in Reanimated's plain mock, which lacks useReducedMotion.
// With reduced motion Rex's hello shows at once, so nothing types in the background.
Object.assign(Reanimated, { useReducedMotion: () => true });

async function start(step = 'intro') {
  const app = renderRouter(
    {
      _layout: () => <Stack screenOptions={{ headerShown: false }} />,
      index: () => <Text>Welcome</Text>,
      '(tabs)/today': () => <Text>Today</Text>,
      'onboarding/_layout': OnboardingLayout,
      'onboarding/intro': IntroStep,
      'onboarding/goal': GoalStep,
      'onboarding/experience': ExperienceStep,
      'onboarding/days': DaysStep,
      'onboarding/place': PlaceStep,
      'onboarding/about': AboutStep,
      'onboarding/limits': LimitsStep,
    },
    { initialUrl: `/onboarding/${step}` },
  );
  await app;
  return { pathname: () => app.getPathname() };
}

// Every step keeps its Continue mounted underneath the next one, so press the last.
async function pressContinue() {
  await fireEvent.press(screen.getAllByText('Continue').at(-1)!);
}

function isChecked(name: string) {
  return screen.getByRole('checkbox', { name }).props.accessibilityState.checked;
}

test('Continue waits for an answer', async () => {
  const app = await start('goal');
  expect(screen.getByText('What brings you to Muvlet?')).toBeOnTheScreen();

  await pressContinue();
  expect(app.pathname()).toBe('/onboarding/goal');

  await fireEvent.press(screen.getByText('Get stronger'));
  await pressContinue();
  expect(app.pathname()).toBe('/onboarding/experience');
  expect(screen.getByText('How much have you lifted before?')).toBeOnTheScreen();
});

test('the day picker asks for 2 to 5 days', async () => {
  const app = await start('days');
  // Mon, Wed and Fri start ticked.
  expect(screen.queryByText(/Pick/)).toBeNull();

  await fireEvent.press(screen.getByRole('checkbox', { name: 'Monday' }));
  await fireEvent.press(screen.getByRole('checkbox', { name: 'Wednesday' }));
  expect(screen.getByText('Pick at least 2 days')).toBeOnTheScreen();
  await pressContinue();
  expect(app.pathname()).toBe('/onboarding/days');

  for (const day of ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']) {
    await fireEvent.press(screen.getByRole('checkbox', { name: day }));
  }
  expect(screen.getByText('Pick up to 5 days')).toBeOnTheScreen();

  await fireEvent.press(screen.getByRole('checkbox', { name: 'Sunday' }));
  await pressContinue();
  expect(app.pathname()).toBe('/onboarding/place');
});

test('where you train picks the equipment you likely have', async () => {
  await start('place');
  expect(isChecked('Barbell')).toBe(true);
  expect(isChecked('Just my body')).toBe(false);

  await fireEvent.press(screen.getByText('Home'));
  expect(isChecked('Barbell')).toBe(false);
  expect(isChecked('Dumbbells')).toBe(true);
  expect(isChecked('Just my body')).toBe(true);
});

test('About you needs Male or Female to continue, but can be skipped', async () => {
  const app = await start('about');
  expect(
    screen.getByText('Only used to set your food targets. Only you can see this.'),
  ).toBeOnTheScreen();

  await pressContinue();
  expect(app.pathname()).toBe('/onboarding/about');

  await fireEvent.press(screen.getByText('Skip'));
  expect(app.pathname()).toBe('/onboarding/limits');
});

test('the steppers change height and weight in the units picked', async () => {
  await start('about');
  expect(screen.getByText('5′ 9″')).toBeOnTheScreen();
  expect(screen.getByText('170 lb')).toBeOnTheScreen();

  await fireEvent.press(screen.getByRole('button', { name: 'More weight' }));
  expect(screen.getByText('171 lb')).toBeOnTheScreen();

  await fireEvent.press(screen.getByText('kg'));
  expect(screen.getByText('78 kg')).toBeOnTheScreen();
  expect(screen.getByText('175 cm')).toBeOnTheScreen();
});

test('the whole flow ends on Today, with no way back into it', async () => {
  const app = await start();
  await pressContinue();
  await fireEvent.press(screen.getByText('Lose some fat'));
  await pressContinue();
  await fireEvent.press(screen.getByText('Never lifted'));
  await pressContinue();
  await pressContinue();
  await pressContinue();
  await fireEvent.press(screen.getByText('Female'));
  await pressContinue();
  expect(app.pathname()).toBe('/onboarding/limits');

  await fireEvent.press(screen.getByText('Knees'));
  await pressContinue();
  expect(app.pathname()).toBe('/today');
  expect(router.canGoBack()).toBe(false);
});

test('Back returns to the step before', async () => {
  const app = await start();
  await pressContinue();
  await fireEvent.press(screen.getByText('Get stronger'));
  await pressContinue();
  expect(app.pathname()).toBe('/onboarding/experience');

  await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Back' })));
  expect(app.pathname()).toBe('/onboarding/goal');
});
