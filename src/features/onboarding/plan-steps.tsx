import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/ui';
import { coachColors, colors, fonts } from '@/constants/theme';
import type { CoachName } from '@/features/welcome/coach';

import { useAnswers } from './answers';
import { TextButton } from './controls';
import { AppleIcon, GoogleIcon, MailIcon, TickIcon } from './icons';
import { usePlayCoach } from './onboarding-layout';
import { buildPlan } from './plan';
import { PlanCard } from './plan-card';
import { StepScreen } from './step-screen';
import { goOn } from './steps';

/* Building your plan, Plan ready and Save your plan (design spec 4.2), timed like onb.js. */

const FIRST_LINE_MS = 900;
const LINE_EVERY_MS = 800;
const LINE_TAKES_MS = 700;
const SHOW_PLAN_AFTER_MS = 1100;

// Apple's sign-in button has to be black.
const APPLE = { ink: '#111111', shade: '#000000' };

// Each coach does their part of the plan, in order.
const JOBS: { coach: CoachName; move: string; text: string; withoutAbout?: string }[] = [
  { coach: 'rex', move: 'lift', text: 'Rex is choosing your exercises' },
  { coach: 'axel', move: 'squat', text: 'Axel is adding form tips' },
  {
    coach: 'sage',
    move: 'drink',
    text: 'Sage is setting your food targets',
    withoutAbout: 'Sage is picking meal ideas',
  },
  { coach: 'luna', move: 'stretch', text: 'Luna is planning rest days' },
];

type LineState = 'waiting' | 'doing' | 'done';

export function BuildStep() {
  const { answers } = useAnswers();
  const play = usePlayCoach();
  const reduceMotion = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const [doing, setDoing] = useState(-1);
  const [done, setDone] = useState(0);

  useEffect(() => {
    // With reduced motion everything happens at once and the plan shows straight away.
    const at = (ms: number, run: () => void) => setTimeout(run, reduceMotion ? 0 : ms);
    const allDone = FIRST_LINE_MS + JOBS.length * LINE_EVERY_MS + LINE_TAKES_MS;
    const timers = [
      at(700, () => JOBS.forEach((job) => play(job.move, job.coach))),
      ...JOBS.flatMap((job, i) => [
        at(FIRST_LINE_MS + i * LINE_EVERY_MS, () => setDoing(i)),
        at(FIRST_LINE_MS + i * LINE_EVERY_MS + LINE_TAKES_MS, () => {
          setDone(i + 1);
          play('jump', job.coach);
        }),
      ]),
      ...JOBS.map((job, i) => at(allDone + i * 90, () => play('victory', job.coach))),
      // Replaced, so Back on the plan goes to the last question.
      at(allDone + SHOW_PLAN_AFTER_MS, () => router.replace('/onboarding/plan')),
    ];
    return () => timers.forEach(clearTimeout);
  }, [play, reduceMotion]);

  return (
    <View style={styles.screen}>
      <Animated.Text
        accessibilityRole="header"
        entering={rise(400)}
        style={[styles.buildTitle, { top: height * 0.44 }]}>
        Building your plan
      </Animated.Text>
      <Animated.View
        entering={rise(500)}
        style={[styles.lines, { top: height * 0.53, left: width * 0.1, right: width * 0.1 }]}>
        {JOBS.map((job, i) => (
          <BuildLine
            key={job.coach}
            text={(answers.skippedAbout && job.withoutAbout) || job.text}
            coach={job.coach}
            state={i < done ? 'done' : i === doing ? 'doing' : 'waiting'}
          />
        ))}
      </Animated.View>
    </View>
  );
}

function BuildLine({ text, coach, state }: { text: string; coach: CoachName; state: LineState }) {
  const { ink } = coachColors[coach];
  return (
    <View style={styles.line}>
      {state === 'doing' ? (
        <Spinner color={ink} />
      ) : (
        <View
          style={[styles.circle, state === 'done' && { backgroundColor: ink, borderColor: ink }]}>
          {state === 'done' ? (
            <Animated.View entering={popIn}>
              <TickIcon color={colors.onPrimary} />
            </Animated.View>
          ) : null}
        </View>
      )}
      <Text style={[styles.lineText, state !== 'waiting' && styles.lineTextOn]}>{text}</Text>
    </View>
  );
}

function Spinner({ color }: { color: string }) {
  const turn = useSharedValue(0);
  useEffect(() => {
    turn.value = withRepeat(withTiming(360, { duration: 700, easing: Easing.linear }), -1);
  }, [turn]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value}deg` }] }));
  return (
    <Animated.View
      style={[styles.circle, { borderColor: color, borderTopColor: 'transparent' }, style]}
    />
  );
}

function rise(delay: number) {
  return () => {
    'worklet';
    return {
      initialValues: { opacity: 0, transform: [{ translateY: 12 }] },
      animations: {
        opacity: withDelay(delay, withTiming(1, { duration: 500 })),
        transform: [{ translateY: withDelay(delay, withTiming(0, { duration: 500 })) }],
      },
    };
  };
}

function popIn() {
  'worklet';
  return {
    initialValues: { transform: [{ scale: 0 }] },
    animations: {
      transform: [
        { scale: withTiming(1, { duration: 300, easing: Easing.bezier(0.34, 1.56, 0.64, 1) }) },
      ],
    },
  };
}

export function PlanStep() {
  const { answers } = useAnswers();
  const play = usePlayCoach();

  // Rex celebrates each time the plan comes into view.
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => play('victory'), 900);
      return () => clearTimeout(timer);
    }, [play]),
  );

  return (
    <StepScreen
      footer={
        <>
          <Button title="Looks good" color={coachColors.rex} onPress={() => goOn('plan')} />
          <TextButton
            title="Change my answers"
            onPress={() => router.dismissTo('/onboarding/goal')}
          />
        </>
      }>
      <PlanCard plan={buildPlan(answers)} />
    </StepScreen>
  );
}

export function SaveStep() {
  const { answers } = useAnswers();
  const play = usePlayCoach();

  // Accounts aren't built yet, so every way to save just moves on.
  function save(withEmail = false) {
    play('jump');
    if (withEmail) router.push('/onboarding/sign-up');
    else goOn('save');
  }

  return (
    <StepScreen
      footer={
        <>
          <Button
            title="Continue with Apple"
            color={APPLE}
            icon={<AppleIcon color={colors.onPrimary} />}
            onPress={() => save()}
          />
          <Button
            title="Continue with Google"
            variant="secondary"
            icon={<GoogleIcon />}
            onPress={() => save()}
          />
          <Button
            title="Continue with email"
            variant="secondary"
            color={coachColors.rex}
            icon={<MailIcon color={coachColors.rex.ink} />}
            onPress={() => save(true)}
          />
          <TextButton title="Later" onPress={() => save()} />
        </>
      }>
      <PlanCard plan={buildPlan(answers)} mini />
    </StepScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  buildTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: fonts.headingHeavy,
    fontSize: 27,
    color: colors.text,
  },
  lines: {
    position: 'absolute',
    gap: 13,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  circle: {
    width: 27,
    height: 27,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineText: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 15.5,
    color: colors.textFaint,
  },
  lineTextOn: {
    color: colors.text,
  },
});
