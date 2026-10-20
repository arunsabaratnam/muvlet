import { Children, isValidElement, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BUTTON_HEIGHT = 56;
const ease = Easing.bezier(0.22, 1, 0.36, 1);

/**
 * One step's own part of the screen: its answers below the coach and bubble, and its
 * buttons at the bottom. Each answer section slides in from the right in turn.
 */
export function StepScreen({
  children,
  footer,
  enterDelay = 220,
}: {
  children?: ReactNode;
  footer: ReactNode;
  /** When the first section starts sliding in, in ms. */
  enterDelay?: number;
}) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // Some steps have more than one button, so the answers end wherever the buttons start.
  const [footerHeight, setFooterHeight] = useState(BUTTON_HEIGHT);
  // Same spot as the welcome screen's buttons.
  const footerBottom = 34 + insets.bottom;
  const side = width * 0.06;

  return (
    <View style={styles.screen}>
      <ScrollView
        style={[styles.body, { top: height * 0.3, bottom: footerBottom + footerHeight + 16 }]}
        contentContainerStyle={[styles.sections, { paddingHorizontal: side }]}
        showsVerticalScrollIndicator={false}>
        {Children.toArray(children).map((section, i) => (
          // Keyed by the section, so one coming or going doesn't slide the others in again.
          <Animated.View
            key={isValidElement(section) ? section.key : i}
            entering={slideIn(enterDelay + i * 70, width * 0.26)}>
            {section}
          </Animated.View>
        ))}
      </ScrollView>
      <View
        onLayout={(event) => setFooterHeight(event.nativeEvent.layout.height)}
        style={[styles.footer, { bottom: footerBottom, left: side, right: side }]}>
        {footer}
      </View>
    </View>
  );
}

function slideIn(delay: number, distance: number) {
  return () => {
    'worklet';
    return {
      initialValues: { opacity: 0, transform: [{ translateX: distance }] },
      animations: {
        opacity: withDelay(delay, withTiming(1, { duration: 520, easing: ease })),
        transform: [
          { translateX: withDelay(delay, withTiming(0, { duration: 520, easing: ease })) },
        ],
      },
    };
  };
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  body: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  sections: {
    gap: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  footer: {
    position: 'absolute',
    gap: 10,
  },
});
