import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { coachColors, colors, fonts, spacing } from '@/constants/theme';

import { Coach, type CoachHandle, type CoachName } from './coach';

/*
 * Splash and welcome are one screen (design spec 4.1). On open, a ~1.5 s
 * "colour relay" plays: each coach's colour wipes out from them in turn while they
 * greet. Then the crew and wordmark glide up and the buttons arrive. The relay waits
 * on the plain wash until all four coaches are ready, so none of them pops in late.
 * Tapping during the relay skips to the end; with reduced motion it starts at the end.
 * Positions and timings are taken from the mockup's splashPlay().
 */

const CREW: CoachName[] = ['rex', 'axel', 'sage', 'luna'];
const FIRST_MOVE_MS = 150;
const RELAY_STEP_MS = 300;
const SETTLE_MS = 1500;
const GREET_AFTER_SETTLE_MS = 1000;
const IDLE_GREET_EVERY_MS = 4200;
// If a coach never loads, start anyway so the screen can't get stuck.
const CREW_LOAD_LIMIT_MS = 3000;

const ease = Easing.bezier(0.22, 1, 0.36, 1);
const wipeEase = Easing.bezier(0.65, 0, 0.35, 1);

function animateTo(value: SharedValue<number>, duration: number, delay = 0) {
  value.value = withDelay(delay, withTiming(1, { duration, easing: ease }));
}

export default function WelcomeScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const coaches = useRef<(CoachHandle | null)[]>([]);
  const relayTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // With reduced motion the screen opens already settled.
  const [settled, setSettled] = useState(reduceMotion);
  const [wipes, setWipes] = useState(0);
  const [ink, setInk] = useState<string>(reduceMotion ? colors.primary : coachColors.rex.ink);
  const [readyCoaches, setReadyCoaches] = useState<CoachName[]>([]);
  const [waitedTooLong, setWaitedTooLong] = useState(false);
  const crewReady = readyCoaches.length === CREW.length || waitedTooLong;

  const start = reduceMotion ? 1 : 0;
  const crewIn = useSharedValue(start);
  const wordmarkIn = useSharedValue(start);
  const washOut = useSharedValue(start);
  const crewUp = useSharedValue(start);
  const wordmarkUp = useSharedValue(start);
  const taglineIn = useSharedValue(start);
  const buttonsIn = useSharedValue(start);

  // Layout, as fractions of the screen like the mockup.
  const rowLeft = width * 0.06;
  const rowWidth = width * 0.88;
  const rowTop = height * 0.41;
  const slotWidth = rowWidth * 0.26;
  const slotHeight = (slotWidth * 190) / 200;
  const slotLeft = (i: number) => rowWidth * 0.2467 * i;
  const wordmarkSize = width * 0.125;

  function settle() {
    relayTimers.current.forEach(clearTimeout);
    setSettled(true);
    setInk(colors.primary);
    crewIn.value = 1;
    wordmarkIn.value = 1;
    animateTo(washOut, 700, 100);
    animateTo(crewUp, 900);
    animateTo(wordmarkUp, 900, 70);
    animateTo(taglineIn, 600, 550);
    animateTo(buttonsIn, 700, 650);
  }

  useEffect(() => {
    const timer = setTimeout(() => setWaitedTooLong(true), CREW_LOAD_LIMIT_MS);
    return () => clearTimeout(timer);
  }, []);

  // The relay, once the crew is ready.
  useEffect(() => {
    if (reduceMotion || !crewReady) return;
    const timers = relayTimers.current;
    const at = (ms: number, run: () => void) => timers.push(setTimeout(run, ms));
    animateTo(crewIn, 380);
    animateTo(wordmarkIn, 420, 80);
    at(FIRST_MOVE_MS, () => coaches.current[0]?.play('wave'));
    [1, 2, 3].forEach((i) => {
      const wipeAt = FIRST_MOVE_MS + i * RELAY_STEP_MS;
      at(wipeAt, () => setWipes(i));
      at(wipeAt + 100, () => coaches.current[i]?.play(i === 3 ? 'wave' : 'hello'));
      at(wipeAt + 260, () => setInk(coachColors[CREW[i]].ink));
    });
    at(SETTLE_MS, settle);
    return () => timers.forEach(clearTimeout);
    // Runs once the crew is ready; settle() only touches refs, shared values and state setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crewReady]);

  // Once settled the crew says hi, then a random coach waves now and then.
  useEffect(() => {
    if (!settled) return;
    const greetAt = reduceMotion ? 0 : GREET_AFTER_SETTLE_MS;
    const greets = CREW.map((_, i) =>
      setTimeout(() => coaches.current[i]?.play(i % 2 ? 'hello' : 'wave'), greetAt + i * 110),
    );
    const moves = ['wave', 'hello', 'giggle'];
    const idle = reduceMotion
      ? undefined
      : setInterval(() => {
          const coach = coaches.current[Math.floor(Math.random() * CREW.length)];
          coach?.play(moves[Math.floor(Math.random() * moves.length)]);
        }, IDLE_GREET_EVERY_MS);
    return () => {
      greets.forEach(clearTimeout);
      clearInterval(idle);
    };
  }, [settled, reduceMotion]);

  const washStyle = useAnimatedStyle(() => ({ opacity: 1 - washOut.value }));
  const rowStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -width * 0.3 * crewUp.value },
      { scale: 1 + 0.06 * crewUp.value },
    ],
  }));
  const slotStyle = useAnimatedStyle(() => ({
    opacity: crewIn.value,
    transform: [{ translateY: slotHeight * 0.1 * (1 - crewIn.value) }],
  }));
  const floorStyle = useAnimatedStyle(() => ({
    opacity: crewUp.value,
    transform: [{ translateY: -width * 0.3 * crewUp.value }],
  }));
  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkIn.value,
    transform: [
      { translateY: wordmarkSize * 0.3 * (1 - wordmarkIn.value) - width * 0.83 * wordmarkUp.value },
      { scale: 1 + 0.45 * wordmarkUp.value },
    ],
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineIn.value,
    transform: [{ translateY: 14 * (1 - taglineIn.value) }],
  }));
  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsIn.value,
    transform: [{ translateY: 40 * (1 - buttonsIn.value) }],
  }));

  return (
    <Pressable
      style={styles.screen}
      onPress={crewReady && !settled ? settle : undefined}
      accessible={false}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.wash, washStyle]}>
        {[1, 2, 3]
          .filter((i) => i <= wipes)
          .map((i) => (
            <Wipe
              key={i}
              color={coachColors[CREW[i]].wash}
              size={width * 4.2}
              x={rowLeft + slotLeft(i) + slotWidth / 2}
              y={rowTop + slotHeight * 0.55}
            />
          ))}
      </Animated.View>

      <Animated.View
        style={[styles.floor, { top: height * 0.49, height: width * 0.05 }, floorStyle]}
      />

      <Animated.View
        style={[{ position: 'absolute', left: rowLeft, width: rowWidth, top: rowTop }, rowStyle]}>
        {CREW.map((name, i) => (
          <Animated.View
            key={name}
            style={[
              { position: 'absolute', left: slotLeft(i), width: slotWidth, height: slotHeight },
              slotStyle,
            ]}>
            <Coach
              name={name}
              ref={(coach) => {
                coaches.current[i] = coach;
              }}
              onReady={() =>
                setReadyCoaches((ready) => (ready.includes(name) ? ready : [...ready, name]))
              }
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        ))}
      </Animated.View>

      <Animated.Text
        style={[
          styles.wordmark,
          {
            bottom: height * 0.09,
            fontSize: wordmarkSize,
            letterSpacing: -0.045 * wordmarkSize,
            color: ink,
          },
          wordmarkStyle,
        ]}>
        muvlet
      </Animated.Text>

      <Animated.Text style={[styles.tagline, { top: height * 0.575 }, taglineStyle]}>
        Your friendly gym crew
      </Animated.Text>

      <Animated.View
        pointerEvents={settled ? 'auto' : 'none'}
        style={[styles.buttons, { bottom: 34 + insets.bottom }, buttonsStyle]}>
        <Button title="Get started" onPress={() => router.replace('/today')} />
        <Button
          title="I already have an account"
          variant="secondary"
          onPress={() => router.replace('/today')}
        />
      </Animated.View>
    </Pressable>
  );
}

/** A coach-coloured circle that grows from the coach until it covers the screen. */
function Wipe({ color, size, x, y }: { color: string; size: number; x: number; y: number }) {
  const grow = useSharedValue(0);

  useEffect(() => {
    grow.value = withTiming(1, { duration: 520, easing: wipeEase });
  }, [grow]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: grow.value }] }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  wash: {
    overflow: 'hidden',
    backgroundColor: coachColors.rex.wash,
  },
  // A soft glow under the crew like the mockup: primary at 14% (hex 24), fading to clear.
  floor: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    experimental_backgroundImage:
      `radial-gradient(closest-side, ${colors.primary}24, ${colors.primary}00)`,
  },
  wordmark: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: fonts.headingHeavy,
  },
  tagline: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: colors.textMuted,
  },
  buttons: {
    position: 'absolute',
    left: 20,
    right: 20,
    gap: spacing.sm,
  },
});
