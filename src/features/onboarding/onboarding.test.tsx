import { router, Stack } from 'expo-router';
import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { Text } from 'react-native';
import { State } from 'react-native-gesture-handler';
import 'react-native-gesture-handler/jestSetup';
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils';
import * as Reanimated from 'react-native-reanimated';

import OnboardingLayout from './onboarding-layout';
import { BuildStep, PlanStep, SaveStep } from './plan-steps';
import {
  AboutStep,
  DaysStep,
  ExperienceStep,
  GoalStep,
  IntroStep,
  LimitsStep,
  PlaceStep,
} from './questions';
import { RemindersStep } from './reminders-step';
import { SignUpStep } from './sign-up-step';
import { WHEEL_ROW } from './wheel-sheet';

jest.mock('react-native-worklets', () => jest.requireActual('react-native-worklets/src/mock'));
// Rive is native code that doesn't run in Jest.
jest.mock('@/features/welcome/coach', () => ({ Coach: () => null }));

// The phone's notification prompt, answered "Don't Allow".
const mockRequestPermissions = jest.fn(async () => ({ granted: false }));
jest.mock('expo-notifications', () => ({
  AndroidImportance: { DEFAULT: 5 },
  setNotificationChannelAsync: async () => null,
  requestPermissionsAsync: () => mockRequestPermissions(),
}));

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
      'onboarding/build': BuildStep,
      'onboarding/plan': PlanStep,
      'onboarding/save': SaveStep,
      'onboarding/sign-up': SignUpStep,
      'onboarding/reminders': RemindersStep,
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

// From the intro to the last question, picking "Lose some fat".
async function answerEverything() {
  await pressContinue();
  await fireEvent.press(screen.getByText('Lose some fat'));
  await pressContinue();
  await fireEvent.press(screen.getByText('Never lifted'));
  await pressContinue();
  await pressContinue();
  await pressContinue();
  await fireEvent.press(screen.getByText('Female'));
  await pressContinue();
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

test('height, weight and age are picked on a wheel in a sheet', async () => {
  await start('about');
  // Units live in the sheets now, not on the screen.
  expect(screen.queryByText('kg')).not.toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Height, 5′ 9″' })).toBeOnTheScreen();

  await fireEvent.press(screen.getByRole('button', { name: 'Weight, 170 lb' }));
  expect(screen.getByText('Your weight')).toBeOnTheScreen();
  await fireEvent(screen.getByRole('adjustable', { name: 'Weight' }), 'accessibilityAction', {
    nativeEvent: { actionName: 'increment' },
  });
  await fireEvent.press(screen.getByText('Done'));
  expect(screen.queryByText('Your weight')).not.toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Weight, 171 lb' })).toBeOnTheScreen();
});

test('a flick of the wheel picks the row it stops on', async () => {
  await start('about');
  await fireEvent.press(screen.getByRole('button', { name: 'Age, 28' }));
  // The wheel's rows run from 13, so the 22nd row is 35.
  await fireEvent(screen.getByTestId('wheel'), 'momentumScrollEnd', {
    nativeEvent: { contentOffset: { y: WHEEL_ROW * 22 } },
  });
  await fireEvent.press(screen.getByText('Done'));
  expect(screen.getByRole('button', { name: 'Age, 35' })).toBeOnTheScreen();
});

test('height switches between ft and cm, weight between lb and kg, each on its own', async () => {
  await start('about');

  await fireEvent.press(screen.getByRole('button', { name: 'Height, 5′ 9″' }));
  expect(screen.queryByText('lb')).not.toBeOnTheScreen();
  await fireEvent.press(screen.getByText('cm'));
  expect(screen.getByRole('adjustable', { name: 'Height' })).toHaveAccessibilityValue({
    text: '175 cm',
  });
  await fireEvent.press(screen.getByText('Done'));
  expect(screen.getByRole('button', { name: 'Height, 175 cm' })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Weight, 170 lb' })).toBeOnTheScreen();

  await fireEvent.press(screen.getByRole('button', { name: 'Weight, 170 lb' }));
  expect(screen.queryByText('cm')).not.toBeOnTheScreen();
  await fireEvent.press(screen.getByText('kg'));
  await fireEvent.press(screen.getByText('Done'));
  expect(screen.getByRole('button', { name: 'Weight, 77 kg' })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Height, 175 cm' })).toBeOnTheScreen();
});

// Drags the sheet by its grabber. A close it causes lands a moment later, so check with waitFor.
function dragSheet(down: number, velocity: number) {
  fireGestureHandler(getByGestureTestId('sheet-drag'), [
    { state: State.BEGAN, translationY: 0 },
    { state: State.ACTIVE, translationY: down / 2 },
    { state: State.ACTIVE, translationY: down },
    { state: State.END, translationY: down, velocityY: velocity },
  ]);
}

const sheetCloses = () =>
  waitFor(() => expect(screen.queryByText('Your weight')).not.toBeOnTheScreen(), {
    timeout: 300,
  });

test('dragging the sheet down closes it', async () => {
  await start('about');
  await fireEvent.press(screen.getByRole('button', { name: 'Weight, 170 lb' }));
  expect(screen.getByText('Your weight')).toBeOnTheScreen();

  dragSheet(300, 1200);
  await sheetCloses();
  expect(screen.getByRole('button', { name: 'Weight, 170 lb' })).toBeOnTheScreen();
});

test('a small, slow drag lets the sheet spring back', async () => {
  await start('about');
  await fireEvent.press(screen.getByRole('button', { name: 'Weight, 170 lb' }));
  dragSheet(40, 100);
  await expect(sheetCloses()).rejects.toThrow();
  expect(screen.getByText('Your weight')).toBeOnTheScreen();
});

test('the age sheet has no units switch', async () => {
  await start('about');
  await fireEvent.press(screen.getByRole('button', { name: 'Age, 28' }));
  expect(screen.getByText('Your age')).toBeOnTheScreen();
  for (const unit of ['ft', 'cm', 'lb', 'kg']) {
    expect(screen.queryByText(unit)).not.toBeOnTheScreen();
  }
});

test('the whole flow ends on Today, with no way back into it', async () => {
  const app = await start();
  await answerEverything();
  expect(app.pathname()).toBe('/onboarding/limits');

  await fireEvent.press(screen.getByText('Knees'));
  await pressContinue();
  // With reduced motion the coaches build the plan at once.
  expect(await screen.findByText('Your plan is ready!')).toBeOnTheScreen();
  expect(screen.getByText('1,900')).toBeOnTheScreen();

  await fireEvent.press(screen.getByText('Looks good'));
  expect(app.pathname()).toBe('/onboarding/save');
  await fireEvent.press(screen.getByText('Later'));
  expect(app.pathname()).toBe('/onboarding/reminders');
  await fireEvent.press(screen.getByText('Not now'));
  expect(app.pathname()).toBe('/today');
  expect(router.canGoBack()).toBe(false);
});

test('the plan goes back to the last question, or to the first to change answers', async () => {
  const app = await start();
  await answerEverything();
  await pressContinue();
  await screen.findByText('Your plan is ready!');

  // The build screen isn't shown again.
  await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Back' })));
  expect(app.pathname()).toBe('/onboarding/limits');

  await pressContinue();
  await screen.findByText('Your plan is ready!');
  await fireEvent.press(screen.getByText('Change my answers'));
  expect(app.pathname()).toBe('/onboarding/goal');
  // The answers are kept.
  await pressContinue();
  expect(app.pathname()).toBe('/onboarding/experience');
});

test('skipping About you leaves food targets for later', async () => {
  await start('about');
  await fireEvent.press(screen.getByText('Skip'));
  await pressContinue();
  await screen.findByText('Your plan is ready!');
  expect(screen.getByText('Food targets')).toBeOnTheScreen();
  expect(screen.queryByText('calories a day')).toBeNull();
});

test('email sign-up checks the form before moving on', async () => {
  const app = await start('save');
  await fireEvent.press(screen.getByText('Continue with email'));
  expect(app.pathname()).toBe('/onboarding/sign-up');

  const create = () => screen.getByRole('button', { name: 'Create account' });
  await fireEvent.changeText(screen.getByLabelText('What should we call you?'), 'Arun');
  await fireEvent.changeText(screen.getByLabelText('Email'), 'arun@example');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'muvlet1');
  expect(screen.getByText('Too short. Use 8 or more characters.')).toBeOnTheScreen();
  expect(create()).toBeDisabled();

  await fireEvent.changeText(screen.getByLabelText('Password'), 'muvlet12');
  expect(screen.getByText('Good password.')).toBeOnTheScreen();
  expect(create()).toBeDisabled();

  await fireEvent.changeText(screen.getByLabelText('Email'), 'arun@example.com');
  expect(create()).toBeEnabled();
  await fireEvent.press(create());
  expect(app.pathname()).toBe('/onboarding/reminders');
});

test('turning on reminders asks the phone first', async () => {
  const app = await start('reminders');
  expect(screen.getByText('Push day at 6 PM. Ready when you are.')).toBeOnTheScreen();

  await fireEvent.press(screen.getByText('Turn on reminders'));
  expect(mockRequestPermissions).toHaveBeenCalled();
  await waitFor(() => expect(app.pathname()).toBe('/today'));
});

test('with reminders off there is nothing to ask', async () => {
  const app = await start('reminders');
  mockRequestPermissions.mockClear();
  await fireEvent.press(screen.getByText('Off'));
  expect(screen.queryByText(/Ready when you are/)).toBeNull();

  await pressContinue();
  expect(mockRequestPermissions).not.toHaveBeenCalled();
  expect(app.pathname()).toBe('/today');
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
