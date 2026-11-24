import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, workoutColors } from '@/constants/theme';

import type { Cell, weeksGrid } from './heatmap';

const GAP = 4;
const LABELS_WIDTH = 16;
const DAY_LABELS = ['M', '', 'W', '', 'F', '', 'S'];

/**
 * The last 16 weeks, one square a day, coloured by what you trained. The squares are sized
 * from the space the card gives them, so the grid fits any phone width.
 */
export function WeeksGrid({ grid }: { grid: ReturnType<typeof weeksGrid> }) {
  const [width, setWidth] = useState(0);
  const count = grid.columns.length;
  const size = width
    ? Math.floor((width - LABELS_WIDTH - GAP - (count - 1) * GAP) / count)
    : 0;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={grid.label}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {size > 0 ? (
        <View style={styles.wrap}>
          <View style={styles.months}>
            {grid.months.map(({ column, label }) => (
              <Text
                key={column}
                numberOfLines={1}
                style={[styles.month, { left: LABELS_WIDTH + GAP + column * (size + GAP) }]}>
                {label}
              </Text>
            ))}
          </View>
          <View style={styles.grid}>
            <View style={styles.days}>
              {DAY_LABELS.map((letter, index) => (
                <Text key={index} style={[styles.day, { height: size, lineHeight: size }]}>
                  {letter}
                </Text>
              ))}
            </View>
            {grid.columns.map((column, index) => (
              <View key={index} style={styles.column}>
                {column.map((cell) => (
                  <View
                    key={cell.day}
                    testID="day"
                    style={[styles.cell, { width: size, height: size }, look(cell)]}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function look(cell: Cell) {
  return {
    backgroundColor: cell.kind
      ? workoutColors[cell.kind]
      : cell.ahead
        ? workoutColors.ahead
        : workoutColors.empty,
    ...(cell.today ? { borderWidth: 2, borderColor: colors.text } : null),
  };
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  months: {
    height: 14,
  },
  month: {
    position: 'absolute',
    top: 0,
    width: 40,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    lineHeight: 14,
    color: colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    gap: GAP,
  },
  days: {
    width: LABELS_WIDTH,
    gap: GAP,
  },
  day: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.textFaint,
  },
  column: {
    gap: GAP,
  },
  cell: {
    borderRadius: 4,
  },
});
