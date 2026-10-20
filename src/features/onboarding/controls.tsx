import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

/* The answer controls on the question steps, styled like the mockup. */

/** A coach's colours: `ink` for picked answers, `wash` behind them, `shade` for their text. */
export type Tint = { ink: string; shade: string; wash: string };

export function Section({
  label,
  hint,
  warn,
  children,
}: {
  label?: string;
  hint?: string;
  warn?: boolean;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {children}
      {hint ? <Text style={[styles.hint, warn && styles.warn]}>{hint}</Text> : null}
    </View>
  );
}

export type Option<T extends string> = {
  value: T;
  icon: (color: string) => ReactNode;
  /** Colours for this option when picked; defaults to the step's. */
  tint?: Tint;
};

/** Big rows with an icon, one of which can be picked. */
export function OptionRows<T extends string>({
  options,
  value,
  tint,
  onChange,
}: {
  options: Option<T>[];
  value: T | null;
  tint: Tint;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.rows}>
      {options.map((option) => {
        const on = option.value === value;
        const own = option.tint ?? tint;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.row,
              on && { borderColor: own.ink, backgroundColor: own.wash },
              pressed && styles.pressed,
            ]}>
            <View style={[styles.rowIcon, { backgroundColor: own.wash }]}>
              {option.icon(own.ink)}
            </View>
            <Text style={styles.rowLabel}>{option.value}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** A pill-shaped switch between a few choices. */
export function Segmented<T extends string | number>({
  options,
  value,
  tint,
  suffix = '',
  onChange,
}: {
  options: T[];
  value: T | null;
  tint: Tint;
  suffix?: string;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const on = option === value;
        return (
          <Pressable
            key={option}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(option)}
            style={[styles.segment, on && styles.segmentOn]}>
            <Text style={[styles.segmentLabel, on && { color: tint.shade }]}>
              {option}
              {suffix}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Wrapping chips; any number can be picked. */
export function Chips({
  options,
  value,
  tint,
  onToggle,
}: {
  options: string[];
  value: string[];
  tint: Tint;
  onToggle: (option: string) => void;
}) {
  return (
    <View style={styles.chips}>
      {options.map((option) => {
        const on = value.includes(option);
        return (
          <Pressable
            key={option}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
            onPress={() => onToggle(option)}
            style={({ pressed }) => [
              styles.chip,
              on && { borderColor: tint.ink, backgroundColor: tint.wash },
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.chipLabel, on && { color: tint.shade }]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/** A row of seven day circles, Sunday first. */
export function DayPicker({
  value,
  tint,
  onToggle,
}: {
  value: number[];
  tint: Tint;
  onToggle: (day: number) => void;
}) {
  return (
    <View style={styles.days}>
      {DAY_LETTERS.map((letter, day) => {
        const on = value.includes(day);
        return (
          <Pressable
            key={day}
            accessibilityRole="checkbox"
            accessibilityLabel={DAY_NAMES[day]}
            accessibilityState={{ checked: on }}
            onPress={() => onToggle(day)}
            style={({ pressed }) => [
              styles.day,
              on && { backgroundColor: tint.ink, borderColor: tint.ink },
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.dayLabel, on && styles.dayLabelOn]}>{letter}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** A labelled row with − and + buttons around its value. */
export function Stepper({
  label,
  value,
  tint,
  onStep,
}: {
  label: string;
  value: string;
  tint: Tint;
  onStep: (by: 1 | -1) => void;
}) {
  return (
    <View style={styles.stepper}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <StepButton
          sign="−"
          label={`Less ${label.toLowerCase()}`}
          tint={tint}
          onPress={() => onStep(-1)}
        />
        <Text style={styles.stepperValue}>{value}</Text>
        <StepButton
          sign="+"
          label={`More ${label.toLowerCase()}`}
          tint={tint}
          onPress={() => onStep(1)}
        />
      </View>
    </View>
  );
}

function StepButton({
  sign,
  label,
  tint,
  onPress,
}: {
  sign: string;
  label: string;
  tint: Tint;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.stepperButton, { backgroundColor: tint.wash }]}>
      <Text style={[styles.stepperSign, { color: tint.shade }]}>{sign}</Text>
    </Pressable>
  );
}

/** A quiet text button under the main one, e.g. "Not now". */
export function TextButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.textButton}>
      <Text style={styles.textButtonLabel}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  label: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 12,
    letterSpacing: 0.96,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  hint: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  warn: {
    color: colors.danger,
  },
  pressed: {
    transform: [{ translateY: 3 }],
  },
  rows: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontFamily: fonts.bodyExtraBold,
    fontSize: 18,
    color: colors.text,
  },
  segmented: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 999,
  },
  segmentOn: {
    backgroundColor: colors.surface,
    boxShadow: '0 2px 6px -2px rgba(30, 40, 80, 0.18)',
  },
  segmentLabel: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 14,
    color: colors.textMuted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipLabel: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 14,
    color: colors.textMuted,
  },
  days: {
    flexDirection: 'row',
    gap: 6,
  },
  day: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dayLabel: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 15,
    color: colors.textMuted,
  },
  dayLabelOn: {
    color: colors.onPrimary,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingLeft: 16,
    paddingRight: 12,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.border,
  },
  stepperLabel: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 16,
    color: colors.text,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperSign: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 20,
    lineHeight: 22,
  },
  stepperValue: {
    minWidth: 66,
    textAlign: 'center',
    fontFamily: fonts.bodyExtraBold,
    fontSize: 17,
    fontVariant: ['tabular-nums'],
    color: colors.text,
  },
  textButton: {
    alignSelf: 'center',
    padding: 8,
  },
  textButtonLabel: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 16,
    color: colors.textMuted,
  },
});
