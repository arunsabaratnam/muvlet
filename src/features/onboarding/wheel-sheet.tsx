import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  FadeIn,
  SlideInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { Button } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';

import type { Tint } from './controls';

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

export function WheelSheet({ visible, ...sheet }: SheetProps & { visible: boolean }) {
  return (
    <Modal
      transparent
      visible={visible}
      // The sheet does its own quick slide and fade, so nothing native stacks on top.
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={sheet.onClose}>
      {/* Gestures inside a Modal need their own root on Android. */}
      <GestureHandlerRootView style={styles.screen}>
        <Sheet {...sheet} />
      </GestureHandlerRootView>
    </Modal>
  );
}

// A drag past this share of the sheet, or a quick flick down, closes it.
const CLOSE_SHARE = 1 / 3;
const CLOSE_MIN = 80;
const CLOSE_VELOCITY = 800;

// Timings from the platforms' own sheets (React Navigation's TransitionSpecs): Material slides
// a sheet in over 250 ms and out over 200 ms, and iOS settles with a spring that never overshoots.
const SLIDE_IN = SlideInDown.duration(250).easing(Easing.out(Easing.cubic));
const SLIDE_OUT = { duration: 200, easing: Easing.in(Easing.quad) };
const SETTLE = { stiffness: 1000, damping: 500, mass: 3, overshootClamping: true };

// Mounted fresh each time the sheet opens, so a sheet dragged shut comes back in place.
function Sheet({ title, label, options, index, tint, header, onChange, onClose }: SheetProps) {
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const dragY = useSharedValue(0);
  const height = useSharedValue(0);

  // Pulling the grabber or title down drags the sheet; the wheel keeps its own scrolling.
  const drag = Gesture.Pan()
    .withTestId('sheet-drag')
    .activeOffsetY([-8, 8])
    .failOffsetX([-16, 16])
    .onUpdate((event) => {
      // Down follows the finger; it never lifts above where it rests.
      dragY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      const far = dragY.value > Math.max(height.value * CLOSE_SHARE, CLOSE_MIN);
      if (!far && event.velocityY < CLOSE_VELOCITY) {
        dragY.value = withSpring(0, SETTLE);
      } else if (reduceMotion) {
        scheduleOnRN(onClose);
      } else {
        dragY.value = withTiming(height.value + insets.bottom, SLIDE_OUT, (finished) => {
          if (finished) scheduleOnRN(onClose);
        });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: dragY.value }] }));
  // The backdrop fades out as the sheet goes down.
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: height.value ? 1 - Math.min(Math.max(dragY.value, 0) / height.value, 1) : 1,
  }));

  return (
    <>
      <Animated.View
        entering={reduceMotion ? undefined : FadeIn.duration(200)}
        style={styles.backdrop}>
        <Animated.View style={[styles.fill, styles.dim, backdropStyle]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onClose}
            style={styles.fill}
          />
        </Animated.View>
      </Animated.View>
      <Animated.View entering={reduceMotion ? undefined : SLIDE_IN}>
        <Animated.View
          accessibilityViewIsModal
          onLayout={(event) => {
            height.value = event.nativeEvent.layout.height;
          }}
          style={[styles.sheet, { paddingBottom: 34 + insets.bottom }, sheetStyle]}>
          <GestureDetector gesture={drag}>
            <View style={styles.handle}>
              <View style={styles.grabber} />
              <View style={styles.header}>
                <Text accessibilityRole="header" style={styles.title}>
                  {title}
                </Text>
                {header}
              </View>
            </View>
          </GestureDetector>
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
      </Animated.View>
    </>
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
  screen: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
  },
  dim: {
    backgroundColor: 'rgba(30, 42, 58, 0.45)',
  },
  fill: {
    flex: 1,
  },
  sheet: {
    gap: 16,
    paddingHorizontal: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.surface,
  },
  // The drag area: the grabber and the title row, the full width of the sheet.
  handle: {
    gap: 16,
    paddingTop: 10,
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
