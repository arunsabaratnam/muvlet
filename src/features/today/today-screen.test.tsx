import { act, fireEvent, render, screen } from '@testing-library/react-native';
import 'react-native-gesture-handler/jestSetup';

import TodayScreen from './today-screen';

jest.mock('react-native-worklets', () => jest.requireActual('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated/mock'),
  useReducedMotion: () => true,
}));
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);
// Rive is native code that doesn't run in Jest.
jest.mock('@/features/welcome/coach', () => ({ Coach: () => null }));

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2026, 8, 28, 17, 45));
});

afterEach(() => {
  jest.useRealTimers();
});

async function wait(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

test('shows the day, the greeting and the level', async () => {
  await render(<TodayScreen />);

  expect(screen.getByText('Monday, Sept 28')).toBeOnTheScreen();
  expect(screen.getByText('Good evening, Arun')).toBeOnTheScreen();
  expect(screen.getByText('Gym Rookie')).toBeOnTheScreen();
  expect(screen.getByText('1,380 / 1,500')).toBeOnTheScreen();
  expect(screen.getByText('Push Day A takes you to Level 5')).toBeOnTheScreen();
});

test('lays the day out in sections, with breakfast already done', async () => {
  await render(<TodayScreen />);

  expect(screen.getByText('Morning')).toBeOnTheScreen();
  expect(screen.getByText('Breakfast · 28 g protein')).toBeOnTheScreen();
  expect(screen.queryByText('Breakfast logged')).not.toBeOnTheScreen();
  expect(screen.getByText('Evening')).toBeOnTheScreen();
  expect(screen.getByText('Before bed')).toBeOnTheScreen();
  expect(screen.getByText('Chest, shoulders and triceps')).toBeOnTheScreen();

  // The coach of the next step says their line, then it fades.
  await wait(700);
  expect(screen.getByText("Rex: Ready when you are. I'll time your rests.")).toBeOnTheScreen();
  await wait(6500);
  expect(screen.queryByText(/Ready when you are/)).not.toBeOnTheScreen();
});

test('finishing the workout earns its points and folds it into the chip', async () => {
  await render(<TodayScreen />);

  await fireEvent.press(screen.getByText('Start workout'));
  expect(screen.getByText('Push Day A done')).toBeOnTheScreen();
  expect(screen.getByText('Gym Regular')).toBeOnTheScreen();
  expect(screen.getByText('1,580 / 2,000')).toBeOnTheScreen();

  await wait(1100);
  expect(screen.queryByText('Push Day A done')).not.toBeOnTheScreen();
  expect(screen.getByText('Workout · 45 min')).toBeOnTheScreen();
  // Dinner is next, and now it's about recovery.
  expect(screen.getByText('Aim for 40 g protein after training')).toBeOnTheScreen();
  expect(screen.getByText("Level up! You're a Gym Regular now.")).toBeOnTheScreen();
  // The week and the reads move on too.
  expect(screen.getByText('1 of 3 workouts this week')).toBeOnTheScreen();
  expect(screen.getByText('Why sore muscles are normal')).toBeOnTheScreen();
});

test('logging dinner counts its protein', async () => {
  await render(<TodayScreen />);
  expect(screen.getByText('58 g')).toBeOnTheScreen();
  expect(screen.getByText('High-protein dinners in 15 minutes')).toBeOnTheScreen();

  await fireEvent.press(screen.getByText('Snap your dinner'));
  await fireEvent.press(screen.getByText('Snap a photo'));

  expect(screen.getByText('20 g')).toBeOnTheScreen();
  expect(screen.getByText('3 quick high-protein breakfasts')).toBeOnTheScreen();
});

test('a done step can be opened from its chip and undone', async () => {
  await render(<TodayScreen />);

  await fireEvent.press(screen.getByText('Breakfast · 28 g protein'));
  await fireEvent.press(screen.getByText('Breakfast logged'));
  await fireEvent.press(screen.getByText('Undo'));

  // It's past breakfast time, so it waits as a quiet line.
  expect(screen.getByText('Breakfast · log it later')).toBeOnTheScreen();
  expect(screen.getByText('1,370 / 1,500')).toBeOnTheScreen();

  await fireEvent.press(screen.getByText('Log it'));
  expect(screen.getByText('Breakfast logged')).toBeOnTheScreen();
});

test('another step can be opened instead', async () => {
  await render(<TodayScreen />);

  await fireEvent.press(screen.getByText('Wind-down stretch'));

  expect(screen.getByText('Begin stretch')).toBeOnTheScreen();
  expect(screen.queryByText('Start workout')).not.toBeOnTheScreen();
});

test('the workout can be looked over first, and started from there', async () => {
  await render(<TodayScreen />);

  await fireEvent.press(screen.getByText('Preview'));
  expect(screen.getByText('Workout · 45 min')).toBeOnTheScreen();
  expect(screen.getByText('Dumbbell bench press')).toBeOnTheScreen();
  expect(screen.getByText("You'll need dumbbells, a bench and a cable machine.")).toBeOnTheScreen();

  await fireEvent.press(screen.getAllByText('Start workout').at(-1)!);
  expect(screen.queryByText('Dumbbell bench press')).not.toBeOnTheScreen();
  // It starts once the sheet is out of the way.
  await wait(260);
  expect(screen.getByText('Push Day A done')).toBeOnTheScreen();
});

test('the stretch shows its moves', async () => {
  await render(<TodayScreen />);

  await fireEvent.press(screen.getByText('Wind-down stretch'));
  await fireEvent.press(screen.getByText('See 5 moves'));

  expect(screen.getByText("Child's pose")).toBeOnTheScreen();
  expect(screen.getByText('No equipment. The floor or your bed is fine.')).toBeOnTheScreen();
});

// Development builds open Today on other days from a long press on the avatar.
async function tryDay(name: string) {
  await render(<TodayScreen />);
  await fireEvent(screen.getByText('A'), 'longPress');
  await fireEvent.press(screen.getByText(name));
}

test('a meal whose time has passed waits as a quiet line', async () => {
  await tryDay('Breakfast slipped by');

  expect(screen.getByText('Breakfast · log it later')).toBeOnTheScreen();
  expect(screen.getByText('Start workout')).toBeOnTheScreen();
  await wait(700);
  expect(
    screen.getByText("Sage: Breakfast slipped by? All good. I'll catch you at dinner."),
  ).toBeOnTheScreen();
});

test('late at night, the stretch can be let go', async () => {
  await tryDay('Too tired to stretch');

  await fireEvent.press(screen.getByText('Not tonight'));
  await wait(1100);
  expect(screen.getByText('Stretch · skipped')).toBeOnTheScreen();
  // No points lost, and none earned.
  expect(screen.getByText('1,600 / 2,000')).toBeOnTheScreen();
});

test("yesterday's missed workout can be done today", async () => {
  await tryDay("Yesterday's workout didn't happen");
  expect(screen.queryByText('Start workout')).not.toBeOnTheScreen();

  await fireEvent.press(screen.getByText('Do it today'));
  expect(screen.queryByText('Do it today')).not.toBeOnTheScreen();
  expect(screen.getByText('Start workout')).toBeOnTheScreen();
  expect(screen.getByText('Rex: Push Day A is on for today.')).toBeOnTheScreen();
});

test('or moved, from Other options', async () => {
  await tryDay("Yesterday's workout didn't happen");

  await fireEvent.press(screen.getByText('Other options'));
  await fireEvent.press(screen.getByText('Move it to Thursday'));
  // It happens once the sheet is out of the way.
  await wait(260);
  expect(screen.queryByText('Do it today')).not.toBeOnTheScreen();
  expect(
    screen.getByText("Rex: Moved to Thursday. I'll remind you that morning."),
  ).toBeOnTheScreen();
});

test('a rest day has nothing to tick', async () => {
  await tryDay('Rest day');

  expect(
    screen.getByText('Nothing to tick today. Rest days count toward your streak.'),
  ).toBeOnTheScreen();
  expect(screen.getByText('Easy walk · optional')).toBeOnTheScreen();
  expect(screen.queryByText('Push Day A')).not.toBeOnTheScreen();
  expect(screen.getByText('5-week streak')).toBeOnTheScreen();
  expect(screen.getByText('What rest days do for your muscles')).toBeOnTheScreen();
});

test('coming back after time away eases in', async () => {
  await tryDay('Back after 12 days');
  expect(screen.getByText('New streak · week 1')).toBeOnTheScreen();

  await fireEvent.press(screen.getByText('Ease back in'));
  expect(screen.getByText('Bench 30 lb · lighter to start')).toBeOnTheScreen();
  expect(screen.getByText("Today's workout · 35 min")).toBeOnTheScreen();
});

test('on a break, meals are optional until the plan is back on', async () => {
  await tryDay('On a break');

  expect(screen.getByText('Breakfast · optional')).toBeOnTheScreen();
  expect(screen.getByText('Streak on hold')).toBeOnTheScreen();
  expect(screen.getByText('120 pts to Level 5. Your level waits for you.')).toBeOnTheScreen();
  expect(screen.queryByText('Push Day A')).not.toBeOnTheScreen();

  await fireEvent.press(screen.getByText('Resume now'));
  expect(screen.getByText('Snap breakfast')).toBeOnTheScreen();
  expect(screen.getByText('Push Day A')).toBeOnTheScreen();
  expect(screen.getByText('4-week streak')).toBeOnTheScreen();
});
