import { Children, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

import { ChevronIcon, TickIcon } from './icons';

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

export type Option<T extends string | number> = {
  value: T;
  /** What the row says, when it isn't the value itself. */
  label?: string;
  icon: (color: string) => ReactNode;
  /** Colours for this option when picked; defaults to the step's. */
  tint?: Tint;
};

/** Big rows with an icon, one of which can be picked. */
export function OptionRows<T extends string | number>({
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
            <Text style={styles.rowLabel}>{option.label ?? option.value}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** One big row like OptionRows that ticks on and off, e.g. "I'm all good" above a grid. */
export function CheckRow({
  label,
  icon,
  on,
  tint,
  onPress,
}: {
  label: string;
  icon: (color: string) => ReactNode;
  on: boolean;
  tint: Tint;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        on && { borderColor: tint.ink, backgroundColor: tint.wash },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.rowIcon, { backgroundColor: on ? colors.surface : tint.wash }]}>
        {icon(tint.ink)}
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
    </Pressable>
  );
}

/** Lays tiles out three to a row; a short last row keeps the same tile width. */
export function TileGrid({ children }: { children: ReactNode }) {
  const tiles = Children.toArray(children);
  const rows = Array.from({ length: Math.ceil(tiles.length / 3) }, (_, i) =>
    tiles.slice(i * 3, i * 3 + 3),
  );
  return (
    <View style={styles.grid}>
      {rows.map((row, i) => (
        <View key={i} style={styles.gridRow}>
          {[0, 1, 2].map((cell) => (
            <View key={cell} style={styles.gridCell}>
              {row[cell]}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/** A square-ish tile in a TileGrid: an icon over a short label, ticked with a badge. */
export function Tile({
  label,
  icon,
  on,
  tint,
  count,
  dashed,
  role = 'checkbox',
  onPress,
}: {
  label: string;
  icon: ReactNode;
  on: boolean;
  tint: Tint;
  /** Shown in the badge instead of a tick, e.g. how many extras were added. */
  count?: number;
  /** A quiet dashed tile while off, for one that opens more choices. */
  dashed?: boolean;
  role?: 'checkbox' | 'button';
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityLabel={count ? `${label}, ${count} added` : undefined}
      accessibilityState={role === 'checkbox' ? { checked: on } : undefined}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        dashed && !on && styles.tileDashed,
        on && { borderColor: tint.ink, backgroundColor: tint.wash },
        pressed && styles.pressed,
      ]}>
      {on ? (
        <View style={[styles.badge, { backgroundColor: tint.ink }]}>
          {count ? (
            <Text style={styles.badgeCount}>{count}</Text>
          ) : (
            <TickIcon color={colors.onPrimary} size={11} />
          )}
        </View>
      ) : null}
      {icon}
      <Text numberOfLines={2} style={[styles.tileLabel, on && { color: tint.shade }]}>
        {label}
      </Text>
    </Pressable>
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

/** A labelled row showing its value; pressing it opens a picker for that value. */
export function PickerRow({
  label,
  value,
  tint,
  active,
  onPress,
}: {
  label: string;
  value: string;
  tint: Tint;
  /** True while its picker is open. */
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${value}`}
      accessibilityHint="Opens a picker"
      onPress={onPress}
      style={({ pressed }) => [
        styles.pickerRow,
        active && { borderColor: tint.ink, backgroundColor: tint.wash },
        pressed && styles.pressed,
      ]}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <Text style={[styles.pickerValue, { color: tint.shade }]}>{value}</Text>
      <ChevronIcon color={active ? tint.shade : colors.textMuted} />
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
    fontSize: 13,
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
  grid: {
    gap: 10,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  gridCell: {
    flex: 1,
  },
  tile: {
    minHeight: 92,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tileDashed: {
    borderStyle: 'dashed',
    borderBottomWidth: 2,
    backgroundColor: 'transparent',
  },
  tileLabel: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 13,
    lineHeight: 15,
    textAlign: 'center',
    color: colors.text,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCount: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 11,
    color: colors.onPrimary,
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
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 60,
    paddingLeft: 16,
    paddingRight: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pickerLabel: {
    flex: 1,
    fontFamily: fonts.bodyExtraBold,
    fontSize: 16,
    color: colors.text,
  },
  pickerValue: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 18,
    fontVariant: ['tabular-nums'],
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
