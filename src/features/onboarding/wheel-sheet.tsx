import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Button } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';

import type { Tint } from './controls';
import { BottomSheet } from './sheet';

/* A bottom sheet with a scroll wheel, for picking one value from a long list in one flick. */

/** Height of one row on the wheel. */
export const WHEEL_ROW = 48;
// Rows showing at once; the middle one is the pick.
const VISIBLE = 5;
const PAD = WHEEL_ROW * Math.floor(VISIBLE / 2);
// Rows either side of the value drawn on the first frame.
const NEAR = 10;

type SheetProps = {
  title: string;
  /** What the wheel picks, for screen readers, e.g. "Weight". */
  label: string;
  options: string[];
  index: number;
  tint: Tint;
  /** Shown beside the title, e.g. a units switch. */
  header?: ReactNode;
  onChange: (index: number) => void;
  onClose: () => void;
};

export function WheelSheet({
  visible,
  title,
  label,
  options,
  index,
  tint,
  header,
  onChange,
  onClose,
}: SheetProps & { visible: boolean }) {
  return (
    <BottomSheet visible={visible} title={title} header={header} onClose={onClose}>
      <Wheel
        // A fresh wheel for each list (another picker, or the units switched), so it
        // starts on the current value.
        key={`${label}:${options[0]}`}
        label={label}
        options={options}
        index={index}
        tint={tint}
        onChange={onChange}
      />
      <Button title="Done" color={tint} onPress={onClose} />
    </BottomSheet>
  );
}

function Wheel({
  label,
  options,
  index,
  tint,
  onChange,
}: {
  label: string;
  options: string[];
  index: number;
  tint: Tint;
  onChange: (index: number) => void;
}) {
  const scroller = useRef<ScrollView>(null);
  // The row the wheel is resting on, so a pick from outside (a row tap, a screen
  // reader) scrolls it there, but one the wheel settled on itself doesn't.
  const resting = useRef(index);
  const placed = useRef(false);
  // The first frame draws only the rows around the value, so the sheet opens at once; the rest
  // fill in on the next frame. Spacers keep the full height, so nothing moves.
  const [allRows, setAllRows] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setAllRows(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const first = allRows ? 0 : Math.max(0, index - NEAR);
  const last = allRows ? options.length : Math.min(options.length, index + NEAR + 1);

  useEffect(() => {
    if (index === resting.current) return;
    resting.current = index;
    scroller.current?.scrollTo({ y: index * WHEEL_ROW, animated: true });
  }, [index]);

  const settle = (y: number) => {
    const next = Math.min(options.length - 1, Math.max(0, Math.round(y / WHEEL_ROW)));
    resting.current = next;
    if (next !== index) onChange(next);
  };

  // A flick is picked once it stops; a slow drag when it's let go.
  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) =>
    settle(event.nativeEvent.contentOffset.y);
  const onScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (Math.abs(event.nativeEvent.velocity?.y ?? 0) < 0.05) {
      settle(event.nativeEvent.contentOffset.y);
    }
  };

  const step = (by: number) => {
    const next = index + by;
    if (next >= 0 && next < options.length) onChange(next);
  };

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: options[index] }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) => step(event.nativeEvent.actionName === 'increment' ? 1 : -1)}
      style={styles.wheel}>
      <View
        pointerEvents="none"
        style={[styles.band, { backgroundColor: tint.wash, borderColor: tint.ink }]}
      />
      {/* A plain scroller with every row, and nothing that runs while it moves, so it glides. */}
      <ScrollView
        ref={scroller}
        testID="wheel"
        contentOffset={{ x: 0, y: index * WHEEL_ROW }}
        // In case contentOffset is ignored (some Android versions), place it once it's laid out.
        onContentSizeChange={() => {
          if (placed.current) return;
          placed.current = true;
          scroller.current?.scrollTo({ y: resting.current * WHEEL_ROW, animated: false });
        }}
        contentContainerStyle={styles.wheelContent}
        snapToInterval={WHEEL_ROW}
        decelerationRate="normal"
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollEndDrag={onScrollEndDrag}>
        {/* One touchable for every row: a tap jumps to the row under the finger. */}
        <Pressable
          testID="wheel-rows"
          onPress={(event) => {
            const row = Math.floor(event.nativeEvent.locationY / WHEEL_ROW);
            if (row >= 0 && row < options.length && row !== index) onChange(row);
          }}>
          <View style={{ height: first * WHEEL_ROW }} />
          {options.slice(first, last).map((option) => (
            <Text key={option} numberOfLines={1} style={styles.row}>
              {option}
            </Text>
          ))}
          <View style={{ height: (options.length - last) * WHEEL_ROW }} />
        </Pressable>
      </ScrollView>
      <Fade edge="top" />
      <Fade edge="bottom" />
    </View>
  );
}

/** Fades the rows out towards the top or bottom edge of the wheel. */
function Fade({ edge }: { edge: 'top' | 'bottom' }) {
  const id = `wheel-fade-${edge}`;
  return (
    <View pointerEvents="none" style={[styles.fade, edge === 'top' ? styles.top : styles.bottom]}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.surface} stopOpacity={edge === 'top' ? 1 : 0} />
            <Stop offset="1" stopColor={colors.surface} stopOpacity={edge === 'top' ? 0 : 1} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wheel: {
    height: WHEEL_ROW * VISIBLE,
  },
  band: {
    position: 'absolute',
    top: PAD,
    left: 0,
    right: 0,
    height: WHEEL_ROW,
    borderRadius: 14,
    borderWidth: 2,
  },
  wheelContent: {
    paddingVertical: PAD,
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: PAD,
  },
  top: {
    top: 0,
  },
  bottom: {
    bottom: 0,
  },
  row: {
    height: WHEEL_ROW,
    lineHeight: WHEEL_ROW,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: fonts.headingHeavy,
    fontSize: 26,
    fontVariant: ['tabular-nums'],
    color: colors.text,
  },
});
