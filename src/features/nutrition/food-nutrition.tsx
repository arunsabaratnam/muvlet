import { useState } from 'react';
import { Linking, Pressable, Text, TextInput, View } from 'react-native';
import { colors } from '@/constants/theme';
import { forRow, nutrientKeys, profile, type FoodRow } from './nutrition';
import { NutrientValues } from './nutrient-values';
import { styles as s } from './styles';

export function FoodNutrition({ row, onChange, disabled }: {
  row: FoodRow; onChange: (patch: Partial<FoodRow>) => void; disabled: boolean;
}) {
  const [portions, setPortions] = useState(false);
  const [details, setDetails] = useState(false);
  const p = profile(row);
  const calculated = forRow(row);
  return <View style={s.card}>
    {row.foodId === 'custom' && <>
      <Text style={s.muted}>Nutrition per 100 g, from the food label.</Text>
      {nutrientKeys.map(key => <View key={key} style={s.group}>
        <Text style={s.text}>{key === 'calories' ? 'Calories (kcal)' : `${key} (g)`}</Text>
        <TextInput style={s.input} editable={!disabled} keyboardType="decimal-pad"
          accessibilityLabel={`${key} per 100 grams of ${row.name}`} value={row.custom?.[key] ?? ''}
          onChangeText={value => onChange({ custom: { ...row.custom, [key]: value } })} />
      </View>)}
    </>}
    <Text style={s.text}>Amount eaten</Text>
    <View style={s.amountRow}><TextInput style={[s.input, s.amountInput]} editable={!disabled} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={colors.textMuted}
      accessibilityLabel={`Grams of ${row.name}`} value={row.grams}
      onChangeText={grams => onChange({ grams, quantitySource: 'user', portionDescription: null })} /><Text style={s.subtitle}>g</Text></View>
    <Text style={s.muted}>Enter edible weight. Photos don’t measure portions.</Text>
    {!!p?.portions?.length && <>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: portions }} style={s.link} disabled={disabled} onPress={() => setPortions(!portions)}><Text style={s.linkText}>{portions ? 'Hide portions' : 'Use a reference portion'}</Text></Pressable>
      {portions && <><Text style={s.muted}>Average weights, not measurements of your meal.</Text>
        {p.portions.map((part, i) => <Pressable key={i} accessibilityRole="button" style={s.foodItem} disabled={disabled}
          onPress={() => { onChange({ grams: String(part.grams), quantitySource: 'reference_portion', portionDescription: part.description }); setPortions(false); }}>
          <Text style={[s.text, { flex: 1 }]}>{part.description}</Text><Text style={s.linkText}>≈ {part.grams} g</Text>
        </Pressable>)}
      </>}
    </>}
    {row.quantitySource === 'reference_portion' && <Text style={s.muted}>Estimated portion: {row.portionDescription}</Text>}
    {calculated && <NutrientValues values={calculated.values} />}
    {p && <><Pressable accessibilityRole="button" accessibilityState={{ expanded: details }} style={s.link} onPress={() => setDetails(!details)}><Text style={s.linkText}>Nutrition details {details ? '−' : '+'}</Text></Pressable>
      {details && <><Text style={s.muted}>{p.label}</Text><Text style={s.muted}>Per 100 g: {p.per100g.calories} kcal · P {p.per100g.protein} g · C {p.per100g.carbs} g · F {p.per100g.fat} g</Text>
        {p.sourceUrl && <Pressable accessibilityRole="link" style={s.link} onPress={() => { void Linking.openURL(p.sourceUrl!).catch(() => {}); }}><Text style={s.linkText}>USDA source</Text></Pressable>}
      </>}
    </>}
  </View>;
}
