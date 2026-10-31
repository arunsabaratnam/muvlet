import { StyleSheet, Text, View } from 'react-native';
import Animated, { type AnimatedRef } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { colors, fonts } from '@/constants/theme';

import { CoachFace } from './coach-face';
import { WORKOUT, type Step } from './day';
import { UpArrow } from './icons';
import { Press } from './press';

type WorkoutCardProps = {
  step: Step;
  /** Measured to tell when the card has scrolled out of sight. */
  cardRef?: AnimatedRef;
  onStart: () => void;
  onPreview: () => void;
};

/** Push Day A as one big blue card when it's the open step. Tap it to see what's in it. */
export function WorkoutCard({ step, cardRef, onStart, onPreview }: WorkoutCardProps) {
  return (
    // Not flattened away on Android, so it can be measured.
    <Animated.View ref={cardRef} collapsable={false}>
      {/* The buttons inside stay their own targets for screen readers. */}
      <Press accessible={false} onPress={onPreview} style={styles.shadow}>
        <View style={styles.card}>
          <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="workout" x1="0.18" y1="0.12" x2="0.82" y2="0.88">
                <Stop offset="0" stopColor="#5B8CFF" />
                <Stop offset="0.7" stopColor={colors.primary} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#workout)" />
          </Svg>
          <View style={styles.glow} />
          <View style={styles.face}>
            <CoachFace coach={step.coach} size={72} zoom={0.75} tint="rgba(255, 255, 255, 0.2)" />
          </View>
          <Text style={styles.eyebrow}>{`Today's workout · ${WORKOUT.minutes} min`}</Text>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.focus}>{WORKOUT.focus}</Text>
          <View style={styles.chip}>
            <UpArrow size={14} color={colors.onPrimary} />
            <Text style={styles.chipText}>{WORKOUT.progress}</Text>
          </View>
          <View style={styles.buttons}>
            <Press accessibilityRole="button" onPress={onStart} style={styles.start}>
              <Text style={styles.startText}>{step.action}</Text>
            </Press>
            <Press accessibilityRole="button" onPress={onPreview} style={styles.preview}>
              <Text style={styles.previewText}>Preview</Text>
            </Press>
          </View>
        </View>
      </Press>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // The shadow sits outside the card, so the card can clip its glow.
  shadow: {
    borderRadius: 24,
    boxShadow: '0 10px 24px rgba(63, 109, 243, 0.32)',
  },
  card: {
    paddingTop: 15,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -60,
    right: -46,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
  },
  face: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  eyebrow: {
    marginBottom: 3,
    paddingRight: 84,
    fontFamily: fonts.bodyExtraBold,
    fontSize: 11.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.82)',
  },
  title: {
    paddingRight: 84,
    fontFamily: fonts.heading,
    fontSize: 23,
    lineHeight: 26,
    color: colors.onPrimary,
  },
  focus: {
    marginTop: 2,
    paddingRight: 84,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13.5,
    lineHeight: 19,
    color: 'rgba(255, 255, 255, 0.88)',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    marginTop: 10,
    paddingVertical: 4,
    paddingLeft: 7,
    paddingRight: 10,
    borderRadius: 99,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  chipText: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 12.5,
    color: colors.onPrimary,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  start: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.surface,
    boxShadow: '0 4px 0 rgba(20, 40, 120, 0.22)',
  },
  startText: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 15,
    lineHeight: 22,
    color: colors.primaryPressed,
  },
  preview: {
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  previewText: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 15,
    lineHeight: 22,
    color: colors.onPrimary,
  },
});
