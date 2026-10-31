import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Sheet } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';

import { DAYS, type DayKey } from './days';
import { Press } from './press';

type TryDaySheetProps = {
  visible: boolean;
  current: DayKey;
  onPick: (key: DayKey) => void;
  onClose: () => void;
};

/** For development: open Today on another day, like the mockup's "Try a day" list. */
export function TryDaySheet({ visible, current, onPick, onClose }: TryDaySheetProps) {
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      header={
        <View>
          <Text accessibilityRole="header" style={styles.title}>
            Try a day
          </Text>
          <Text style={styles.intro}>Each one opens Today on a different day or moment.</Text>
        </View>
      }>
      <ScrollView style={styles.list} contentContainerStyle={styles.days}>
        {Object.values(DAYS).map((day) => (
          <Press
            key={day.key}
            accessibilityRole="button"
            accessibilityState={{ selected: day.key === current }}
            onPress={() => onPick(day.key)}
            style={[styles.day, day.key === current && styles.picked]}>
            <Text style={styles.name}>{day.name}</Text>
            <Text style={styles.when}>{day.when}</Text>
          </Press>
        ))}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.text,
  },
  intro: {
    marginTop: 2,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textMuted,
  },
  list: {
    flexShrink: 1,
  },
  days: {
    gap: 6,
  },
  day: {
    gap: 1,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  picked: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(63, 109, 243, 0.08)',
  },
  name: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 14.5,
    color: colors.text,
  },
  when: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: colors.textMuted,
  },
});
