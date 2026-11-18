import { useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { colors } from '@/constants/theme';
import { foods, forRow, nutrientKeys, profile, type FoodRow } from './nutrition';
import { NutrientValues } from './nutrient-values';
import { styles as s } from './styles';

const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/œ/g, 'oe');
export function FoodNutrition({ row, onChange, disabled }: {
  row: FoodRow; onChange: (patch: Partial<FoodRow>) => void; disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [portions, setPortions] = useState(false);
  const p = profile(row);
  const calculated = forRow(row);
  const matches = foods.filter(f => normalize(`${f.group} ${f.label} ${f.usdaDescription}`).includes(normalize(query)));
  function choose(foodId: string) {
    onChange({ foodId, custom: {}, grams: '', quantitySource: 'user', portionDescription: null, confirmed: false });
    setOpen(false); setPortions(false);
  }
  return <View style={s.group}>
    <Text style={s.text}>1. Food and preparation</Text>
    <Button title={p?.label ?? (row.foodId === 'custom' ? 'Choose another profile' : 'Choose food, variety and cooking method')}
      variant="secondary" disabled={disabled} onPress={() => { setQuery(row.name); setOpen(true); }} />
    {row.foodId === 'custom' && <>
      <Text style={s.muted}>Copy all four values per 100 g from the label, not per serving.</Text>
      {nutrientKeys.map(key => <View key={key} style={s.group}>
        <Text style={s.text}>{key === 'calories' ? 'Calories (kcal)' : `${key} (g)`} / 100 g</Text>
        <TextInput style={s.input} editable={!disabled} keyboardType="decimal-pad"
          accessibilityLabel={`${key} per 100 grams of ${row.name}`} value={row.custom?.[key] ?? ''}
          onChangeText={value => onChange({ custom: { ...row.custom, [key]: value }, confirmed: false })} />
      </View>)}
    </>}
    {p && <Text style={s.muted}>Per 100 g: {p.per100g.calories} kcal · P {p.per100g.protein} g · C {p.per100g.carbs} g · F {p.per100g.fat} g</Text>}
    {p?.sourceUrl && <Pressable accessibilityRole="link" style={s.link} onPress={() => { void Linking.openURL(p.sourceUrl!).catch(() => {}); }}>
      <Text style={s.linkText}>USDA source</Text>
    </Pressable>}
    <Text style={s.text}>2. Quantity eaten (grams)</Text>
    <TextInput style={s.input} editable={!disabled} keyboardType="decimal-pad" placeholder="Enter grams" placeholderTextColor={colors.textMuted}
      accessibilityLabel={`Grams of ${row.name}`} value={row.grams}
      onChangeText={grams => onChange({ grams, quantitySource: 'user', portionDescription: null, confirmed: false })} />
    <Text style={s.muted}>Use edible weight and match the selected preparation (raw or cooked). The photo does not measure weight.</Text>
    {!!p?.portions?.length && <>
      <Button title={portions ? 'Hide reference portions' : 'Choose a reference portion'} variant="secondary" disabled={disabled} onPress={() => setPortions(!portions)} />
      {portions && <><Text style={s.muted}>USDA average weights. These are estimates, not measurements of your meal.</Text>
        {p.portions.map((part, i) => <Button key={i} title={`${part.description} ≈ ${part.grams} g`} variant="secondary" disabled={disabled}
          onPress={() => { onChange({ grams: String(part.grams), quantitySource: 'reference_portion', portionDescription: part.description, confirmed: false }); setPortions(false); }} />)}
      </>}
    </>}
    {row.quantitySource === 'reference_portion' && <Text style={s.muted}>Reference portion: {row.portionDescription}. Adjust the grams if needed.</Text>}
    {calculated && <NutrientValues values={calculated.values} />}
    <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
      <SafeAreaView style={s.root}><View style={[s.content, { flex: 1 }]}>
        <Text style={s.subtitle}>Nutrition profile</Text>
        <Text style={s.muted}>{foods.length} USDA profiles. Choose the matching food and preparation.</Text>
        <TextInput style={s.input} accessibilityLabel="Search nutrition profiles" value={query} onChangeText={setQuery} placeholder="Search foods" placeholderTextColor={colors.textMuted} />
        <Button title="Show all profiles" variant="secondary" onPress={() => setQuery('')} />
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.group}>
          {matches.map(f => <Button key={f.id} title={`${f.usdaDescription} · ${f.per100g.calories} kcal / 100 g`} variant="secondary" onPress={() => choose(f.id)} />)}
          {!matches.length && <Text style={s.muted}>No matching profile. Clear the search or enter label values.</Text>}
        </ScrollView>
        <Button title="Enter label values per 100 g" variant="secondary" onPress={() => choose('custom')} />
        <Button title="Close" onPress={() => setOpen(false)} />
      </View></SafeAreaView>
    </Modal>
  </View>;
}
