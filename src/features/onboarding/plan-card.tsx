import { StyleSheet, Text, View } from 'react-native';

import { coachColors, colors, fonts } from '@/constants/theme';
import type { CoachName } from '@/features/welcome/coach';

import { DAY_LETTERS, DAY_NAMES } from './controls';
import { withCommas, type DayKind, type Plan } from './plan';

const DAY_COLORS: Record<DayKind, { fill: string; text: string }> = {
  workout: { fill: coachColors.rex.ink, text: colors.onPrimary },
  stretch: { fill: coachColors.luna.wash, text: coachColors.luna.shade },
  rest: { fill: colors.surfaceMuted, text: colors.textFaint },
};

/** The plan built from the answers: in full on Plan ready, just its week on Save your plan. */
export function PlanCard({ plan, mini = false }: { plan: Plan; mini?: boolean }) {
  const workouts = plan.week.filter((day) => day.kind === 'workout').length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{plan.title}</Text>
        <View style={styles.level}>
          <Text style={styles.levelLabel}>Level 1</Text>
        </View>
      </View>
      {mini ? null : (
        <View style={styles.tiles}>
          <Tile coach="rex" value={`${workouts} days`} label="a week" />
          <Tile coach="axel" value={`${plan.minutes} min`} label="per session" />
          {plan.calories && plan.protein ? (
            <>
              <Tile coach="sage" value={withCommas(plan.calories)} label="calories a day" />
              <Tile coach="sage" value={`${plan.protein} g`} label="protein a day" />
            </>
          ) : (
            <Tile
              coach="sage"
              value="Food targets"
              label="Sage sets these once you add your height and weight"
              wide
            />
          )}
        </View>
      )}
      <View style={styles.week}>
        {plan.week.map((day, i) => (
          <View
            key={DAY_NAMES[i]}
            accessible
            accessibilityLabel={`${DAY_NAMES[i]}: ${day.label}`}
            style={styles.day}>
            <View style={[styles.dayPill, { backgroundColor: DAY_COLORS[day.kind].fill }]}>
              <Text style={[styles.dayKind, { color: DAY_COLORS[day.kind].text }]}>
                {day.label}
              </Text>
            </View>
            <Text style={styles.dayLetter}>{DAY_LETTERS[i]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Tile({
  coach,
  value,
  label,
  wide,
}: {
  coach: CoachName;
  value: string;
  label: string;
  wide?: boolean;
}) {
  return (
    <View style={[styles.tile, wide && styles.wide, { backgroundColor: coachColors[coach].wash }]}>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    padding: 17,
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flexShrink: 1,
    fontFamily: fonts.headingHeavy,
    fontSize: 22,
    color: colors.text,
  },
  level: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: coachColors.rex.wash,
  },
  levelLabel: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 12,
    color: coachColors.rex.shade,
  },
  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  tile: {
    flexBasis: '40%',
    flexGrow: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  wide: {
    flexBasis: '100%',
  },
  tileValue: {
    fontFamily: fonts.headingHeavy,
    fontSize: 20,
    color: colors.text,
  },
  tileLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: colors.textMuted,
  },
  week: {
    flexDirection: 'row',
    gap: 5,
  },
  day: {
    flex: 1,
    gap: 5,
    alignItems: 'stretch',
  },
  dayPill: {
    minHeight: 35,
    paddingVertical: 9,
    paddingHorizontal: 1,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayKind: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 10,
    lineHeight: 11.5,
    textAlign: 'center',
  },
  dayLetter: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 12,
    textAlign: 'center',
    color: colors.textMuted,
  },
});
