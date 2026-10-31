import { useEffect, useState, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
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
import { scheduleOnRN } from 'react-native-worklets';

import { colors } from '@/constants/theme';

/* A bottom sheet over a dimmed screen. Drag it down by its top, or tap outside, to close it. */

type SheetProps = {
  /** The top of the sheet, under the grabber. Dragging it pulls the sheet down. */
  header: ReactNode;
  children: ReactNode;
  onClose: () => void;
};

export function Sheet({ visible, ...sheet }: SheetProps & { visible: boolean }) {
  // Once `visible` turns false, the sheet stays up until it has slid away.
  const [shown, setShown] = useState(visible);
  if (visible && !shown) setShown(true);

  return (
    <Modal
      transparent
      visible={shown}
      // The sheet does its own quick slide and fade, so nothing native stacks on top.
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={sheet.onClose}>
      {/* Gestures inside a Modal need their own root on Android. */}
      <GestureHandlerRootView style={styles.screen} pointerEvents={visible ? 'auto' : 'none'}>
        <SheetBody {...sheet} closing={!visible} onGone={() => setShown(false)} />
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

type SheetBodyProps = SheetProps & {
  /** Slide away, then call `onGone`. */
  closing: boolean;
  onGone: () => void;
};

// Mounted fresh each time the sheet opens, so a sheet dragged shut comes back in place.
function SheetBody({ header, children, onClose, closing, onGone }: SheetBodyProps) {
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const dragY = useSharedValue(0);
  const height = useSharedValue(0);

  // Pulling the grabber or header down drags the sheet; what's below keeps its own scrolling.
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

  useEffect(() => {
    if (!closing) return;
    if (reduceMotion) {
      onGone();
      return;
    }
    dragY.set(
      withTiming(height.get() + insets.bottom, SLIDE_OUT, (finished) => {
        if (finished) scheduleOnRN(onGone);
      }),
    );
  }, [closing, reduceMotion, dragY, height, insets.bottom, onGone]);

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
      <Animated.View entering={reduceMotion ? undefined : SLIDE_IN} style={styles.limit}>
        <Animated.View
          accessibilityViewIsModal
          onLayout={(event) => {
            height.set(event.nativeEvent.layout.height);
          }}
          style={[styles.sheet, { paddingBottom: 34 + insets.bottom }, sheetStyle]}>
          <GestureDetector gesture={drag}>
            <View style={styles.handle}>
              <View style={styles.grabber} />
              {header}
            </View>
          </GestureDetector>
          {children}
        </Animated.View>
      </Animated.View>
    </>
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
  // A tall sheet stops short of the top, and what's inside scrolls.
  limit: {
    maxHeight: '88%',
  },
  sheet: {
    flexShrink: 1,
    gap: 16,
    paddingHorizontal: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.surface,
  },
  // The drag area: the grabber and the header, the full width of the sheet.
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
});
