import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  measure,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type AnimatedRef,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { colors, fonts } from '@/constants/theme';

import { workoutOf, type Step } from './day';
import { Play } from './icons';
import { Press } from './press';

// Shows once the workout card is almost off the top, or still far down below.
const PAST_TOP = 60;
const BELOW_BOTTOM = 150;

const FADE = { duration: 220, easing: Easing.bezier(0.22, 1, 0.36, 1) };
// A slight overshoot, so it lands like it was dropped in.
const LIFT = { duration: 400, easing: Easing.bezier(0.34, 1.56, 0.64, 1) };

type FloatingStartProps = {
  workout: Step;
  /** The big workout card is on Today and nothing covers it. */
  live: boolean;
  scrollRef: AnimatedRef;
  /** How far Today is scrolled. */
  offset: SharedValue<number>;
  cardRef: AnimatedRef;
  /** Set while it shows, so the Ask pill makes room. */
  showing: SharedValue<boolean>;
  onStart: (step: Step) => void;
};

/** A Start button that floats over Today while the workout card is scrolled out of sight. */
export function FloatingStart({
  workout,
  live,
  scrollRef,
  offset,
  cardRef,
  showing,
  onStart,
}: FloatingStartProps) {
  const reduceMotion = useReducedMotion();
  const fade = useSharedValue(0);
  const lift = useSharedValue(0);
  const [shown, setShown] = useState(false);

  // Checked on the UI thread as Today scrolls, so it keeps up with the finger.
  useAnimatedReaction(
    () => {
      offset.get();
      if (!live) return false;
      const card = measure(cardRef);
      const view = measure(scrollRef);
      if (!card || !view) return false;
      return (
        card.pageY + card.height < view.pageY + PAST_TOP ||
        card.pageY > view.pageY + view.height - BELOW_BOTTOM
      );
    },
    (on, was) => {
      if (on === was) return;
      fade.set(reduceMotion ? Number(on) : withTiming(Number(on), FADE));
      lift.set(reduceMotion ? Number(on) : withTiming(Number(on), LIFT));
      showing.set(on);
      scheduleOnRN(setShown, on);
    },
    [live, reduceMotion],
  );

  const style = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateY: (1 - lift.value) * 14 }, { scale: 0.96 + lift.value * 0.04 }],
  }));

  return (
    <Animated.View
      pointerEvents={shown ? 'box-none' : 'none'}
      accessibilityElementsHidden={!shown}
      importantForAccessibility={shown ? 'auto' : 'no-hide-descendants'}
      style={[styles.float, style]}>
      <Press
        accessibilityRole="button"
        accessibilityLabel={`Start ${workout.title}`}
        onPress={() => onStart(workout)}
        style={styles.pill}>
        <View style={styles.play}>
          <Play size={14} color={colors.primary} />
        </View>
        <Text numberOfLines={1} style={styles.label}>{`Start ${workout.title}`}</Text>
        <Text style={styles.time}>{`${workoutOf(workout).minutes} min`}</Text>
      </Press>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Beside the Ask pill, which shrinks to make room.
  float: {
    position: 'absolute',
    left: 16,
    right: 74,
    bottom: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 46,
    paddingLeft: 6,
    paddingRight: 16,
    borderRadius: 999,
    backgroundColor: colors.primary,
    boxShadow: '0 8px 22px rgba(63, 109, 243, 0.38)',
  },
  play: {
    width: 34,
    height: 34,
    paddingLeft: 2,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  label: {
    flex: 1,
    fontFamily: fonts.bodyExtraBold,
    fontSize: 15,
    color: colors.onPrimary,
  },
  time: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
