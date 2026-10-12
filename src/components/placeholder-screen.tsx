import type { ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui';
import { colors, fonts, spacing } from '@/constants/theme';

type PlaceholderScreenProps = {
  title: string;
  children?: ReactNode;
};

/** Temporary screen body until a feature's real UI exists. */
export function PlaceholderScreen({ title, children }: PlaceholderScreenProps) {
  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Card>
        <Text style={styles.body}>Coming soon.</Text>
      </Card>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    fontFamily: fonts.headingHeavy,
    fontSize: 32,
    color: colors.text,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textMuted,
  },
});
