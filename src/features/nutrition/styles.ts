import { StyleSheet } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  title: { fontFamily: fonts.heading, fontSize: 30, color: colors.text },
  subtitle: { fontFamily: fonts.heading, fontSize: 21, color: colors.text },
  text: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23, color: colors.text },
  muted: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.textMuted },
  error: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.danger },
  input: { fontFamily: fonts.body, fontSize: 16, color: colors.text, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.md, minHeight: 50 },
  group: { gap: spacing.sm },
  card: { gap: spacing.md },
  photo: { width: '100%', borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surfaceMuted },
  link: { paddingVertical: spacing.sm, minHeight: 44, justifyContent: 'center' },
  linkText: { color: colors.primary, fontFamily: fonts.bodySemiBold, fontSize: 15 },
});
