import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  interpolate,
  Keyframe,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { coachColors, colors, fonts, skyColors } from '@/constants/theme';
import { Coach, type CoachHandle, type CoachName } from '@/features/welcome/coach';

import type { SkyPhase } from './day';

/*
 * The flat sky at the top of Today (mockup v42): one colour for the time of day, a sun or
 * moon, two hills, and the coach who owns the next step. The date and greeting sit in the sky
 * in a colour taken from it. The sky runs up behind the status bar, and its front hill is the
 * page colour, so the land rolls on into the page with no straight edge.
 */

/** How tall the sky is below the status bar. */
export const SKY_HEIGHT = 138;
const HEIGHT = SKY_HEIGHT;
// The art is drawn 370 wide like the mockup and scaled to the screen's width.
const WIDTH = 370;
const FAR_HILL = 'M0 98C60 84 132 84 204 94S318 90 370 80V138H0Z';
const NEAR_HILL = 'M0 114C78 102 168 106 236 112S330 102 370 98V138H0Z';
const GROUND = 'M0 128C64 116 150 117 222 124S326 121 370 113V138H0Z';
// Where the coach stands, in the art's units: on the green hill, just above the ground.
const COACH_RIGHT = 22;
const COACH_FEET = 19;
// The greeting and coach fade out over this much scrolling, before they reach the clock.
const FADE_BY = 40;
const SUN: Record<SkyPhase, { x: number; y: number; r: number }> = {
  morning: { x: 284, y: 34, r: 12 },
  day: { x: 284, y: 28, r: 12 },
  sunset: { x: 232, y: 100, r: 20 },
  night: { x: 284, y: 28, r: 12 },
};
const COACH_NAMES: Record<CoachName, string> = {
  rex: 'Rex',
  axel: 'Axel',
  sage: 'Sage',
  luna: 'Luna',
};
const STARS = [
  [232, 64],
  [172, 78],
  [118, 68],
  [292, 18],
  [40, 76],
];

type SkyProps = {
  phase: SkyPhase;
  date: string;
  greeting: string;
  /** The letter in the avatar circle. */
  initial: string;
  coach: CoachName;
  /** A line the coach is saying; it takes the greeting's place while it shows. */
  say?: { coach: CoachName; text: string };
  /** How far Today is scrolled. */
  offset: SharedValue<number>;
  /** Long-pressing the avatar, in development builds only. */
  onAvatarLongPress?: () => void;
};

// The coach's line grows out from beside them.
const SAY_IN = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0.9 }, { translateY: 6 }] },
  100: { opacity: 1, transform: [{ scale: 1 }, { translateY: 0 }] },
}).duration(450);

export function Sky({
  phase,
  date,
  greeting,
  initial,
  coach,
  say,
  offset,
  onAvatarLongPress,
}: SkyProps) {
  const ink = skyColors[phase];
  const insets = useSafeAreaInsets();
  const scale = useWindowDimensions().width / WIDTH;
  // When the time of day changes, the new sky fades in over the old one.
  const [layers, setLayers] = useState({ under: phase, over: phase });
  if (layers.over !== phase) setLayers({ under: layers.over, over: phase });

  const greetingShown = useSharedValue(say ? 0 : 1);
  useEffect(() => {
    greetingShown.value = withTiming(say ? 0 : 1, { duration: 450 });
  }, [say, greetingShown]);
  const greetingStyle = useAnimatedStyle(() => ({ opacity: greetingShown.value }));
  const scrollStyle = useAnimatedStyle(() => ({
    opacity: interpolate(offset.value, [0, FADE_BY], [1, 0], 'clamp'),
  }));

  return (
    <View style={[styles.sky, { height: insets.top + HEIGHT }]}>
      <SkyArt phase={layers.under} />
      <Animated.View
        key={layers.over}
        entering={FadeIn.duration(800)}
        style={StyleSheet.absoluteFill}>
        <SkyArt phase={layers.over} />
      </Animated.View>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.front, { top: insets.top }, scrollStyle]}>
        <Animated.View style={[styles.greeting, greetingStyle]}>
          <Text style={[styles.date, { color: ink.inkSoft }]}>{date}</Text>
          <Text accessibilityRole="header" style={[styles.hello, { color: ink.ink }]}>
            {greeting}
          </Text>
        </Animated.View>
        <Pressable
          accessible={!!onAvatarLongPress}
          onLongPress={onAvatarLongPress}
          style={styles.avatar}>
          <Text style={styles.initial}>{initial}</Text>
        </Pressable>
        <Animated.View
          key={coach}
          entering={FadeIn.duration(400)}
          // The art scales with the screen, so the coach's spot on the hill does too.
          style={[styles.coach, { right: COACH_RIGHT * scale, bottom: COACH_FEET * scale }]}>
          <SkyCoach name={coach} />
        </Animated.View>
        {say ? (
          <Animated.View
            key={say.text}
            entering={SAY_IN}
            exiting={FadeOut.duration(300)}
            accessibilityLiveRegion="polite"
            style={styles.bubble}>
            <Text style={styles.say}>
              <Text style={[styles.sayName, { color: coachColors[say.coach].ink }]}>
                {`${COACH_NAMES[say.coach]}: `}
              </Text>
              {say.text}
            </Text>
            <View style={styles.tail} />
          </Animated.View>
        ) : null}
      </Animated.View>
    </View>
  );
}

// The art keeps its shape at the bottom of the sky, and plain sky fills the space above it.
function SkyArt({ phase }: { phase: SkyPhase }) {
  const paint = skyColors[phase];
  const sun = SUN[phase];
  const night = phase === 'night';
  return (
    <>
      <View style={[styles.above, { backgroundColor: paint.sky }]} />
      <Svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={styles.art}>
        <Rect width={WIDTH} height={HEIGHT} fill={paint.sky} />
        {night &&
          STARS.map(([x, y]) => (
            <Circle key={x} cx={x} cy={y} r={1.5} fill="#FFFFFF" opacity={0.8} />
          ))}
        <Circle cx={sun.x} cy={sun.y} r={sun.r} fill={paint.sun} />
        {/* The moon is a crescent: a circle of sky over the right of it. */}
        {night && <Circle cx={sun.x + 7} cy={sun.y - 5} r={sun.r - 2} fill={paint.sky} />}
        <Path d={FAR_HILL} fill={paint.far} />
        <Path d={NEAR_HILL} fill={paint.near} />
        <Path d={GROUND} fill={colors.background} />
      </Svg>
    </>
  );
}

// The coach says hello when they arrive.
function SkyCoach({ name }: { name: CoachName }) {
  const coach = useRef<CoachHandle>(null);
  return (
    <Coach
      name={name}
      ref={coach}
      onReady={() => coach.current?.play('hello')}
      style={StyleSheet.absoluteFill}
    />
  );
}

const styles = StyleSheet.create({
  // The page colour shows through only below the ground.
  sky: {
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  above: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: HEIGHT / 2,
  },
  art: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    aspectRatio: WIDTH / HEIGHT,
  },
  front: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  greeting: {
    paddingTop: 28,
    paddingHorizontal: 20,
    maxWidth: 290,
  },
  date: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    lineHeight: 18,
  },
  hello: {
    fontFamily: fonts.heading,
    fontSize: 21,
    lineHeight: 23,
  },
  avatar: {
    position: 'absolute',
    top: 10,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 2px 10px rgba(30, 42, 58, 0.14)',
  },
  initial: {
    fontFamily: fonts.headingHeavy,
    fontSize: 16,
    color: coachColors.rex.ink,
  },
  bubble: {
    position: 'absolute',
    left: 16,
    bottom: 40,
    width: 222,
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    boxShadow: '0 3px 12px rgba(30, 42, 58, 0.13)',
    transformOrigin: '88% 100%',
  },
  say: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    lineHeight: 17,
    color: colors.text,
  },
  sayName: {
    fontFamily: fonts.bodyExtraBold,
  },
  // The bubble's point, towards the coach.
  tail: {
    position: 'absolute',
    right: -7,
    bottom: 14,
    width: 16,
    height: 16,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  // The coach's artboard is 200 × 190.
  coach: {
    position: 'absolute',
    width: 80,
    height: 76,
  },
});
