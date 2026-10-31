import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors, fonts, tileColors } from '@/constants/theme';

import type { WeekDay } from './day';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const RING = 2 * Math.PI * 15;
const POP = ZoomIn.springify().damping(11).stiffness(260);

type TilesProps = {
  protein: { left: number; share: number };
  week: { days: WeekDay[]; title: string; detail: string };
};

/** Protein left today, and this week's workouts with the streak. */
export function Tiles({ protein, week }: TilesProps) {
  return (
    <View style={styles.row}>
      <View
        accessible
        accessibilityLabel={`${protein.left} grams of protein left today`}
        style={[styles.tile, styles.protein]}>
        <ProteinRing share={protein.share} />
        <Text style={styles.big}>{`${protein.left} g`}</Text>
        <Text style={styles.small}>protein left</Text>
      </View>
      <View
        accessible
        accessibilityLabel={`${week.title}. ${week.detail}`}
        style={[styles.tile, styles.week]}>
        <View style={styles.weekTop}>
          <View style={styles.weekTitle}>
            <Svg width={17} height={17} viewBox="0 0 24 24">
              <Path
                d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z"
                fill={colors.warning}
              />
            </Svg>
            <Text style={styles.weekText}>{week.title}</Text>
          </View>
          <Text style={styles.small}>{week.detail}</Text>
        </View>
        <View style={styles.days}>
          {week.days.map((day, index) => (
            <View key={index} style={styles.day}>
              <View style={[styles.dot, day.state === 'planned' && styles.planned]}>
                {day.state === 'done' ? (
                  // A workout done today pops in.
                  <Animated.View entering={day.today ? POP : undefined} style={styles.done}>
                    <Svg width={11} height={11} viewBox="0 0 24 24">
                      <Path
                        d="M5 12l5 5 9-10"
                        stroke="#FFFFFF"
                        strokeWidth={3.6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </Svg>
                  </Animated.View>
                ) : day.state === 'rest' ? (
                  <View style={styles.rest} />
                ) : null}
              </View>
              <Text style={[styles.letter, day.today && styles.today]}>{day.letter}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

/** Fills as protein is eaten. */
function ProteinRing({ share }: { share: number }) {
  const reduceMotion = useReducedMotion();
  const filled = useSharedValue(share);
  useEffect(() => {
    filled.set(
      reduceMotion ? share : withTiming(share, { duration: 700, easing: Easing.out(Easing.cubic) }),
    );
  }, [share, reduceMotion, filled]);
  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: RING * (1 - filled.value),
  }));

  return (
    // Starts at the top and goes clockwise.
    <Svg width={34} height={34} viewBox="0 0 36 36" style={styles.ring}>
      <Circle cx={18} cy={18} r={15} fill="none" stroke={colors.surfaceMuted} strokeWidth={5} />
      <AnimatedCircle
        cx={18}
        cy={18}
        r={15}
        fill="none"
        stroke={tileColors.protein}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={[RING, RING]}
        animatedProps={ringProps}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  tile: {
    gap: 4,
    padding: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  // Protein takes a third, the week the rest (1 : 2.2, like the mockup).
  protein: {
    flex: 1,
  },
  week: {
    flex: 2.2,
    justifyContent: 'space-between',
    gap: 9,
  },
  ring: {
    transform: [{ rotate: '-90deg' }],
  },
  big: {
    fontFamily: fonts.headingHeavy,
    fontSize: 18,
    lineHeight: 20,
    fontVariant: ['tabular-nums'],
    color: colors.text,
  },
  small: {
    fontFamily: fonts.bodyBold,
    fontSize: 11.5,
    lineHeight: 14,
    color: colors.textMuted,
  },
  weekTop: {
    gap: 3,
  },
  weekTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  weekText: {
    flexShrink: 1,
    fontFamily: fonts.headingHeavy,
    fontSize: 17,
    lineHeight: 19,
    color: colors.text,
  },
  days: {
    flexDirection: 'row',
  },
  day: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 19,
    height: 19,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planned: {
    borderWidth: 2.5,
    borderColor: tileColors.week,
  },
  done: {
    width: 19,
    height: 19,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tileColors.week,
  },
  rest: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(102, 116, 135, 0.55)',
  },
  letter: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 6,
    overflow: 'hidden',
    fontFamily: fonts.bodyExtraBold,
    fontSize: 10.5,
    lineHeight: 12,
    color: colors.textMuted,
  },
  today: {
    backgroundColor: colors.text,
    color: colors.background,
  },
});
