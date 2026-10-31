import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { coachColors } from '@/constants/theme';
import type { CoachName } from '@/features/welcome/coach';

// Still poses of the coaches. Only the coach in the sky is animated.
const STILLS = {
  rex: require('../../../assets/coaches/stills/rex.png'),
  axel: require('../../../assets/coaches/stills/axel.png'),
  sage: require('../../../assets/coaches/stills/sage.png'),
  luna: require('../../../assets/coaches/stills/luna.png'),
};

// A square around each coach's body in their 400 × 380 still: left, top and side.
const FRAME: Record<CoachName, [number, number, number]> = {
  rex: [88, 155, 216],
  axel: [106, 101, 203],
  sage: [101, 170, 188],
  luna: [99, 121, 221],
};

type CoachFaceProps = {
  coach: CoachName;
  size: number;
  /** The circle's colour; the coach's own wash by default. */
  tint?: string;
  /** Above 1 the circle crops the coach closer, below 1 it shows more of them. */
  zoom?: number;
};

/** A coach in a tinted circle that crops them a little, as on the step cards. */
export function CoachFace({ coach, size, tint, zoom }: CoachFaceProps) {
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, backgroundColor: tint ?? coachColors[coach].wash },
      ]}>
      <CoachStill coach={coach} size={size} zoom={zoom} />
    </View>
  );
}

/** A coach in a square of `size`, with no background. */
export function CoachStill({ coach, size, zoom = 1 }: Omit<CoachFaceProps, 'tint'>) {
  const [x, y, frame] = FRAME[coach];
  // Zooming keeps the coach centred and their head the same way down the square.
  const side = frame / zoom;
  const left = x + (frame - side) / 2;
  const top = y + (frame - side) * 0.3;
  const scale = size / side;
  return (
    <View style={[styles.square, { width: size, height: size }]}>
      <Image
        source={STILLS[coach]}
        style={{
          width: 400 * scale,
          height: 380 * scale,
          marginLeft: -left * scale,
          marginTop: -top * scale,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  square: {
    overflow: 'hidden',
  },
});
