import { StyleSheet } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  toolbar: { paddingHorizontal: spacing.lg, minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  searchArea: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm },
  footer: { padding: spacing.lg, gap: spacing.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  foodItem: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 56, gap: spacing.md },
  plate: { width: 112, height: 112, borderRadius: 56, borderWidth: 12, borderColor: colors.surface, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  amountInput: { flex: 1, fontSize: 32, minHeight: 80 },
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
