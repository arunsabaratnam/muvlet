import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  Keyframe,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { coachColors, colors, fonts, levelColors } from '@/constants/theme';
import { withCommas } from '@/features/onboarding/plan';

import { levelFor } from './day';

const EASE = Easing.bezier(0.22, 1, 0.36, 1);
// A slight overshoot, so the bar settles like it was filled.
const SPRINGY = Easing.bezier(0.34, 1.56, 0.64, 1);

// "+200" rises over the card and fades.
const RISE = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: 10 }, { scale: 0.85 }] },
  22: { opacity: 1, transform: [{ translateY: 0 }, { scale: 1.08 }] },
  100: { opacity: 0, transform: [{ translateY: -28 }, { scale: 1 }] },
}).duration(1200);

const SPARK_COLORS = [
  coachColors.rex.ink,
  coachColors.axel.ink,
  coachColors.sage.ink,
  coachColors.luna.ink,
  colors.warning,
];

type LevelCardProps = {
  points: number;
  /** What gets you to the next level. */
  hint?: string;
  /** Purple for a moment when points land. */
  hot?: boolean;
  /** The points just earned; a new `key` floats them up again. */
  gain?: { amount: number; key: number };
};

export function LevelCard({ points, hint, hot = false, gain }: LevelCardProps) {
  const reduceMotion = useReducedMotion();
  const level = levelFor(points);
  const share = level.to ? (points - level.from) / (level.to - level.from) : 1;
  const total = level.to ? `${withCommas(points)} / ${withCommas(level.to)}` : withCommas(points);

  const fill = useSharedValue(share);
  const heat = useSharedValue(hot ? 1 : 0);
  const pop = useSharedValue(1);
  const burst = useSharedValue(0);

  useEffect(() => {
    fill.value = reduceMotion ? share : withTiming(share, { duration: 900, easing: SPRINGY });
  }, [share, reduceMotion, fill]);

  useEffect(() => {
    heat.value = withTiming(hot ? 1 : 0, { duration: 500, easing: EASE });
  }, [hot, heat]);

  // A new level pops the badge and throws sparks out of it.
  const lastLevel = useRef(level.number);
  useEffect(() => {
    if (level.number <= lastLevel.current) {
      lastLevel.current = level.number;
      return;
    }
    lastLevel.current = level.number;
    if (reduceMotion) return;
    pop.value = withSequence(
      withTiming(0.6, { duration: 0 }),
      withTiming(1.28, { duration: 500, easing: EASE }),
      withTiming(1, { duration: 400, easing: EASE }),
    );
    burst.value = 0;
    burst.value = withTiming(1, { duration: 950, easing: EASE });
  }, [level.number, reduceMotion, pop, burst]);

  const cardStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(heat.value, [0, 1], [colors.surface, levelColors.fill]),
    borderColor: interpolateColor(heat.value, [0, 1], [colors.border, levelColors.fill]),
    borderBottomColor: interpolateColor(heat.value, [0, 1], [colors.border, levelColors.shade]),
  }));
  const badgeStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(heat.value, [0, 1], [levelColors.fill, levelColors.glass]),
    transform: [{ scale: pop.value }],
  }));
  const nameStyle = useAnimatedStyle(() => ({
    color: interpolateColor(heat.value, [0, 1], [colors.text, colors.onPrimary]),
  }));
  const mutedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(heat.value, [0, 1], [colors.textMuted, colors.onPrimary]),
  }));
  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(heat.value, [0, 1], [levelColors.track, levelColors.glass]),
  }));
  const fillStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%`,
    backgroundColor: interpolateColor(heat.value, [0, 1], [levelColors.fill, colors.onPrimary]),
  }));

  return (
    <View>
      <Animated.View
        accessible
        accessibilityLabel={`Level ${level.number}, ${level.name}, ${total} points. ${hint ?? ''}`}
        style={[styles.card, cardStyle]}>
        <View>
          <Animated.View style={[styles.badge, badgeStyle]}>
            <Text style={styles.number}>{level.number}</Text>
          </Animated.View>
          {Array.from({ length: SPARKS }, (_, i) => (
            <Spark key={i} index={i} burst={burst} />
          ))}
        </View>
        <View style={styles.info}>
          <View style={styles.top}>
            <Animated.Text style={[styles.name, nameStyle]}>{level.name}</Animated.Text>
            <Animated.Text style={[styles.points, mutedStyle]}>{total}</Animated.Text>
          </View>
          <Animated.View style={[styles.track, trackStyle]}>
            <Animated.View style={[styles.fill, fillStyle]} />
          </Animated.View>
          {hint ? <Animated.Text style={[styles.hint, mutedStyle]}>{hint}</Animated.Text> : null}
        </View>
      </Animated.View>
      {gain && !reduceMotion ? (
        <Animated.Text key={gain.key} entering={RISE} style={styles.gain}>
          {`+${gain.amount}`}
        </Animated.Text>
      ) : null}
    </View>
  );
}

const SPARKS = 14;

/** One of the sparks thrown out of the badge on a level up. */
function Spark({ index, burst }: { index: number; burst: SharedValue<number> }) {
  const angle = (index / SPARKS) * Math.PI * 2;
  const distance = 34 + ((index * 7) % 26);
  const style = useAnimatedStyle(() => ({
    opacity: burst.value > 0 && burst.value < 1 ? 1 - burst.value : 0,
    transform: [
      { translateX: Math.cos(angle) * distance * burst.value },
      { translateY: Math.sin(angle) * distance * burst.value },
      { scale: 1 - burst.value * 0.7 },
    ],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.spark, { backgroundColor: SPARK_COLORS[index % SPARK_COLORS.length] }, style]}
    />
  );
}

const styles = StyleSheet.create({
  // A 2px border with a 4px ledge underneath, like the mockup.
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 2,
    borderBottomWidth: 6,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontFamily: fonts.headingHeavy,
    fontSize: 18,
    color: colors.onPrimary,
  },
  spark: {
    position: 'absolute',
    top: 13,
    left: 13,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  info: {
    flex: 1,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  name: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 16,
    lineHeight: 23,
  },
  points: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 7,
    marginTop: 6,
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 99,
  },
  hint: {
    marginTop: 10,
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    lineHeight: 18,
  },
  gain: {
    position: 'absolute',
    top: -10,
    right: 60,
    fontFamily: fonts.headingHeavy,
    fontSize: 20,
    color: levelColors.fill,
  },
});
