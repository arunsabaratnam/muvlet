import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { coachColors, colors, fonts } from '@/constants/theme';

import { CoachStill } from './coach-face';
import type { Read } from './day';

/** Two short reads from the coaches about today. They don't open anything yet. */
export function ForYou({ reads }: { reads: Read[] }) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          For you
        </Text>
        <Text style={styles.label}>About today</Text>
      </View>
      <View style={styles.cards}>
        {reads.map((read) => (
          // A new read fades in when the day moves on.
          <Animated.View key={read.title} entering={FadeIn.duration(300)} style={styles.card}>
            <View style={[styles.art, { backgroundColor: coachColors[read.coach].wash }]}>
              <CoachStill coach={read.coach} size={78} zoom={0.9} />
            </View>
            <Text style={styles.kind}>{read.kind}</Text>
            <Text style={styles.cardTitle}>{read.title}</Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 8,
    paddingHorizontal: 2,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 19,
    color: colors.text,
  },
  label: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  cards: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    gap: 4,
    paddingTop: 8,
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  art: {
    height: 84,
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderRadius: 16,
    overflow: 'hidden',
  },
  kind: {
    marginTop: 4,
    paddingHorizontal: 4,
    fontFamily: fonts.bodyExtraBold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  cardTitle: {
    paddingHorizontal: 4,
    fontFamily: fonts.heading,
    fontSize: 16,
    lineHeight: 19,
    color: colors.text,
  },
});
