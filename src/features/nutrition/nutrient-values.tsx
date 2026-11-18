import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { nutrientKeys, type Nutrients } from './nutrition';

const labels = { calories: 'Calories (kcal)', protein: 'Protein (g)', carbs: 'Carbs (g)', fat: 'Fat (g)' };
export function NutrientValues({ values }: { values: Nutrients | null }) {
  return <View style={s.grid}>{nutrientKeys.map(key => <View key={key} style={s.tile}>
    <Text style={s.value}>{values ? values[key].toFixed(key === 'calories' ? 0 : 1) : '—'}</Text>
    <Text style={s.label}>{labels[key]}</Text>
  </View>)}</View>;
}
const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: { width: '47%', flexGrow: 1, backgroundColor: colors.surfaceMuted, padding: spacing.md, borderRadius: radius.sm },
  value: { color: colors.primary, fontFamily: fonts.heading, fontSize: 24 },
  label: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 13 },
});
