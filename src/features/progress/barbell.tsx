import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, plateColors } from '@/constants/theme';

import { platesFor, THICKNESS, type Metal } from './plates';

const PLATE_HEIGHT = 88;
const PLATE_GAP = 2;
// The bar's ends, collars and the least bar to show between them.
const FIXED = 10 * 2 + 6 * 2 + 30;

/**
 * Your barbell, loaded with a plate a side for every level you've reached. On a narrow
 * screen near the top of the ladder, the plates get thinner so the bar still fits.
 */
export function Barbell({ level }: { level: number }) {
  const plates = platesFor(level);
  const [width, setWidth] = useState(0);
  // Only the plates get thinner; the gaps between them stay.
  const thick = plates.reduce((sum, metal) => sum + THICKNESS[metal], 0);
  const room = width - FIXED - 2 * plates.length * PLATE_GAP;
  const squeeze = width && thick ? Math.max(0, Math.min(1, room / (2 * thick))) : 1;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={
        plates.length
          ? `A barbell with ${plates.length} ${plates.length === 1 ? 'plate' : 'plates'} a side`
          : 'An empty barbell'
      }
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <View style={styles.bar}>
        <View style={[styles.end, styles.endLeft]} />
        {[...plates].reverse().map((metal, index) => (
          <Plate key={`l${index}`} metal={metal} squeeze={squeeze} />
        ))}
        <View style={styles.collar} />
        <View style={styles.shaft} />
        <View style={styles.collar} />
        {plates.map((metal, index) => (
          <Plate key={`r${index}`} metal={metal} squeeze={squeeze} />
        ))}
        <View style={[styles.end, styles.endRight]} />
      </View>
      <View style={styles.floor} />
    </View>
  );
}

function Plate({ metal, squeeze }: { metal: Metal; squeeze: number }) {
  return (
    <View
      testID="plate"
      style={[
        styles.plate,
        { width: THICKNESS[metal] * squeeze, backgroundColor: plateColors[metal] },
      ]}>
      <View style={styles.shine} />
      <View style={styles.shadow} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 96,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  end: {
    width: 10,
    height: 12,
    backgroundColor: plateColors.end,
  },
  endLeft: {
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  endRight: {
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  plate: {
    height: PLATE_HEIGHT,
    marginHorizontal: PLATE_GAP / 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  shine: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  shadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  collar: {
    width: 6,
    height: 26,
    borderRadius: 2,
    backgroundColor: plateColors.collar,
  },
  shaft: {
    flex: 1,
    minWidth: 30,
    height: 6,
    backgroundColor: plateColors.bar,
  },
  floor: {
    height: 6,
    marginHorizontal: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
});
