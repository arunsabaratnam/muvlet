import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { coachColors, fonts, skyColors } from '@/constants/theme';
import { Coach, type CoachHandle, type CoachName } from '@/features/welcome/coach';

import type { SkyPhase } from './day';

/*
 * The flat sky at the top of Today (mockup v42): one colour for the time of day, a sun or
 * moon, two hills, and the coach who owns the next step. The date and greeting sit in the sky
 * in a colour taken from it.
 */

const HEIGHT = 138;
// The art is drawn 370 wide like the mockup and scaled to fill, keeping the hills at the bottom.
const WIDTH = 370;
const FAR_HILL = 'M0 106C60 92 132 92 204 102S318 98 370 88V138H0Z';
const NEAR_HILL = 'M0 124C78 112 168 116 236 122S330 112 370 108V138H0Z';
const SUN: Record<SkyPhase, { x: number; y: number; r: number }> = {
  morning: { x: 284, y: 34, r: 12 },
  day: { x: 284, y: 28, r: 12 },
  sunset: { x: 232, y: 100, r: 20 },
  night: { x: 284, y: 28, r: 12 },
};
const STARS = [
  [232, 64],
  [178, 84],
  [120, 88],
  [292, 18],
  [34, 90],
];

type SkyProps = {
  phase: SkyPhase;
  date: string;
  greeting: string;
  /** The letter in the avatar circle. */
  initial: string;
  coach: CoachName;
};

export function Sky({ phase, date, greeting, initial, coach }: SkyProps) {
  const ink = skyColors[phase];
  // When the time of day changes, the new sky fades in over the old one.
  const [layers, setLayers] = useState({ under: phase, over: phase });
  if (layers.over !== phase) setLayers({ under: layers.over, over: phase });

  return (
    <View style={styles.sky}>
      <SkyArt phase={layers.under} />
      <Animated.View
        key={layers.over}
        entering={FadeIn.duration(800)}
        style={StyleSheet.absoluteFill}>
        <SkyArt phase={layers.over} />
      </Animated.View>
      <View style={styles.greeting}>
        <Text style={[styles.date, { color: ink.inkSoft }]}>{date}</Text>
        <Text accessibilityRole="header" style={[styles.hello, { color: ink.ink }]}>
          {greeting}
        </Text>
      </View>
      <View style={styles.avatar}>
        <Text style={styles.initial}>{initial}</Text>
      </View>
      <Animated.View key={coach} entering={FadeIn.duration(400)} style={styles.coach}>
        <SkyCoach name={coach} />
      </Animated.View>
    </View>
  );
}

function SkyArt({ phase }: { phase: SkyPhase }) {
  const colors = skyColors[phase];
  const sun = SUN[phase];
  const night = phase === 'night';
  return (
    <Svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMax slice"
      style={StyleSheet.absoluteFill}>
      <Rect width={WIDTH} height={HEIGHT} fill={colors.sky} />
      {night &&
        STARS.map(([x, y]) => (
          <Circle key={x} cx={x} cy={y} r={1.5} fill="#FFFFFF" opacity={0.8} />
        ))}
      <Circle cx={sun.x} cy={sun.y} r={sun.r} fill={colors.sun} />
      {/* The moon is a crescent: a circle of sky over the right of it. */}
      {night && <Circle cx={sun.x + 7} cy={sun.y - 5} r={sun.r - 2} fill={colors.sky} />}
      <Path d={FAR_HILL} fill={colors.far} />
      <Path d={NEAR_HILL} fill={colors.near} />
    </Svg>
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
  sky: {
    height: HEIGHT,
    overflow: 'hidden',
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
  // The coach's artboard is 200 × 190.
  coach: {
    position: 'absolute',
    right: 22,
    bottom: 13,
    width: 80,
    height: 76,
  },
});
