import { useEffect, useRef, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  Easing,
  SlideInDown,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';

import type { Tint } from './controls';

/* A bottom sheet with a scroll wheel, for picking one value from a long list in one flick. */

/** Height of one row on the wheel. */
export const WHEEL_ROW = 48;
// Rows showing at once; the middle one is the pick.
const VISIBLE = 5;
const PAD = WHEEL_ROW * Math.floor(VISIBLE / 2);

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
}: {
  visible: boolean;
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
}) {
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  return (
    <Modal
      transparent
      visible={visible}
      animationType={reduceMotion ? 'none' : 'fade'}
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.screen}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onClose}
          style={styles.backdrop}
        />
        <Animated.View
          accessibilityViewIsModal
          entering={
            reduceMotion
              ? undefined
              : SlideInDown.duration(380).easing(Easing.bezier(0.22, 1, 0.36, 1))
          }
          style={[styles.sheet, { paddingBottom: 34 + insets.bottom }]}>
          <View style={styles.grabber} />
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>
              {title}
            </Text>
            {header}
          </View>
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
        </Animated.View>
      </View>
    </Modal>
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
  const list = useRef<FlatList<string>>(null);
  const scrollY = useSharedValue(index * WHEEL_ROW);
  // The row the wheel is resting on, so a pick from outside (a row tap, a screen
  // reader) scrolls it there, but one the wheel settled on itself doesn't.
  const resting = useRef(index);

  useEffect(() => {
    if (index === resting.current) return;
    resting.current = index;
    list.current?.scrollToOffset({ offset: index * WHEEL_ROW, animated: true });
  }, [index]);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

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
      <Animated.FlatList
        ref={list}
        testID="wheel"
        data={options}
        keyExtractor={(option) => option}
        renderItem={({ item, index: row }) => (
          <WheelRow
            label={item}
            row={row}
            scrollY={scrollY}
            onPress={() => row !== index && onChange(row)}
          />
        )}
        getItemLayout={(_, row) => ({ length: WHEEL_ROW, offset: WHEEL_ROW * row, index: row })}
        initialScrollIndex={index}
        contentContainerStyle={styles.wheelContent}
        snapToInterval={WHEEL_ROW}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollEndDrag={onScrollEndDrag}
      />
    </View>
  );
}

function WheelRow({
  label,
  row,
  scrollY,
  onPress,
}: {
  label: string;
  row: number;
  scrollY: SharedValue<number>;
  onPress: () => void;
}) {
  // Rows shrink and fade the further they sit from the middle.
  const style = useAnimatedStyle(() => {
    const away = Math.min(Math.abs(scrollY.value / WHEEL_ROW - row), 3);
    return { opacity: 1 - away * 0.3, transform: [{ scale: 1 - away * 0.12 }] };
  });
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Animated.Text numberOfLines={1} style={[styles.rowLabel, style]}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(30, 42, 58, 0.45)',
  },
  sheet: {
    gap: 16,
    paddingTop: 10,
    paddingHorizontal: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.surface,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 44,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.text,
  },
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
  row: {
    height: WHEEL_ROW,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontFamily: fonts.headingHeavy,
    fontSize: 26,
    fontVariant: ['tabular-nums'],
    color: colors.text,
  },
});
