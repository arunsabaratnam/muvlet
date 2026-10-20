import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { colors, fonts, radius, spacing } from '@/constants/theme';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  variant?: 'primary' | 'secondary';
  /** Fill and bottom edge for a primary button, e.g. a coach's colours. */
  color?: { ink: string; shade: string };
};

export function Button({ title, variant = 'primary', color, disabled, ...rest }: ButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        isPrimary && color && { backgroundColor: color.ink, borderBottomColor: color.shade },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      {...rest}>
      <Text
        style={[
          styles.label,
          isPrimary ? styles.primaryLabel : styles.secondaryLabel,
          disabled && styles.disabledLabel,
        ]}>
        {title}
      </Text>
    </Pressable>
  );
}

// Chunky "3D" button from the design: a darker bottom edge that presses down.
const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.button,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    borderBottomWidth: 1,
    transform: [{ translateY: 3 }],
  },
  primary: {
    backgroundColor: colors.primary,
    borderBottomColor: colors.primaryPressed,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
  },
  disabled: {
    backgroundColor: colors.disabled,
    borderBottomColor: colors.disabledEdge,
  },
  label: {
    fontFamily: fonts.bodyExtraBold,
    fontSize: 17,
  },
  primaryLabel: {
    color: colors.onPrimary,
  },
  secondaryLabel: {
    color: colors.text,
  },
  disabledLabel: {
    color: colors.textFaint,
  },
});
