import { router, Stack, usePathname } from 'expo-router';
import { createContext, use, useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { coachColors, colors, fonts } from '@/constants/theme';
import { Coach, type CoachHandle, type CoachName } from '@/features/welcome/coach';

import { AnswersProvider, useAnswers } from './answers';
import { BackIcon } from './icons';
import { GOAL_COACH, goOn, isStep, progress, QUESTIONS, STEPS, type StepId } from './steps';

/*
 * Everything that stays on screen while the steps change (design spec 4.2): the four
 * coaches, the speech bubble, the back chevron, progress bar and Skip. The steps' own
 * answers and buttons come and go in the Stack underneath. The coaches glide between
 * spots and hand over when a step belongs to someone else, like the mockup's onb.js.
 */

const CREW: CoachName[] = ['rex', 'axel', 'sage', 'luna'];
const HELLO_AFTER_HANDOFF_MS = 900;
const INTRO_WAVE_MS = 800;
const INTRO_LINE = "Hi, I'm Rex! Answer a few quick questions and I'll build your first week.";
const TYPE_START_MS = 950;
const TYPE_EVERY_MS = 34;

const swing = Easing.bezier(0.65, 0, 0.35, 1);
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const overshoot = Easing.bezier(0.34, 1.56, 0.64, 1);

/** Plays a move, e.g. "nod", on the coach who owns the current step or on the one named. */
const PlayCoach = createContext<(move: string, coach?: CoachName) => void>(() => {});

export function usePlayCoach() {
  return use(PlayCoach);
}

export default function OnboardingLayout() {
  return (
    <AnswersProvider>
      <Frame>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </Frame>
    </AnswersProvider>
  );
}

function Frame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const last = pathname.split('/').pop();
  const step: StepId = isStep(last) ? last : 'intro';
  const owner = STEPS[step].coach;
  const coaches = useRef<Partial<Record<CoachName, CoachHandle | null>>>({});

  // The step we came from decides how the bubble arrives.
  const [{ current, previous }, setSteps] = useState({ current: step, previous: step });
  if (current !== step) setSteps({ current: step, previous: current });
  const newCoach = STEPS[previous].coach !== owner;
  const handoff = newCoach || !QUESTIONS.includes(previous);

  useEffect(() => {
    const play = (move: string) => coaches.current[owner]?.play(move);
    const timer =
      step === 'intro'
        ? setTimeout(() => play('wave'), INTRO_WAVE_MS)
        : newCoach && step !== 'build' && setTimeout(() => play('hello'), HELLO_AFTER_HANDOFF_MS);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [step, owner, newCoach]);

  const { question, note, bar } = STEPS[step];

  return (
    <PlayCoach value={(move, coach = owner) => coaches.current[coach]?.play(move)}>
      <View style={styles.screen}>
        {children}
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {step === 'intro' ? <IntroShadow /> : null}
          {CREW.map((name, i) => (
            <CrewCoach
              key={name}
              name={name}
              index={i}
              step={step}
              ref={(coach) => {
                coaches.current[name] = coach;
              }}
            />
          ))}
          {step === 'intro' ? <IntroBubble /> : null}
          {question ? (
            <Bubble key={step} question={question} note={note} handoff={handoff} />
          ) : null}
          {bar ? <TopBar step={step} /> : null}
        </View>
      </View>
    </PlayCoach>
  );
}

type Spot = { x: number; y: number; width: number; opacity: number };

/** Where each coach stands on a step, as fractions of the screen like the mockup. */
function spotFor(step: StepId, index: number, width: number, height: number): Spot {
  const owner = CREW.indexOf(STEPS[step].coach);
  const corner = { x: width * 0.03, y: height * 0.122, width: width * 0.31, opacity: 1 };
  const row = {
    x: width * (0.06 + index * 0.2171),
    y: height * 0.24,
    width: width * 0.229,
    opacity: 1,
  };
  const below = { ...row, y: height * 0.6, opacity: 0 };
  if (step === 'build') return row;
  if (step === 'sign-up') return below;
  if ((step === 'plan' || step === 'save') && index !== owner) return below;
  if (step === 'intro') {
    return index === 0
      ? { x: width * 0.21, y: height * 0.31, width: width * 0.58, opacity: 1 }
      : {
          x: width * (1.1 + index * 0.08),
          y: height * 0.41 - width * 0.3,
          width: width * 0.229,
          opacity: 0,
        };
  }
  if (index === owner) return corner;
  // Coaches who've had their turn wait off the left edge, the rest off the right.
  return { ...corner, x: index < owner ? -width * 0.4 : width * 1.1, opacity: 0 };
}

function CrewCoach({
  name,
  index,
  step,
  ref,
}: {
  name: CoachName;
  index: number;
  step: StepId;
  ref: (coach: CoachHandle | null) => void;
}) {
  const { width, height } = useWindowDimensions();
  // Drawn at the biggest size and scaled down, so the coach stays sharp.
  const size = width * 0.58;
  const spot = spotFor(step, index, width, height);

  const x = useSharedValue(spot.x);
  const y = useSharedValue(spot.y);
  const scale = useSharedValue(spot.width / size);
  const opacity = useSharedValue(spot.opacity);

  useEffect(() => {
    const delay = index * 50;
    const glide = (to: number) =>
      withDelay(delay, withTiming(to, { duration: 800, easing: swing }));
    x.value = glide(spot.x);
    y.value = glide(spot.y);
    scale.value = glide(spot.width / size);
    opacity.value = withDelay(
      delay + (spot.opacity ? 0 : 160),
      withTiming(spot.opacity, { duration: 560 }),
    );
  }, [index, spot.x, spot.y, spot.width, spot.opacity, size, x, y, scale, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.coach, { width: size, height: (size * 190) / 200 }, style]}>
      <Coach name={name} ref={ref} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

function TopBar({ step }: { step: StepId }) {
  const { width, height } = useWindowDimensions();
  const { answers, update } = useAnswers();
  const { skippable, coach } = STEPS[step];
  // On the goal step the bar takes the colour of the goal picked.
  const fillCoach = step === 'goal' && answers.goal ? GOAL_COACH[answers.goal] : coach;

  const fill = useSharedValue(0);
  useEffect(() => {
    fill.value = withTiming(progress(step), { duration: 600, easing: ease });
  }, [fill, step]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));

  function skip() {
    if (step === 'about') update({ skippedAbout: true });
    goOn(step);
  }

  return (
    <Animated.View
      entering={slideDown}
      exiting={FadeOut.duration(250)}
      style={[styles.topBar, { top: height * 0.074, left: width * 0.05, right: width * 0.05 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={12}
        onPress={() => router.back()}>
        <BackIcon color={colors.textFaint} />
      </Pressable>
      <View style={styles.track}>
        <Animated.View
          style={[styles.fill, { backgroundColor: coachColors[fillCoach].ink }, fillStyle]}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={!skippable}
        onPress={skip}
        style={[styles.skip, !skippable && styles.hidden]}>
        <Text style={styles.skipLabel}>Skip</Text>
      </Pressable>
    </Animated.View>
  );
}

function slideDown() {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ translateY: -8 }] },
    animations: {
      opacity: withDelay(250, withTiming(1, { duration: 450 })),
      transform: [{ translateY: withDelay(250, withTiming(0, { duration: 450 })) }],
    },
  };
}

/** The question in a bubble beside the corner coach. */
function Bubble({
  question,
  note,
  handoff,
}: {
  question: string;
  note?: string;
  handoff: boolean;
}) {
  const { width, height } = useWindowDimensions();
  // A new coach's bubble pops in after they arrive; the same coach's just swaps.
  const from = handoff ? 0.6 : 0.94;
  const delay = handoff ? 560 : 120;
  const duration = handoff ? 500 : 380;
  const popIn = () => {
    'worklet';
    return {
      initialValues: { opacity: 0, transform: [{ scale: from }] },
      animations: {
        opacity: withDelay(delay, withTiming(1, { duration })),
        transform: [{ scale: withDelay(delay, withTiming(1, { duration, easing: overshoot })) }],
      },
    };
  };

  return (
    <Animated.View
      entering={popIn}
      exiting={FadeOut.duration(150)}
      pointerEvents="none"
      style={[styles.bubble, { top: height * 0.146, left: width * 0.36, right: width * 0.05 }]}>
      <View style={styles.bubbleTail} />
      <Text style={styles.question}>{question}</Text>
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </Animated.View>
  );
}

/** Rex's hello on the intro, typed out a letter at a time. */
function IntroBubble() {
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const [typed, setTyped] = useState(reduceMotion ? INTRO_LINE.length : 0);

  useEffect(() => {
    if (reduceMotion) return;
    let typing: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      let count = 0;
      typing = setInterval(() => {
        count += 1;
        setTyped(count);
        if (count >= INTRO_LINE.length) clearInterval(typing);
      }, TYPE_EVERY_MS);
    }, TYPE_START_MS);
    return () => {
      clearTimeout(start);
      clearInterval(typing);
    };
  }, [reduceMotion]);

  const blink = useSharedValue(1);
  useEffect(() => {
    blink.value = withRepeat(
      withSequence(
        withDelay(500, withTiming(0, { duration: 0 })),
        withDelay(500, withTiming(1, { duration: 0 })),
      ),
      -1,
    );
  }, [blink]);
  const cursorStyle = useAnimatedStyle(() => ({ opacity: blink.value }));

  return (
    <Animated.View
      entering={riseIn}
      exiting={FadeOut.duration(250)}
      pointerEvents="none"
      accessible
      accessibilityLabel={INTRO_LINE}
      style={[styles.introBubble, { top: height * 0.12, left: width * 0.08, right: width * 0.08 }]}>
      <Text style={styles.introLine}>
        {INTRO_LINE.slice(0, typed)}
        {typed < INTRO_LINE.length ? (
          <Animated.Text style={[styles.cursor, cursorStyle]}>|</Animated.Text>
        ) : null}
      </Text>
      <View style={styles.introTail} />
    </Animated.View>
  );
}

function riseIn() {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ translateY: 10 }, { scale: 0.96 }] },
    animations: {
      opacity: withDelay(650, withTiming(1, { duration: 500 })),
      transform: [
        { translateY: withDelay(650, withTiming(0, { duration: 500 })) },
        { scale: withDelay(650, withTiming(1, { duration: 500 })) },
      ],
    },
  };
}

/** A soft shadow on the floor under Rex on the intro. */
function IntroShadow() {
  const { width, height } = useWindowDimensions();
  return (
    <Animated.View
      entering={riseIn}
      exiting={FadeOut.duration(250)}
      style={[styles.introShadow, { top: height * 0.57, height: width * 0.05 }]}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  coach: {
    position: 'absolute',
    left: 0,
    top: 0,
    transformOrigin: 'left top',
  },
  topBar: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  track: {
    flex: 1,
    height: 12,
    borderRadius: 9,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  fill: {
    height: '100%',
    borderRadius: 9,
  },
  skip: {
    minWidth: 35,
    padding: 4,
  },
  hidden: {
    opacity: 0,
  },
  skipLabel: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 15,
    color: colors.textFaint,
  },
  bubble: {
    position: 'absolute',
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    transformOrigin: '0% 60%',
  },
  // A rotated square peeking out of the left edge, pointing at the coach.
  bubbleTail: {
    position: 'absolute',
    left: -9,
    top: '42%',
    width: 14,
    height: 14,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    transform: [{ rotate: '45deg' }],
  },
  question: {
    fontFamily: fonts.headingHeavy,
    fontSize: 21,
    lineHeight: 26,
    color: colors.text,
  },
  note: {
    marginTop: 5,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    lineHeight: 17.5,
    color: colors.textMuted,
  },
  introBubble: {
    position: 'absolute',
    minHeight: 113,
    paddingVertical: 17,
    paddingHorizontal: 19,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: '0 8px 23px -12px rgba(30, 40, 80, 0.18)',
  },
  introLine: {
    fontFamily: fonts.bodyBold,
    fontSize: 20,
    lineHeight: 28,
    color: colors.text,
  },
  cursor: {
    color: coachColors.rex.ink,
  },
  // A rotated square under the bubble, pointing down at Rex.
  introTail: {
    position: 'absolute',
    left: '46%',
    bottom: -11,
    width: 20,
    height: 20,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    transform: [{ rotate: '45deg' }],
  },
  introShadow: {
    position: 'absolute',
    left: '30%',
    right: '30%',
    experimental_backgroundImage:
      'radial-gradient(closest-side, rgba(29, 36, 51, 0.1), rgba(29, 36, 51, 0))',
  },
});
