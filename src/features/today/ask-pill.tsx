import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { colors, fonts } from '@/constants/theme';
import type { CoachName } from '@/features/welcome/coach';

import { CoachFace } from './coach-face';
import { Press } from './press';

const FACES: CoachName[] = ['rex', 'axel', 'sage'];
// Small, it's just Rex's face in a circle.
const SMALL = 46;
// Near the top it's always full size.
const NEAR_TOP = 60;
// How far you scroll the other way before it changes.
const TURN = 12;
const SQUEEZE = { duration: 400, easing: Easing.bezier(0.3, 1.2, 0.5, 1) };

type AskPillProps = {
  /** How far Today is scrolled. */
  offset: SharedValue<number>;
  /** True while the floating Start is showing; the pill stays small beside it. */
  crowded: SharedValue<boolean>;
};

/**
 * Ask the team, floating over Today. It gets small while you scroll down and comes back
 * when you scroll up. The chat isn't built yet, so it doesn't open anything.
 */
export function AskPill({ offset, crowded }: AskPillProps) {
  const reduceMotion = useReducedMotion();
  const full = useSharedValue(0);
  const small = useSharedValue(false);
  const squeeze = useSharedValue(0);
  // Where the scrolling last turned around.
  const turn = useSharedValue(0);

  useAnimatedReaction(
    () => ({ y: offset.get(), busy: crowded.get() }),
    ({ y, busy }) => {
      const was = small.get();
      let now = was;
      if (busy) now = true;
      else if (y < NEAR_TOP) now = false;
      else if (was ? y < turn.get() - TURN : y > turn.get() + TURN) now = !was;

      if (now === was) {
        turn.set(was ? Math.max(turn.get(), y) : Math.min(turn.get(), y));
        return;
      }
      turn.set(y);
      small.set(now);
      squeeze.set(reduceMotion ? Number(now) : withTiming(Number(now), SQUEEZE));
    },
    [reduceMotion],
  );

  const pillStyle = useAnimatedStyle(() =>
    full.value ? { width: interpolate(squeeze.value, [0, 1], [full.value, SMALL]) } : {},
  );
  // The word and the faces behind Rex go before the pill finishes shrinking.
  const fadeStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, 1 - squeeze.value * 2),
  }));

  return (
    <Press
      accessibilityRole="button"
      accessibilityLabel="Ask the team"
      accessibilityHint="Coming soon"
      style={styles.float}>
      <Animated.View style={[styles.pill, pillStyle]}>
        <View onLayout={(event) => full.set(event.nativeEvent.layout.width)} style={styles.row}>
          <View style={styles.faces}>
            {FACES.map((coach, index) => (
              <Animated.View
                key={coach}
                style={[styles.face, index > 0 && [styles.behind, fadeStyle]]}>
                <CoachFace coach={coach} size={30} zoom={1.3} tint={colors.surfaceMuted} />
              </Animated.View>
            ))}
          </View>
          <Animated.Text style={[styles.word, fadeStyle]}>Ask</Animated.Text>
        </View>
      </Animated.View>
    </Press>
  );
}

const styles = StyleSheet.create({
  float: {
    position: 'absolute',
    right: 16,
    bottom: 12,
    borderRadius: SMALL / 2,
    boxShadow: '0 8px 22px rgba(20, 30, 50, 0.12)',
  },
  pill: {
    height: SMALL,
    borderRadius: SMALL / 2,
    overflow: 'hidden',
    backgroundColor: colors.text,
  },
  // Laid out at its full width; the pill around it clips it when small.
  row: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 6,
    paddingRight: 14,
  },
  faces: {
    flexDirection: 'row',
  },
  face: {
    borderRadius: 17,
    borderWidth: 2,
    borderColor: colors.text,
  },
  behind: {
    marginLeft: -8,
  },
  word: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 15,
    color: colors.background,
  },
});
