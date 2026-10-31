import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const SPRING = { stiffness: 500, damping: 30 };

type PressProps = Omit<PressableProps, 'style'> & { style?: StyleProp<ViewStyle> };

/** A card that sinks a little while pressed and springs back. */
export function Press({ style, onPressIn, onPressOut, ...rest }: PressProps) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPressIn={(event) => {
        if (!reduceMotion) scale.set(withSpring(0.97, SPRING));
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.set(withSpring(1, SPRING));
        onPressOut?.(event);
      }}
      style={[style, pressStyle]}
      {...rest}
    />
  );
}
