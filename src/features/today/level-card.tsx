import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, levelColors } from '@/constants/theme';
import { withCommas } from '@/features/onboarding/plan';

import { levelFor } from './day';

type LevelCardProps = {
  points: number;
  /** What gets you to the next level. */
  hint?: string;
};

export function LevelCard({ points, hint }: LevelCardProps) {
  const level = levelFor(points);
  const share = level.to ? (points - level.from) / (level.to - level.from) : 1;
  const total = level.to ? `${withCommas(points)} / ${withCommas(level.to)}` : withCommas(points);

  return (
    <View
      accessible
      accessibilityLabel={`Level ${level.number}, ${level.name}, ${total} points. ${hint ?? ''}`}
      style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.number}>{level.number}</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.top}>
          <Text style={styles.name}>{level.name}</Text>
          <Text style={styles.points}>{total}</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${share * 100}%` }]} />
        </View>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
    </View>
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
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: levelColors.fill,
  },
  number: {
    fontFamily: fonts.headingHeavy,
    fontSize: 18,
    color: colors.onPrimary,
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
    color: colors.text,
  },
  points: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 13,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 7,
    marginTop: 6,
    borderRadius: 99,
    overflow: 'hidden',
    backgroundColor: levelColors.track,
  },
  fill: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: levelColors.fill,
  },
  hint: {
    marginTop: 10,
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
